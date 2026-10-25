import fs from "fs";
import dns from "dns";
import { MongoClient } from "mongodb";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const uri = "mongodb+srv://artsavvy:pradeep%402002@artsavvy.qkycjx3.mongodb.net/portfolio?retryWrites=true&w=majority";

async function updateBrand() {
  const c = new MongoClient(uri);
  await c.connect();
  const db = c.db("portfolio");
  await db.collection("site_data").updateOne(
    { _id: "main_portfolio_data" },
    {
      $set: {
        "brand.logoType": "both",
        "brand.logoImage": "",
        "brand.logoHeight": 32,
      },
    }
  );
  await c.close();
  console.log("MongoDB brand updated with logo fields!");

  function updateJson(p) {
    const d = JSON.parse(fs.readFileSync(p, "utf8"));
    if (d.brand) {
      d.brand.logoType = "both";
      d.brand.logoImage = "";
      d.brand.logoHeight = 32;
    }
    fs.writeFileSync(p, JSON.stringify(d, null, 2), "utf8");
  }
  updateJson("data/site-data.json");
  updateJson("src/data/site-data.json");
  console.log("JSON files updated!");
}

updateBrand().catch(console.error);
