import { MongoClient } from "mongodb";
import dns from "dns";
import { promises as fs } from "fs";

if (process.platform === "win32") {
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
  } catch {}
}

const uri = process.env.MONGODB_URI || "mongodb+srv://artsavvy:pradeep%402002@artsavvy.qkycjx3.mongodb.net/portfolio?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function run() {
  await client.connect();
  const db = client.db("portfolio");
  const collection = db.collection("site_data");
  
  const raw = await fs.readFile("src/data/site-data.json", "utf-8");
  const json = JSON.parse(raw);

  const res = await collection.updateOne(
    { _id: "main_portfolio_data" },
    { $set: { parallaxImages: json.parallaxImages } }
  );

  console.log("MongoDB parallax update result:", res);
  const updatedDoc = await collection.findOne({ _id: "main_portfolio_data" });
  console.log("Updated Parallax Images in Atlas:");
  updatedDoc?.parallaxImages?.forEach((p, i) => {
    console.log(`Layer ${i + 1}: ${p.src} (${p.alt})`);
  });

  await client.close();
}

run().catch(console.error);
