import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { AdminUser, SecuritySettings, SiteData } from "@/lib/site-types";

const RUNTIME_DATA_PATH = path.join(process.cwd(), "data", "site-data.json");
const FALLBACK_DATA_PATH = path.join(process.cwd(), "src", "data", "site-data.json");
const AUTH_COOKIE_NAME = "portfolio_admin_session";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "aether-fortress-secure-key-2026";

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

async function writeSiteData(data: SiteData): Promise<void> {
  const jsonStr = JSON.stringify(data, null, 2);
  try {
    await fs.mkdir(path.dirname(RUNTIME_DATA_PATH), { recursive: true });
    await fs.writeFile(RUNTIME_DATA_PATH, jsonStr, "utf-8");
  } catch (err) {
    console.error("Failed to write to runtime data path:", err);
  }
}

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const host = request.headers.get("host") || "localhost:3000";
  const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/admin?google_error=${encodeURIComponent(error || "access_denied")}`, request.url)
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/admin?google_error=not_configured", request.url));
  }

  try {
    // 1. Exchange authorization code for access token with Google
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Google token exchange error:", tokenData);
      return NextResponse.redirect(new URL("/admin?google_error=token_exchange_failed", request.url));
    }

    // 2. Fetch real user profile from Google UserInfo endpoint
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userRes.json();
    const verifiedEmail = userData.email?.toLowerCase();

    if (!verifiedEmail) {
      return NextResponse.redirect(new URL("/admin?google_error=no_email_provided", request.url));
    }

    // 3. Authenticate or Register in site-data.json
    const siteData = await readSiteData();
    const security: SecuritySettings = siteData.security || {
      accounts: [],
      maxAccounts: 2,
    };

    let account = security.accounts.find((a) => a.email.toLowerCase() === verifiedEmail);

    if (!account) {
      // If not yet an account, check max accounts limit
      if (security.accounts.length >= 2) {
        return NextResponse.redirect(new URL("/admin?google_error=max_accounts_reached", request.url));
      }

      // Register new administrator account
      const isFirst = security.accounts.length === 0;
      account = {
        id: `admin-google-${Date.now().toString(36)}`,
        email: verifiedEmail,
        passwordHash: crypto.createHmac("sha256", SESSION_SECRET).update(`google-${Date.now()}`).digest("hex"),
        role: isFirst ? "owner" : "admin",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      security.accounts.push(account);
    } else {
      account.lastLogin = new Date().toISOString();
    }

    siteData.security = security;
    await writeSiteData(siteData);

    // 4. Create signed session cookie and redirect directly to Admin Dashboard
    const sessionToken = createSignedSessionToken(verifiedEmail, account.role);
    const response = NextResponse.redirect(new URL("/admin", request.url));

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: any) {
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(
      new URL(`/admin?google_error=${encodeURIComponent(err.message || "auth_failed")}`, request.url)
    );
  }
}
