import fs from "fs";
import path from "path";
import dns from "dns";
import { v2 as cloudinary } from "cloudinary";
import { MongoClient } from "mongodb";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Read .env.local manually to ensure exact environment
const envPath = path.join(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
    const [k, ...v] = trimmed.split("=");
    envVars[k.trim()] = v.join("=").trim().replace(/^["']|["']$/g, "");
  }
}

const CLOUDINARY_CLOUD_NAME = envVars.CLOUDINARY_CLOUD_NAME || "dh4rilktz";
const CLOUDINARY_API_KEY = envVars.CLOUDINARY_API_KEY || "499845731942743";
const CLOUDINARY_API_SECRET = envVars.CLOUDINARY_API_SECRET || "aSiGYecwp8nZzDHanu_98BVphUE";
const MONGODB_URI = envVars.MONGODB_URI || "mongodb+srv://artsavvy:pradeep%402002@artsavvy.qkycjx3.mongodb.net/portfolio?retryWrites=true&w=majority";

console.log("=================================================");
console.log("   ARTSAVVY SYSTEM & INTEGRATION VERIFICATION    ");
console.log("=================================================\n");

let totalErrors = 0;
function logPass(msg) {
  console.log(`  [PASS] ${msg}`);
}
function logFail(msg) {
  totalErrors++;
  console.error(`  [FAIL] ${msg}`);
}

async function run() {
  // --------------------------------------------------------------------------
  // CHECK 1: Cloudinary API Connection & Ping
  // --------------------------------------------------------------------------
  console.log("--- 1. Testing Cloudinary API Connection ---");
  try {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
    const pingRes = await cloudinary.api.ping();
    if (pingRes && pingRes.status === "ok") {
      logPass(`Cloudinary API Connected! Cloud Name: "${CLOUDINARY_CLOUD_NAME}" | Status: ${pingRes.status}`);
    } else {
      logFail(`Cloudinary ping returned unexpected status: ${JSON.stringify(pingRes)}`);
    }
  } catch (err) {
    logFail(`Cloudinary API Error: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // CHECK 2: MongoDB Connection & Data Audit
  // --------------------------------------------------------------------------
  console.log("\n--- 2. Testing MongoDB Connection & Document Integrity ---");
  let mongoDoc = null;
  let mongoClient = null;
  try {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    logPass("Connected to MongoDB Atlas cluster successfully.");

    const db = mongoClient.db("portfolio");
    mongoDoc = await db.collection("site_data").findOne({ _id: "main_portfolio_data" });

    if (!mongoDoc) {
      logFail("Could not find main_portfolio_data document in collection site_data!");
    } else {
      logPass(`Retrieved main_portfolio_data (Hero words: ${mongoDoc.hero?.words?.length}, Parallax images: ${mongoDoc.parallaxImages?.length}, Projects: ${mongoDoc.projects?.length})`);
      logPass(`Cloud Storage Provider in MongoDB: "${mongoDoc.cloudStorage?.provider}"`);

      // Search for any stale ImgBB links in MongoDB document
      const mongoStr = JSON.stringify(mongoDoc);
      const staleImgbbMatches = mongoStr.match(/https?:\/\/(?:i\.)?ibb\.co\/[^\s"'\\]+/g) || [];
      if (staleImgbbMatches.length === 0) {
        logPass("ZERO stale ImgBB URLs in MongoDB main_portfolio_data document.");
      } else {
        logFail(`Found ${staleImgbbMatches.length} stale ImgBB URLs in MongoDB! Examples: ${staleImgbbMatches.slice(0, 3).join(", ")}`);
      }
    }
  } catch (err) {
    logFail(`MongoDB Connection Error: ${err.message}`);
  } finally {
    if (mongoClient) await mongoClient.close();
  }

  // --------------------------------------------------------------------------
  // CHECK 3: Source Code & Local JSON Integrity
  // --------------------------------------------------------------------------
  console.log("\n--- 3. Checking Source Code & Local Files for Stale ImgBB Links ---");
  const siteDataPath = path.join(process.cwd(), "src", "data", "site-data.json");
  const siteDataStr = fs.readFileSync(siteDataPath, "utf-8");
  const siteDataImgbb = siteDataStr.match(/https?:\/\/(?:i\.)?ibb\.co\/[^\s"'\\]+/g) || [];
  if (siteDataImgbb.length === 0) {
    logPass("ZERO stale ImgBB URLs in src/data/site-data.json.");
  } else {
    logFail(`Found ${siteDataImgbb.length} stale ImgBB URLs in src/data/site-data.json!`);
  }

  // Scan all active TS/TSX source files in src/
  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let files = [];
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        files = files.concat(scanDir(full));
      } else if (e.name.endsWith(".ts") || e.name.endsWith(".tsx")) {
        files.push(full);
      }
    }
    return files;
  }

  const allSrcFiles = scanDir(path.join(process.cwd(), "src"));
  let staleCodeCount = 0;
  for (const f of allSrcFiles) {
    const code = fs.readFileSync(f, "utf-8");
    const matches = code.match(/https?:\/\/(?:i\.)?ibb\.co\/[^\s"'\\]+/g) || [];
    if (matches.length > 0) {
      staleCodeCount += matches.length;
      logFail(`Stale ImgBB URL in ${path.relative(process.cwd(), f)}: ${matches[0]}`);
    }
  }
  if (staleCodeCount === 0) {
    logPass(`ZERO stale ImgBB URLs across all ${allSrcFiles.length} source code files in src/.`);
  }

  // --------------------------------------------------------------------------
  // CHECK 4: Live HTTP 200 Verification for Every Image Path
  // --------------------------------------------------------------------------
  console.log("\n--- 4. Validating Direct Cloudinary HTTP Responses for All Site Images ---");

  // Collect all distinct Cloudinary URLs from MongoDB and site-data.json
  const allCloudinaryUrls = new Set();
  const cMatches1 = (siteDataStr.match(/https:\/\/res\.cloudinary\.com\/[^\s"'\\]+/g) || []);
  cMatches1.forEach(u => allCloudinaryUrls.add(u));

  if (mongoDoc) {
    const cMatches2 = (JSON.stringify(mongoDoc).match(/https:\/\/res\.cloudinary\.com\/[^\s"'\\]+/g) || []);
    cMatches2.forEach(u => allCloudinaryUrls.add(u));
  }

  console.log(`Found ${allCloudinaryUrls.size} unique Cloudinary image paths to verify directly...`);

  let verifiedCount = 0;
  let failedUrls = [];

  for (const url of allCloudinaryUrls) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.status === 200) {
        verifiedCount++;
      } else {
        failedUrls.push({ url, status: res.status });
      }
    } catch (err) {
      failedUrls.push({ url, error: err.message });
    }
  }

  if (failedUrls.length === 0) {
    logPass(`All ${verifiedCount}/${allCloudinaryUrls.size} Cloudinary images responded with HTTP 200 OK directly!`);
  } else {
    logFail(`${failedUrls.length} image URLs failed to load! Example: ${JSON.stringify(failedUrls[0])}`);
  }

  // Verify the Parallax 7 images specifically
  const siteDataJson = JSON.parse(siteDataStr);
  console.log("\n--- 5. Checking ZoomParallax 7 Core Showcase Images Specifically ---");
  const parallaxImages = siteDataJson.parallaxImages || [];
  logPass(`ZoomParallax has ${parallaxImages.length} images configured:`);
  for (let i = 0; i < parallaxImages.length; i++) {
    const p = parallaxImages[i];
    const isCloudinary = p.src.includes("res.cloudinary.com");
    if (isCloudinary) {
      logPass(`  Layer ${i + 1} (${p.alt}): ${p.src.split("/").slice(-2).join("/")} -> Direct Cloudinary CDN ✔`);
    } else {
      logFail(`  Layer ${i + 1} is NOT on Cloudinary: ${p.src}`);
    }
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log("\n=================================================");
  if (totalErrors === 0) {
    console.log("   🎉 ALL VERIFICATIONS PASSED WITH 0 ERRORS!    ");
    console.log("   All connections, APIs, and image paths are    ");
    console.log("   100% direct, valid, and healthy.              ");
  } else {
    console.log(`   ❌ FOUND ${totalErrors} ISSUES TO INVESTIGATE.`);
  }
  console.log("=================================================\n");
}

run().catch(console.error);

