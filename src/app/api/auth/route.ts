import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { AdminUser, SecuritySettings, SiteData } from "@/lib/site-types";
import { sendOtpEmail } from "@/lib/send-otp-email";

const RUNTIME_DATA_PATH = path.join(process.cwd(), "data", "site-data.json");
const FALLBACK_DATA_PATH = path.join(process.cwd(), "src", "data", "site-data.json");
const AUTH_COOKIE_NAME = "portfolio_admin_session";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "aether-fortress-secure-key-2026";

// SHA-256 Password Hasher with Salt
function hashPassword(password: string): string {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(password)
    .digest("hex");
}

// Constant-time string comparison to prevent side-channel timing attacks
function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// Generate 6-digit OTP code
function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Read site data safely
async function readSiteData(): Promise<SiteData> {
  try {
    const raw = await fs.readFile(RUNTIME_DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    try {
      const fallback = await fs.readFile(FALLBACK_DATA_PATH, "utf-8");
      return JSON.parse(fallback);
    } catch {
      return {} as SiteData;
    }
  }
}

// Write site data safely
async function writeSiteData(data: SiteData): Promise<void> {
  const jsonStr = JSON.stringify(data, null, 2);
  try {
    await fs.mkdir(path.dirname(RUNTIME_DATA_PATH), { recursive: true });
    await fs.writeFile(RUNTIME_DATA_PATH, jsonStr, "utf-8");
  } catch (err) {
    console.error("Failed to write to runtime data path:", err);
  }
}

// Rate limiting in-memory store
const failedAttemptsMap: Record<string, { count: number; lockedUntil: number }> = {};

// Verify session token
function verifySessionToken(token: string): { valid: boolean; email?: string } {
  try {
    const [payloadBase64, signature] = token.split(".");
    if (!payloadBase64 || !signature) return { valid: false };

    const expectedSig = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payloadBase64)
      .digest("hex");

    if (signature !== expectedSig) return { valid: false };

    const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString("utf-8"));
    if (payload.exp && Date.now() > payload.exp) {
      return { valid: false };
    }

    return { valid: true, email: payload.email };
  } catch {
    return { valid: false };
  }
}

// Create signed session token (7 days expiry)
function createSignedSessionToken(email: string, role: string): string {
  const payload = {
    email,
    role,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadBase64)
    .digest("hex");

  return `${payloadBase64}.${signature}`;
}

