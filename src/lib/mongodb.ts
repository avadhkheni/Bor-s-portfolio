import { MongoClient, Db } from "mongodb";
import dns from "dns";
import { SiteData } from "./site-types";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch {}

const options = {};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.startsWith("mongodb"));
}

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!isMongoConfigured()) return null;
  const uri = process.env.MONGODB_URI || "";

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    if (!clientPromise) {
      client = new MongoClient(uri, options);
      clientPromise = client.connect();
    }
    return clientPromise;
  }
}

export async function getMongoDb(): Promise<Db | null> {
  const client = await getMongoClient();
  if (!client) return null;
  return client.db(process.env.MONGODB_DB_NAME || "portfolio");
}

const COLLECTION_NAME = "site_data";
const DOC_ID = "main_portfolio_data";

interface MongoSiteDoc {
  _id: string;
  [key: string]: unknown;
}

export async function getSiteDataFromMongo(): Promise<SiteData | null> {
  try {
    const db = await getMongoDb();
    if (!db) return null;
    const collection = db.collection<MongoSiteDoc>(COLLECTION_NAME);
    const doc = await collection.findOne({ _id: DOC_ID });
    if (!doc) return null;
    const { _id: _unusedId, ...cleanDoc } = doc;
    return cleanDoc as unknown as SiteData;
  } catch (error) {
    console.error("MongoDB Read Error:", error);
    return null;
  }
}

export async function saveSiteDataToMongo(data: SiteData): Promise<boolean> {
  try {
    const db = await getMongoDb();
    if (!db) return false;
    const collection = db.collection<MongoSiteDoc>(COLLECTION_NAME);
    await collection.updateOne(
      { _id: DOC_ID },
      { $set: data as unknown as Partial<MongoSiteDoc> },
      { upsert: true }
    );
    return true;
  } catch (error) {
    console.error("MongoDB Write Error:", error);
    return false;
  }
}
