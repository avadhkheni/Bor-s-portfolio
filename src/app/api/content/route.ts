import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const RUNTIME_DATA_FILE_PATH = path.join(process.cwd(), "data", "site-data.json");
const FALLBACK_DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "site-data.json");
const AUTH_COOKIE_NAME = "portfolio_admin_session";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "aether-fortress-secure-key-2026";

// Verify session token
function isAuthorized(request: NextRequest): boolean {
  try {
    const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const authHeader = request.headers.get("authorization")?.replace("Bearer ", "");
    const token = sessionCookie || authHeader;

    if (!token || !token.includes(".")) return false;

    const [payloadBase64, signature] = token.split(".");
    if (!payloadBase64 || !signature) return false;

    const expectedSig = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payloadBase64)
      .digest("hex");

    if (signature !== expectedSig) return false;

    const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString("utf-8"));
    if (payload.exp && Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

// Read raw data from disk
async function readRawFile(): Promise<any> {
  try {
    const raw = await fs.readFile(RUNTIME_DATA_FILE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    try {
      const fallback = await fs.readFile(FALLBACK_DATA_FILE_PATH, "utf-8");
      return JSON.parse(fallback);
    } catch {
      return {};
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const data = await readRawFile();

    // Check if requester is an authenticated admin
    const adminAccess = isAuthorized(request);

    // CRITICAL PRIVACY & SECURITY DEFENSE:
    // If not authenticated, strip all sensitive security credentials & API keys
    const sanitizedData = { ...data };

    if (!adminAccess) {
      delete sanitizedData.security;
      if (sanitizedData.cloudStorage) {
        sanitizedData.cloudStorage = {
          provider: sanitizedData.cloudStorage.provider,
          cloudHistory: sanitizedData.cloudStorage.cloudHistory || [],
        };
      }
    }

    return NextResponse.json(sanitizedData);
  } catch (error) {
    console.error("Error reading site data:", error);
    return NextResponse.json({ error: "Failed to load content" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // STRICT AUTHENTICATION DEFENSE: Reject any unauthenticated content modifications
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: "Access Denied: Strict 2FA Admin Authentication Required to modify content." },
        { status: 401 }
      );
    }

    const updatedData = await request.json();

    if (!updatedData || typeof updatedData !== "object") {
      return NextResponse.json({ error: "Invalid data payload" }, { status: 400 });
    }

    // Preserve existing security configuration on disk so content saves don't erase accounts
    const existingData = await readRawFile();
    const mergedData = {
      ...updatedData,
      security: existingData.security || updatedData.security,
    };

    // Ensure data directory exists outside src to avoid triggering dev server reload
    const runtimeDir = path.dirname(RUNTIME_DATA_FILE_PATH);
    await fs.mkdir(runtimeDir, { recursive: true });
    await fs.writeFile(RUNTIME_DATA_FILE_PATH, JSON.stringify(mergedData, null, 2), "utf-8");

    // In production builds, also keep fallback synced
    if (process.env.NODE_ENV === "production") {
      try {
        const fallbackDir = path.dirname(FALLBACK_DATA_FILE_PATH);
        await fs.mkdir(fallbackDir, { recursive: true });
        await fs.writeFile(FALLBACK_DATA_FILE_PATH, JSON.stringify(mergedData, null, 2), "utf-8");
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: "Site content updated successfully",
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error writing site data:", error);
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }
}
