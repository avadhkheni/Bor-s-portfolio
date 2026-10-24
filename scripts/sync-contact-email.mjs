import { MongoClient } from "mongodb";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI is not defined");
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("portfolio");
    const collection = db.collection("site_data");

    const result = await collection.updateOne(
      { _id: "main_portfolio_data" },
      { $set: { "contact.email": "info@artsavvy.co.in" } }
    );

    console.log("MongoDB update result:", result);
    const updated = await collection.findOne({ _id: "main_portfolio_data" });
    console.log("Updated contact email in DB:", updated?.contact?.email);
  } finally {
    await client.close();
  }
}

run().catch(console.error);
