import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const RUNTIME_DATA_FILE_PATH = path.join(process.cwd(), "data", "site-data.json");
const FALLBACK_DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "site-data.json");
const AUTH_COOKIE_NAME = "portfolio_admin_session";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "portfolio-secure-session-key-2026";

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

import { isMongoConfigured, getSiteDataFromMongo, saveSiteDataToMongo } from "@/lib/mongodb";

// Read raw data from disk or MongoDB
async function getEffectiveSiteData(): Promise<any> {
  if (isMongoConfigured()) {
    const mongoData = await getSiteDataFromMongo();
    if (mongoData && Object.keys(mongoData).length > 0) {
      return mongoData;
    }
  }

  // Fallback to local files
  const fileData = await readRawFile();
  return fileData;
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
    const data = await getEffectiveSiteData();

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

    return NextResponse.json(sanitizedData, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "CDN-Cache-Control": "no-store",
        "Vercel-CDN-Cache-Control": "no-store",
      },
    });
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

    // Preserve existing security configuration so content saves don't erase accounts
    const existingData = await getEffectiveSiteData();
    const mergedData = {
      ...updatedData,
      security: existingData?.security || updatedData.security,
      _lastModified: Date.now(),
    };

    let mongoSaved = false;
    let mongoError: string | null = null;

    // 1. If MongoDB is configured, save to MongoDB Cloud!
    if (isMongoConfigured()) {
      try {
        mongoSaved = await saveSiteDataToMongo(mergedData);
        if (!mongoSaved) {
          mongoError = "MongoDB write failed. Please check MongoDB Atlas IP Access List (ensure 0.0.0.0/0 is whitelisted).";
        }
      } catch (err: any) {
        mongoError = err.message || "MongoDB write error";
      }
    }

    // 2. Keep runtime disk file synced (local development / ephemeral fallback)
    let diskSaved = false;
    try {
      const runtimeDir = path.dirname(RUNTIME_DATA_FILE_PATH);
      await fs.mkdir(runtimeDir, { recursive: true });
      await fs.writeFile(RUNTIME_DATA_FILE_PATH, JSON.stringify(mergedData, null, 2), "utf-8");
      diskSaved = true;
    } catch {}

    // 3. Keep fallback git repository file synced
    try {
      const fallbackDir = path.dirname(FALLBACK_DATA_FILE_PATH);
      await fs.mkdir(fallbackDir, { recursive: true });
      await fs.writeFile(FALLBACK_DATA_FILE_PATH, JSON.stringify(mergedData, null, 2), "utf-8");
    } catch {}

    // Check if persistence actually succeeded
    const isProduction = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
    if (isProduction && isMongoConfigured() && !mongoSaved) {
      console.error("CRITICAL: Failed to persist to MongoDB in production:", mongoError);
      return NextResponse.json(
        {
          success: false,
          error: mongoError || "Database save failed: MongoDB Atlas rejected connection. Please ensure IP 0.0.0.0/0 (Anywhere) is whitelisted in MongoDB Atlas -> Network Access.",
          savedToMongo: false,
          savedToDisk: diskSaved,
        },
        { status: 500 }
      );
    }

    // 4. Force immediate on-demand cache purge so live pages reflect changes immediately
    try {
      revalidatePath("/", "layout");
      revalidatePath("/admin");
      revalidatePath("/p/[slug]", "page");
    } catch {}

    return NextResponse.json(
      {
        success: true,
        message: "Site content updated successfully",
        savedToMongo: mongoSaved,
        savedToDisk: diskSaved,
        timestamp: Date.now(),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Error writing site data:", error);
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }
}
