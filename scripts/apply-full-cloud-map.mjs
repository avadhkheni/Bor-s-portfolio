import fs from "fs";
import dns from "dns";
import { MongoClient } from "mongodb";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mapRaw = fs.readFileSync("scripts/migration-url-map.json", "utf8");
const urlMap = new Map(Object.entries(JSON.parse(mapRaw)));

const uri = "mongodb+srv://artsavvy:pradeep%402002@artsavvy.qkycjx3.mongodb.net/portfolio?retryWrites=true&w=majority";

async function fixAll() {
  const c = new MongoClient(uri);
  await c.connect();
  const db = c.db("portfolio");
  const doc = await db.collection("site_data").findOne({ _id: "main_portfolio_data" });

  function replaceAll(val) {
    if (typeof val === "string" && urlMap.has(val)) {
      return urlMap.get(val);
    }
    if (Array.isArray(val)) {
      return val.map(replaceAll);
    }
    if (val && typeof val === "object") {
      const res = {};
      for (const [k, v] of Object.entries(val)) {
        res[k] = replaceAll(v);
      }
      return res;
    }
    return val;
  }

  const updated = replaceAll(doc);
  const { _id, ...clean } = updated;
  clean._lastSavedAt = new Date().toISOString();

  await db.collection("site_data").updateOne(
    { _id: "main_portfolio_data" },
    { $set: clean }
  );
  await c.close();

  fs.writeFileSync("data/site-data.json", JSON.stringify(clean, null, 2), "utf8");
  fs.writeFileSync("src/data/site-data.json", JSON.stringify(clean, null, 2), "utf8");

  console.log("✔ All arrays and objects replaced successfully in MongoDB & JSON files!");

  const raw = JSON.stringify(clean);
  const remainingLocal = (raw.match(/\/images2\//g) || []).length;
  console.log("Remaining /images2/ references:", remainingLocal);
}

fixAll().catch(console.error);
