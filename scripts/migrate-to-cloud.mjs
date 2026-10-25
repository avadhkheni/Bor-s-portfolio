import fs from "fs";
import path from "path";
import dns from "dns";
import { MongoClient } from "mongodb";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const IMGBB_API_KEY = process.env.IMGBB_API_KEY || "e096040c24517d83096c2bfa306c3cae";
const MONGODB_URI = "mongodb+srv://artsavvy:pradeep%402002@artsavvy.qkycjx3.mongodb.net/portfolio?retryWrites=true&w=majority";

async function uploadToImgBB(filePath, filename) {
  const buffer = fs.readFileSync(filePath);
  const base64 = buffer.toString("base64");

  const formData = new FormData();
  formData.append("image", base64);
  formData.append("name", path.basename(filename, path.extname(filename)));

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: "POST",
    body: formData,
  });

  const json = await res.json();
  if (json.success && json.data?.url) {
    return json.data.url;
  }
  throw new Error(json.error?.message || "Upload failed: " + JSON.stringify(json));
}

async function main() {
  console.log("=== STARTING CLOUD MIGRATION TO IMGBB ===");

  // 1. Fetch current MongoDB document
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db("portfolio");
  const siteDoc = await db.collection("site_data").findOne({ _id: "main_portfolio_data" });

  if (!siteDoc) {
    console.error("Could not find main_portfolio_data in MongoDB!");
    await client.close();
    return;
  }

  // Find all unique /images2/ references
  const uniqueLocalFiles = new Set();
  function findImages(val) {
    if (typeof val === "string" && val.startsWith("/images2/")) {
      uniqueLocalFiles.add(val.replace("/images2/", ""));
    } else if (Array.isArray(val)) {
      val.forEach(findImages);
    } else if (val && typeof val === "object") {
      Object.values(val).forEach(findImages);
    }
  }
  findImages(siteDoc);

  console.log(`Found ${uniqueLocalFiles.size} unique local images to upload to ImgBB.`);

  const urlMap = new Map();
  const uploadedUrls = [];

  let count = 0;
  for (const filename of uniqueLocalFiles) {
    count++;
    const localFilePath = path.join(process.cwd(), "public", "images2", filename);
    if (!fs.existsSync(localFilePath)) {
      console.warn(`[${count}/${uniqueLocalFiles.size}] ⚠️ File not found on disk: ${filename}`);
      continue;
    }

    const localKey = `/images2/${filename}`;
    console.log(`[${count}/${uniqueLocalFiles.size}] Uploading ${filename} (${(fs.statSync(localFilePath).size / 1024).toFixed(1)} KB)...`);

    try {
      const cloudUrl = await uploadToImgBB(localFilePath, filename);
      console.log(`  ✔ Uploaded -> ${cloudUrl}`);
      urlMap.set(localKey, cloudUrl);
      uploadedUrls.push(cloudUrl);
      // Small pause to respect ImgBB rate limits
      await new Promise(r => setTimeout(r, 600));
    } catch (err) {
      console.error(`  ❌ Failed to upload ${filename}:`, err.message);
    }
  }

  console.log(`\nSuccessfully uploaded ${urlMap.size} of ${uniqueLocalFiles.size} images to ImgBB.`);

  // 2. Replace all references in siteDoc
  function replaceUrls(obj) {
    if (Array.isArray(obj)) {
      return obj.map(replaceUrls);
    } else if (obj && typeof obj === "object") {
      const newObj = {};
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === "string" && urlMap.has(v)) {
          newObj[k] = urlMap.get(v);
        } else {
          newObj[k] = replaceUrls(v);
        }
      }
      return newObj;
    }
    return obj;
  }

  const updatedDoc = replaceUrls(siteDoc);

  // Add new uploaded URLs to cloudStorage history
  if (!updatedDoc.cloudStorage) {
    updatedDoc.cloudStorage = { provider: "imgbb", cloudHistory: [] };
  }
  const history = new Set(updatedDoc.cloudStorage.cloudHistory || []);
  uploadedUrls.forEach(u => history.add(u));
  updatedDoc.cloudStorage.cloudHistory = Array.from(history);
  updatedDoc._lastSavedAt = new Date().toISOString();

  // 3. Save to MongoDB
  const { _id, ...cleanData } = updatedDoc;
  await db.collection("site_data").updateOne(
    { _id: "main_portfolio_data" },
    { $set: cleanData },
    { upsert: true }
  );
  await client.close();
  console.log("✔ Live MongoDB updated with cloud URLs!");

  // 4. Save to local fallback files (data/site-data.json & src/data/site-data.json)
  fs.writeFileSync(
    path.join(process.cwd(), "data", "site-data.json"),
    JSON.stringify(cleanData, null, 2),
    "utf-8"
  );
  fs.writeFileSync(
    path.join(process.cwd(), "src", "data", "site-data.json"),
    JSON.stringify(cleanData, null, 2),
    "utf-8"
  );
  console.log("✔ Local fallback JSON files updated with cloud URLs!");

  // 5. Save the migration map to disk for reference
  fs.writeFileSync(
    path.join(process.cwd(), "scripts", "migration-url-map.json"),
    JSON.stringify(Object.fromEntries(urlMap), null, 2),
    "utf-8"
  );
  console.log("✔ Migration map saved to scripts/migration-url-map.json");
  console.log("\n=== CLOUD MIGRATION COMPLETE! ===");
}

main().catch(console.error);
