import { MongoClient } from "mongodb";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
const client = new MongoClient(process.env.MONGODB_URI);

async function run() {
  await client.connect();
  const db = client.db("portfolio");
  const collection = db.collection("site_data");
  const doc = await collection.findOne({ _id: "main_portfolio_data" });
  console.log("Document loaded. Has _id?", "_id" in doc);

  try {
    const { _id, ...clean } = doc;
    const res1 = await collection.updateOne({ _id: "main_portfolio_data" }, { $set: clean }, { upsert: true });
    console.log("Update without _id success?", res1.acknowledged);
  } catch (e) {
    console.error("Update without _id failed:", e.message);
  }

  try {
    const res2 = await collection.updateOne({ _id: "main_portfolio_data" }, { $set: doc }, { upsert: true });
    console.log("Update WITH _id success?", res2.acknowledged);
  } catch (e) {
    console.error("Update WITH _id failed:", e.message);
  }

  await client.close();
}

run().catch(console.error);
