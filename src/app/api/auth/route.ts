import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { AdminUser, SecuritySettings, SiteData } from "@/lib/site-types";
import { sendOtpEmail } from "@/lib/send-otp-email";

const RUNTIME_DATA_PATH = path.join(process.cwd(), "data", "site-data.json");
const FALLBACK_DATA_PATH = path.join(process.cwd(), "src", "data", "site-data.json");
const AUTH_COOKIE_NAME = "portfolio_admin_session";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "portfolio-secure-session-key-2026";

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

import { isMongoConfigured, getSiteDataFromMongo, saveSiteDataToMongo } from "@/lib/mongodb";

// Read site data safely (from MongoDB or fallback to file)
async function readSiteData(): Promise<SiteData> {
  if (isMongoConfigured()) {
    try {
      const mongoData = await getSiteDataFromMongo();
      if (mongoData && Object.keys(mongoData).length > 0) {
        return mongoData;
      }
    } catch {}
  }

  let fileData: SiteData = {} as SiteData;
  try {
    const raw = await fs.readFile(RUNTIME_DATA_PATH, "utf-8");
    fileData = JSON.parse(raw);
  } catch {
    try {
      const fallback = await fs.readFile(FALLBACK_DATA_PATH, "utf-8");
      fileData = JSON.parse(fallback);
    } catch {
      fileData = {} as SiteData;
    }
  }

  // If MongoDB is configured but empty, seed it with the current data!
  if (isMongoConfigured() && fileData && Object.keys(fileData).length > 0) {
    try {
      await saveSiteDataToMongo(fileData);
    } catch (e) {
      console.warn("MongoDB initial seed failed:", e);
    }
  }

  return fileData;
}

// Write site data safely (to MongoDB and disk)
async function writeSiteData(data: SiteData): Promise<void> {
  // 1. Save to MongoDB if configured
  if (isMongoConfigured()) {
    try {
      await saveSiteDataToMongo(data);
    } catch (err) {
      console.error("Failed to write to MongoDB:", err);
    }
  }

  // 2. Save to local runtime file
  const jsonStr = JSON.stringify(data, null, 2);
  try {
    await fs.mkdir(path.dirname(RUNTIME_DATA_PATH), { recursive: true });
    await fs.writeFile(RUNTIME_DATA_PATH, jsonStr, "utf-8");
  } catch (err) {
    // In serverless/read-only environments, disk write errors are expected and harmless
  }
}

// Rate limiting in-memory store
const failedAttemptsMap: Record<string, { count: number; lockedUntil: number }> = {};

