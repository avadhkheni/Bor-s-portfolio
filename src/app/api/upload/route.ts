import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const RUNTIME_DATA_FILE_PATH = path.join(process.cwd(), "data", "site-data.json");
const FALLBACK_DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "site-data.json");
const AUTH_COOKIE_NAME = "portfolio_admin_session";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "aether-fortress-secure-key-2026";

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB Limit

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

async function getSiteConfig() {
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

async function saveCloudUrlToHistory(url: string) {
  try {
    const siteData = await getSiteConfig();
    if (!siteData.cloudStorage) {
      siteData.cloudStorage = { provider: "imgbb", cloudHistory: [] };
    }
    if (!siteData.cloudStorage.cloudHistory) {
      siteData.cloudStorage.cloudHistory = [];
    }
    if (!siteData.cloudStorage.cloudHistory.includes(url)) {
      siteData.cloudStorage.cloudHistory.unshift(url);
    }
    await fs.writeFile(RUNTIME_DATA_FILE_PATH, JSON.stringify(siteData, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving cloud history:", err);
  }
}

export async function GET(request: NextRequest) {
  try {
    const siteConfig = await getSiteConfig();
    const cloud = siteConfig?.cloudStorage?.cloudHistory || [];
    const hasImgbbKey = Boolean(
      siteConfig?.cloudStorage?.imgbbApiKey || process.env.IMGBB_API_KEY
    );

    // List locally uploaded files
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    let uploads: string[] = [];
    try {
      const files = await fs.readdir(uploadsDir);
      uploads = files
        .filter((file) => !file.startsWith(".") && ALLOWED_EXTENSIONS.has(path.extname(file).toLowerCase()))
        .map((file) => `/uploads/${file}`);
    } catch {
      uploads = [];
    }

    // Default / stock showcase images from projects
    const stock: string[] = [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop",
    ];

    return NextResponse.json({
      success: true,
      cloud,
      uploads,
      stock,
      hasImgbbKey,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load media" },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. STRICT AUTHENTICATION CHECK
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: "Access Denied: Strict 2FA Admin Authentication Required to upload files." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const customApiKey = formData.get("imgbbApiKey") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 2. FILE SIZE DEFENSE (MAX 10MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds 10MB limit. Please upload a smaller image." },
        { status: 400 }
      );
    }

    // 3. MIME-TYPE & EXTENSION DEFENSE (ANTI-RCE / ANTI-MALWARE)
    const fileExt = path.extname(file.name).toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(file.type) || !ALLOWED_EXTENSIONS.has(fileExt)) {
      return NextResponse.json(
        { error: "Security Violation: Only valid image files (JPG, PNG, WEBP, GIF, SVG) are permitted." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    const siteConfig = await getSiteConfig();
    const apiKey =
      customApiKey ||
      siteConfig?.cloudStorage?.imgbbApiKey ||
      process.env.IMGBB_API_KEY;

    // 4. If ImgBB API Key is available, upload directly to ImgBB Cloud!
    if (apiKey && apiKey.trim().length > 5) {
      try {
        const imgbbForm = new FormData();
        imgbbForm.append("image", base64Image);
        imgbbForm.append("name", path.basename(file.name, fileExt).replace(/[^a-zA-Z0-9_-]/g, ""));

        const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey.trim()}`, {
          method: "POST",
          body: imgbbForm,
        });

        const imgbbJson = await imgbbRes.json();

        if (imgbbRes.ok && imgbbJson.success && imgbbJson.data?.url) {
          const cloudUrl = imgbbJson.data.url;
          await saveCloudUrlToHistory(cloudUrl);

          return NextResponse.json({
            success: true,
            url: cloudUrl,
            displayUrl: imgbbJson.data.display_url || cloudUrl,
            provider: "imgbb",
            filename: file.name,
            size: file.size,
          });
        }
      } catch (cloudErr) {
        console.error("ImgBB upload error:", cloudErr);
      }
    }

    // 5. Local Storage (Strict Path Traversal Sanitization)
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const timestamp = Date.now();
    const safeBaseName = path.basename(file.name, fileExt).replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `${timestamp}-${safeBaseName}${fileExt}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.writeFile(filePath, buffer);
    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      provider: "local",
      filename,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload handler error:", error);
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 });
  }
}
