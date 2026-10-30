import fs from "fs";
import path from "path";
import dns from "dns";
import { v2 as cloudinary } from "cloudinary";
import { MongoClient } from "mongodb";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "dh4rilktz";
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "499845731942743";
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "aSiGYecwp8nZzDHanu_98BVphUE";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://artsavvy:pradeep%402002@artsavvy.qkycjx3.mongodb.net/portfolio?retryWrites=true&w=majority";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
});

async function main() {
  console.log("=== STARTING CLOUDINARY MIGRATION ===");

  const mapPath = path.join(process.cwd(), "scripts", "migration-url-map.json");
  const oldMap = fs.existsSync(mapPath) ? JSON.parse(fs.readFileSync(mapPath, "utf-8")) : {};

  // Find all images in public/images2
  const images2Dir = path.join(process.cwd(), "public", "images2");
  const files = fs.existsSync(images2Dir) ? fs.readdirSync(images2Dir) : [];
  console.log(`Found ${files.length} files in public/images2.`);

  const cloudinaryMap = {}; // oldImgbbUrl -> cloudinaryUrl, and localPath -> cloudinaryUrl
  const uploadedUrls = [];

  // Concurrency helper
  let count = 0;
  const total = files.length;

  for (const filename of files) {
    count++;
    const filePath = path.join(images2Dir, filename);
    const localKey = `/images2/${filename}`;
    const oldImgbbUrl = oldMap[localKey];

    const safePublicId = path.basename(filename, path.extname(filename)).replace(/[^a-zA-Z0-9_-]/g, "_");

    console.log(`[${count}/${total}] Uploading ${filename} to Cloudinary...`);
    try {
      const uploadRes = await cloudinary.uploader.upload(filePath, {
        folder: "artsavvy",
        public_id: safePublicId,
        overwrite: true,
        resource_type: "image"
      });

      const cUrl = uploadRes.secure_url;
      cloudinaryMap[localKey] = cUrl;
      if (oldImgbbUrl) {
        cloudinaryMap[oldImgbbUrl] = cUrl;
      }
      uploadedUrls.push(cUrl);
      console.log(`  ✔ Uploaded -> ${cUrl}`);
    } catch (err) {
      console.error(`  ❌ Error uploading ${filename}:`, err.message);
    }
  }

  // Save cloudinary-url-map.json
  const outMapPath = path.join(process.cwd(), "scripts", "cloudinary-url-map.json");
  fs.writeFileSync(outMapPath, JSON.stringify(cloudinaryMap, null, 2), "utf-8");
  console.log(`\nSaved Cloudinary URL map to ${outMapPath} (${Object.keys(cloudinaryMap).length} entries).`);

  // Helper to replace URLs in JSON structures
  function replaceUrls(obj) {
    if (Array.isArray(obj)) {
      return obj.map(replaceUrls);
    } else if (obj && typeof obj === "object") {
      const newObj = {};
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === "string") {
          let updated = v;
          for (const [oldUrl, newUrl] of Object.entries(cloudinaryMap)) {
            if (updated === oldUrl || updated.includes(oldUrl)) {
              updated = updated.split(oldUrl).join(newUrl);
            }
          }
          newObj[k] = updated;
        } else {
          newObj[k] = replaceUrls(v);
        }
      }
      return newObj;
    }
    return obj;
  }

  // 1. Update src/data/site-data.json
  const siteDataPath = path.join(process.cwd(), "src", "data", "site-data.json");
  if (fs.existsSync(siteDataPath)) {
    const raw = JSON.parse(fs.readFileSync(siteDataPath, "utf-8"));
    const updated = replaceUrls(raw);
    updated.cloudStorage = {
      provider: "cloudinary",
      cloudinaryCloudName: CLOUDINARY_CLOUD_NAME,
      cloudinaryApiKey: CLOUDINARY_API_KEY,
      cloudHistory: uploadedUrls
    };
    fs.writeFileSync(siteDataPath, JSON.stringify(updated, null, 2), "utf-8");
    console.log("✔ Updated src/data/site-data.json");
  }

  // 2. Update data/site-data.json if exists
  const runtimeDataPath = path.join(process.cwd(), "data", "site-data.json");
  if (fs.existsSync(runtimeDataPath)) {
    const raw = JSON.parse(fs.readFileSync(runtimeDataPath, "utf-8"));
    const updated = replaceUrls(raw);
    updated.cloudStorage = {
      provider: "cloudinary",
      cloudinaryCloudName: CLOUDINARY_CLOUD_NAME,
      cloudinaryApiKey: CLOUDINARY_API_KEY,
      cloudHistory: uploadedUrls
    };
    fs.writeFileSync(runtimeDataPath, JSON.stringify(updated, null, 2), "utf-8");
    console.log("✔ Updated data/site-data.json");
  }

  // 3. Update MongoDB
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("portfolio");
    const doc = await db.collection("site_data").findOne({ _id: "main_portfolio_data" });

    if (doc) {
      const updatedDoc = replaceUrls(doc);
      updatedDoc.cloudStorage = {
        provider: "cloudinary",
        cloudinaryCloudName: CLOUDINARY_CLOUD_NAME,
        cloudinaryApiKey: CLOUDINARY_API_KEY,
        cloudHistory: uploadedUrls
      };
      await db.collection("site_data").replaceOne(
        { _id: "main_portfolio_data" },
        updatedDoc,
        { upsert: true }
      );
      console.log("✔ Successfully updated MongoDB (main_portfolio_data) with Cloudinary URLs!");
    } else {
      console.warn("⚠️ main_portfolio_data document not found in MongoDB!");
    }
    await client.close();
  } catch (mongoErr) {
    console.error("❌ MongoDB update error:", mongoErr.message);
  }

  // 4. Update code files with hardcoded fallbacks
  const codeFiles = [
    "src/components/ui/zoom-parallax.tsx",
    "src/lib/projects-data.ts",
    "src/lib/default-pages-data.ts",
    "src/components/ui/dynamic-custom-sections.tsx",
    "src/components/ui/page-varieties.tsx",
    "src/app/admin/page.tsx"
  ];

  for (const relPath of codeFiles) {
    const absPath = path.join(process.cwd(), relPath);
    if (!fs.existsSync(absPath)) continue;
    let content = fs.readFileSync(absPath, "utf-8");
    let changed = false;

    for (const [oldUrl, newUrl] of Object.entries(cloudinaryMap)) {
      if (content.includes(oldUrl)) {
        content = content.split(oldUrl).join(newUrl);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(absPath, content, "utf-8");
      console.log(`✔ Replaced ImgBB URLs in ${relPath}`);
    }
  }

  console.log("\n=== CLOUDINARY MIGRATION COMPLETE ===");
}

main().catch(console.error);