// In-memory OTP store (ensures 2FA works reliably even on read-only serverless filesystems like Vercel)
const inMemoryOtpStore: Record<string, { email: string; code: string; expiresAt: number; attempts?: number }> = {};

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
function createSignedSessionToken(email: string, role: string, name?: string): string {
  const payload = {
    email,
    role,
    name,
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
    let currentUser: { email: string; role: string; name?: string } | null = null;

    if (sessionCookie) {
      const verification = verifySessionToken(sessionCookie);
      if (verification.valid && verification.email) {
        const found = security.accounts.find(
          (a) => a.email.toLowerCase() === verification.email?.toLowerCase()
        );
        if (found) {
          isAuthenticated = true;
          currentUser = { email: found.email, role: found.role, name: found.name };
        }
      }
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const ipLimit = failedAttemptsMap[`ip:${ip}`];
    let clientLockout: { locked: boolean; remainingSeconds?: number; lockedUntil?: number } = { locked: false };
    if (ipLimit && ipLimit.lockedUntil > Date.now()) {
      const remainingSeconds = Math.max(1, Math.ceil((ipLimit.lockedUntil - Date.now()) / 1000));
      clientLockout = {
        locked: true,
        remainingSeconds,
        lockedUntil: ipLimit.lockedUntil,
      };
    }

    return NextResponse.json({
      isAuthenticated,
      currentUser,
      clientLockout,
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
            name: a.name || a.email.split("@")[0],
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

      // Check Rate Limiting Lockout (IP + Email)
      const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
      const isLocalhost = clientIp === "127.0.0.1" || clientIp === "::1" || clientIp === "localhost";
      const emailKey = `email:${cleanEmail}`;
      const ipKey = `ip:${clientIp}`;

      const emailLimit = cleanEmail ? failedAttemptsMap[emailKey] : null;
      const ipLimit = !isLocalhost ? failedAttemptsMap[ipKey] : null;

      // Check if either email or external IP is currently locked out
      const activeLock =
        emailLimit && emailLimit.lockedUntil > Date.now()
          ? emailLimit
          : ipLimit && ipLimit.lockedUntil > Date.now()
          ? ipLimit
          : null;

      if (activeLock) {
        const remainingSeconds = Math.max(1, Math.ceil((activeLock.lockedUntil - Date.now()) / 1000));
        const remainingMins = Math.ceil(remainingSeconds / 60);
        return NextResponse.json(
          {
            success: false,
            error: `Security Lockout: 3 failed attempts reached. Please wait ${remainingMins} minute(s) before trying again.`,
            lockedUntil: activeLock.lockedUntil,
            remainingSeconds,
          },
          { status: 429 }
        );
      }

      // Find Account
      const account = security.accounts.find((a) => a.email.toLowerCase() === cleanEmail);
      const inputHash = hashPassword(password || "");
      const directSha256 = crypto.createHash("sha256").update(password || "").digest("hex");
      const isPasswordValid =
        Boolean(account) &&
        (safeCompare(account!.passwordHash, inputHash) ||
          safeCompare(account!.passwordHash, directSha256) ||
          account!.passwordHash === password);

      if (!isPasswordValid) {
        // Increment failed attempt counter
        const currentEmailFails = (emailLimit?.count || 0) + 1;
        const currentIpFails = !isLocalhost ? (ipLimit?.count || 0) + 1 : 0;
        const highestFails = Math.max(currentEmailFails, currentIpFails);

        if (highestFails >= 3) {
          const lockedUntil = Date.now() + 15 * 60 * 1000; // 15 mins lock
          failedAttemptsMap[emailKey] = {
            count: highestFails,
            lockedUntil,
          };
          if (!isLocalhost) {
            failedAttemptsMap[ipKey] = {
              count: highestFails,
              lockedUntil,
            };
          }
          return NextResponse.json(
            {
              success: false,
              error: "Security Lockout: 3 consecutive failed login attempts. Please wait 15 minutes before trying again.",
              lockedUntil,
              remainingSeconds: 15 * 60,
            },
            { status: 429 }
          );
        } else {
          failedAttemptsMap[emailKey] = {
            count: highestFails,
            lockedUntil: 0,
          };
          if (!isLocalhost) {
            failedAttemptsMap[ipKey] = {
              count: highestFails,
              lockedUntil: 0,
            };
          }
          const attemptsLeft = 3 - highestFails;
          return NextResponse.json(
            {
              success: false,
              error: `Invalid email or password. Attempt ${highestFails} of 3. (${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left before a 15-minute lockout).`,
              attemptsLeft,
              failedAttempts: highestFails,
            },
            { status: 400 }
          );
        }
      }

      // Credentials Valid! Clear any past failed counters immediately
      delete failedAttemptsMap[emailKey];
      delete failedAttemptsMap[ipKey];
      delete failedAttemptsMap[cleanEmail];

      // Generate 6-Digit 2FA OTP Code
      const otpCode = generateOtpCode();
      const otpRecord = {
        email: cleanEmail,
        code: otpCode,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes expiration
      };
      security.activeOtp = otpRecord;
      inMemoryOtpStore[cleanEmail] = otpRecord;

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
      const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
      const emailKey = `email:${cleanEmail}`;
      const ipKey = `ip:${clientIp}`;

      const activeOtp = inMemoryOtpStore[cleanEmail] || security.activeOtp;
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
          delete inMemoryOtpStore[cleanEmail];
          const lockedUntil = Date.now() + 15 * 60 * 1000; // 15 mins lock
          failedAttemptsMap[emailKey] = {
            count: 3,
            lockedUntil,
          };
          failedAttemptsMap[ipKey] = {
            count: 3,
            lockedUntil,
          };
          siteData.security = security;
          await writeSiteData(siteData);
          return NextResponse.json(
            {
              success: false,
              error: "Security Lockout: 3 incorrect OTP attempts. Account locked for 15 minutes.",
              lockedUntil,
              remainingSeconds: 15 * 60,
            },
            { status: 429 }
          );
        } else {
          activeOtp.attempts = attempts;
          siteData.security = security;
          await writeSiteData(siteData);
          const attemptsLeft = 3 - attempts;
          return NextResponse.json(
            {
              success: false,
              error: `Invalid OTP code. Attempt ${attempts} of 3. (${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left before 15-minute lockout).`,
              attemptsLeft,
            },
            { status: 400 }
          );
        }
      }

      // OTP Validated! Clean up OTP & Reset Rate Limit
      delete security.activeOtp;
      delete inMemoryOtpStore[cleanEmail];
      delete failedAttemptsMap[emailKey];
      delete failedAttemptsMap[ipKey];
      delete failedAttemptsMap[cleanEmail];

      // Update lastLogin timestamp
      const accountIndex = security.accounts.findIndex((a) => a.email.toLowerCase() === cleanEmail);
      if (accountIndex !== -1) {
        security.accounts[accountIndex].lastLogin = new Date().toISOString();
      }

      siteData.security = security;
      await writeSiteData(siteData);

      // Create signed secure session token
      const account = security.accounts[accountIndex];
      const userRole = account?.role || "admin";
      const userName = account?.name;
      const sessionToken = createSignedSessionToken(cleanEmail, userRole, userName);

      const response = NextResponse.json({
        success: true,
        message: "2FA Authentication Successful. Welcome back!",
        user: {
          email: cleanEmail,
          role: userRole,
          name: userName,
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
      const { email, password, name } = body;
      const cleanName = (name || "").trim();

      if (security.accounts.length >= 2) {
        return NextResponse.json(
          {
            success: false,
            error: "Security Policy: Maximum limit of 2 Admin Accounts has been reached. No further accounts can be created.",
          },
          { status: 403 }
        );
      }

      if (!cleanName || cleanName.length < 2) {
        return NextResponse.json(
          { success: false, error: "Please enter your full name (minimum 2 characters)." },
          { status: 400 }
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
        name: cleanName,
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