// GET: Check Auth Status & Accounts
export async function GET(request: NextRequest) {
  try {
    const siteData = await readSiteData();
    const security: SecuritySettings = siteData.security || {
      accounts: [],
      maxAccounts: 2,
    };

    const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    let isAuthenticated = false;
    let currentUser: { email: string; role: string } | null = null;

    if (sessionCookie) {
      const verification = verifySessionToken(sessionCookie);
      if (verification.valid && verification.email) {
        const found = security.accounts.find(
          (a) => a.email.toLowerCase() === verification.email?.toLowerCase()
        );
        if (found) {
          isAuthenticated = true;
          currentUser = { email: found.email, role: found.role };
        }
      }
    }

    return NextResponse.json({
      isAuthenticated,
      currentUser,
      totalAccounts: security.accounts.length,
      maxAccounts: 2,
      isRegistrationLocked: security.accounts.length >= 2,
      hasSmtpConfigured: Boolean(security.smtp?.user && security.smtp?.pass),
      hasGoogleConfigured: Boolean(
        (process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) &&
        process.env.GOOGLE_CLIENT_SECRET
      ),
      smtpConfig: security.smtp
        ? {
            service: security.smtp.service || "gmail",
            user: security.smtp.user,
            host: security.smtp.host || "smtp.gmail.com",
            port: security.smtp.port || 465,
            fromName: security.smtp.fromName || "Studio Security",
          }
        : null,
      accountsSummary: isAuthenticated
        ? security.accounts.map((a) => ({
            id: a.id,
            email: a.email,
            role: a.role,
            createdAt: a.createdAt,
            lastLogin: a.lastLogin,
          }))
        : undefined,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Auth Actions (Request OTP, Verify OTP, Register, Change Password, Logout, Save SMTP, Test SMTP)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, otp, role, newPassword, accountId, smtpSettings } = body;
    const cleanEmail = (email || "").trim().toLowerCase();

    const siteData = await readSiteData();
    let security: SecuritySettings = siteData.security || {
      accounts: [],
      maxAccounts: 2,
    };

    // If no accounts exist at all, create default owner account if requested or notify
    const hasAccounts = security.accounts && security.accounts.length > 0;

    // -------------------------------------------------------------------------
    // ACTION 1: REQUEST LOGIN OTP (Step 1 of 2FA)
    // -------------------------------------------------------------------------
    if (action === "request_otp") {
      if (!hasAccounts) {
        return NextResponse.json({
          success: false,
          needsSetup: true,
          message: "No admin accounts exist yet. Please create your primary Admin Account.",
        });
      }

      // Check Rate Limiting Lockout
      const rateLimit = failedAttemptsMap[cleanEmail];
      if (rateLimit && rateLimit.lockedUntil > Date.now()) {
        const remainingMins = Math.ceil((rateLimit.lockedUntil - Date.now()) / 60000);
        return NextResponse.json(
          {
            success: false,
            error: `Security Lockout: Too many failed login attempts. Please wait ${remainingMins} minute(s).`,
          },
          { status: 429 }
        );
      }

      // Find Account
      const account = security.accounts.find((a) => a.email.toLowerCase() === cleanEmail);
      const inputHash = hashPassword(password || "");

      if (!account || !safeCompare(account.passwordHash, inputHash)) {
        // Increment failed attempt counter
        const currentFails = (rateLimit?.count || 0) + 1;
        if (currentFails >= 5) {
          failedAttemptsMap[cleanEmail] = {
            count: currentFails,
            lockedUntil: Date.now() + 15 * 60 * 1000, // 15 mins lock
          };
          return NextResponse.json(
            {
              success: false,
              error: "Account temporarily locked for 15 minutes due to 5 consecutive failed attempts.",
            },
            { status: 429 }
          );
        } else {
          failedAttemptsMap[cleanEmail] = {
            count: currentFails,
            lockedUntil: 0,
          };
          return NextResponse.json(
            {
              success: false,
              error: `Invalid email or password. Attempt ${currentFails} of 5.`,
            },
            { status: 400 }
          );
        }
      }

      // Credentials Valid! Generate 6-Digit 2FA OTP Code
      const otpCode = generateOtpCode();
      security.activeOtp = {
        email: cleanEmail,
        code: otpCode,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes expiration
      };

      siteData.security = security;
      await writeSiteData(siteData);

      // Dispatch Real Email via Nodemailer
      const emailResult = await sendOtpEmail(cleanEmail, otpCode, security.smtp);

      return NextResponse.json({
        success: true,
        step: "otp_required",
        message: emailResult.delivered
          ? `Real 2FA OTP verification code sent to your email (${cleanEmail})! Please check your inbox.`
          : "2FA Code generated. (Add your Gmail App Password in Admin Security to send real emails to your inbox).",
        email: cleanEmail,
        emailDelivered: emailResult.delivered,
        otpPreview: !emailResult.delivered ? otpCode : undefined,
        expiresInSeconds: 300,
      });
    }

    // -------------------------------------------------------------------------
    // ACTION 2: VERIFY 2FA OTP CODE (Step 2 of 2FA)
    // -------------------------------------------------------------------------
    if (action === "verify_otp") {
      const activeOtp = security.activeOtp;
      if (!activeOtp || activeOtp.email.toLowerCase() !== cleanEmail) {
        return NextResponse.json(
          { success: false, error: "No active OTP request found. Please request a new OTP code." },
          { status: 400 }
        );
      }

      if (Date.now() > activeOtp.expiresAt) {
        return NextResponse.json(
          { success: false, error: "OTP code has expired. Please request a new code." },
          { status: 400 }
        );
      }

      const cleanOtp = (otp || "").trim();
      if (!safeCompare(cleanOtp, activeOtp.code)) {
        const attempts = (activeOtp.attempts || 0) + 1;
        if (attempts >= 3) {
          delete security.activeOtp;
          siteData.security = security;
          await writeSiteData(siteData);
          return NextResponse.json(
            {
              success: false,
              error: "Security Lockout: 3 incorrect OTP attempts. This verification code has been permanently invalidated. Please request a new code.",
            },
            { status: 400 }
          );
        } else {
          activeOtp.attempts = attempts;
          siteData.security = security;
          await writeSiteData(siteData);
          return NextResponse.json(
            {
              success: false,
              error: `Invalid OTP code. Attempt ${attempts} of 3 before code invalidation.`,
            },
            { status: 400 }
          );
        }
      }

      // OTP Validated! Clean up OTP & Reset Rate Limit
      delete security.activeOtp;
      delete failedAttemptsMap[cleanEmail];

      // Update lastLogin timestamp
      const accountIndex = security.accounts.findIndex((a) => a.email.toLowerCase() === cleanEmail);
      if (accountIndex !== -1) {
        security.accounts[accountIndex].lastLogin = new Date().toISOString();
      }

      siteData.security = security;
      await writeSiteData(siteData);

      // Create signed secure session token
      const userRole = security.accounts[accountIndex]?.role || "admin";
      const sessionToken = createSignedSessionToken(cleanEmail, userRole);

      const response = NextResponse.json({
        success: true,
        message: "2FA Authentication Successful. Welcome back!",
        user: {
          email: cleanEmail,
          role: userRole,
        },
      });

      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    // -------------------------------------------------------------------------
    // ACTION 3: REGISTER NEW ADMIN ACCOUNT (STRICT MAX 2 ACCOUNTS ENFORCED)
    // -------------------------------------------------------------------------
    if (action === "register") {
      if (security.accounts.length >= 2) {
        return NextResponse.json(
          {
            success: false,
            error: "Security Policy: Maximum limit of 2 Admin Accounts has been reached. No further accounts can be created.",
          },
          { status: 403 }
        );
      }

      if (!cleanEmail || !cleanEmail.includes("@")) {
        return NextResponse.json(
          { success: false, error: "Please enter a valid Gmail / Email address." },
          { status: 400 }
        );
      }

      if (!password || password.length < 6) {
        return NextResponse.json(
          { success: false, error: "Password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      // Check if email already registered
      const existing = security.accounts.find((a) => a.email.toLowerCase() === cleanEmail);
      if (existing) {
        return NextResponse.json(
          { success: false, error: "An account with this email already exists." },
          { status: 400 }
        );
      }

      const isFirstAccount = security.accounts.length === 0;
      const newAdmin: AdminUser = {
        id: `admin-${Date.now().toString(36)}`,
        email: cleanEmail,
        passwordHash: hashPassword(password),
        role: isFirstAccount ? "owner" : (role || "admin"),
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      security.accounts.push(newAdmin);

      // Generate 2FA OTP for initial registration
      const otpCode = generateOtpCode();
      security.activeOtp = {
        email: cleanEmail,
        code: otpCode,
        expiresAt: Date.now() + 5 * 60 * 1000,
      };

      siteData.security = security;
      await writeSiteData(siteData);

      // Dispatch Real Email via Nodemailer
      const emailResult = await sendOtpEmail(cleanEmail, otpCode, security.smtp);

      return NextResponse.json({
        success: true,
        step: "otp_required",
        message: emailResult.delivered
          ? `Admin Account created! Real 2FA OTP sent to ${cleanEmail}. Check your inbox.`
          : `Admin Account #${security.accounts.length} created! (Configure your Gmail App Password in Admin Security to send emails to your inbox).`,
        email: cleanEmail,
        emailDelivered: emailResult.delivered,
        otpPreview: !emailResult.delivered ? otpCode : undefined,
        totalAccounts: security.accounts.length,
        maxAccounts: 2,
      });
    }

    // -------------------------------------------------------------------------
    // ACTION 4: DELETE ADMIN ACCOUNT
    // -------------------------------------------------------------------------
    if (action === "delete_account") {
      const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
      if (!sessionCookie || !verifySessionToken(sessionCookie).valid) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      if (security.accounts.length <= 1) {
        return NextResponse.json(
          { success: false, error: "Cannot delete the only remaining admin account." },
          { status: 400 }
        );
      }

      security.accounts = security.accounts.filter((a) => a.id !== accountId && a.email.toLowerCase() !== cleanEmail);
      siteData.security = security;
      await writeSiteData(siteData);

      return NextResponse.json({
        success: true,
        message: "Admin account removed successfully.",
        totalAccounts: security.accounts.length,
      });
    }

    // -------------------------------------------------------------------------
    // ACTION 5: CHANGE PASSWORD
    // -------------------------------------------------------------------------
    if (action === "change_password") {
      const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
      if (!sessionCookie || !verifySessionToken(sessionCookie).valid) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: "New password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      const accIdx = security.accounts.findIndex((a) => a.email.toLowerCase() === cleanEmail);
      if (accIdx === -1) {
        return NextResponse.json({ success: false, error: "Account not found." }, { status: 404 });
      }

      security.accounts[accIdx].passwordHash = hashPassword(newPassword);
      siteData.security = security;
      await writeSiteData(siteData);

      return NextResponse.json({
        success: true,
        message: "Password updated successfully!",
      });
    }

    // -------------------------------------------------------------------------
    // ACTION 6: SAVE SMTP EMAIL CREDENTIALS (FOR REAL EMAIL INBOX DELIVERY)
    // -------------------------------------------------------------------------
    if (action === "save_smtp") {
      const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
      if (!sessionCookie || !verifySessionToken(sessionCookie).valid) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      if (!smtpSettings || !smtpSettings.user || !smtpSettings.pass) {
        return NextResponse.json(
          { success: false, error: "Sender email and App Password are required." },
          { status: 400 }
        );
      }

      security.smtp = {
        service: smtpSettings.service || "gmail",
        host: smtpSettings.host || "smtp.gmail.com",
        port: Number(smtpSettings.port) || 465,
        secure: smtpSettings.port === 587 ? false : true,
        user: (smtpSettings.user || "").trim(),
        pass: (smtpSettings.pass || "").trim(),
        fromName: smtpSettings.fromName || "Studio Security",
      };

      siteData.security = security;
      await writeSiteData(siteData);

      return NextResponse.json({
        success: true,
        message: "SMTP Email credentials saved! Real OTPs will now be delivered directly to user inboxes.",
      });
    }

    // -------------------------------------------------------------------------
    // ACTION 7: TEST SMTP EMAIL CONNECTION
    // -------------------------------------------------------------------------
    if (action === "test_smtp") {
      const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
      const verify = verifySessionToken(sessionCookie || "");
      if (!sessionCookie || !verify.valid) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      const targetEmail = cleanEmail || verify.email || security.accounts[0]?.email;
      if (!targetEmail) {
        return NextResponse.json({ success: false, error: "Target email not specified" }, { status: 400 });
      }

      const testCode = generateOtpCode();
      const testResult = await sendOtpEmail(targetEmail, testCode, security.smtp);

      if (testResult.delivered) {
        return NextResponse.json({
          success: true,
          message: `Test email successfully delivered to ${targetEmail}! Code was ${testCode}.`,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: testResult.message || testResult.error || "Failed to send test email.",
          },
          { status: 400 }
        );
      }
    }

    // -------------------------------------------------------------------------
    // ACTION 8: LOGOUT
    // -------------------------------------------------------------------------
    if (action === "logout") {
      const response = NextResponse.json({
        success: true,
        message: "Logged out successfully.",
      });

      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: "",
        httpOnly: true,
        path: "/",
        maxAge: 0,
      });

      return response;
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
