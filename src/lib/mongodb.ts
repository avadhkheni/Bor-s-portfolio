import { MongoClient, Db } from "mongodb";
import dns from "dns";
import { SiteData } from "./site-types";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {}

const DEFAULT_MONGODB_URI =
  "mongodb+srv://artsavvy:pradeep%402002@artsavvy.qkycjx3.mongodb.net/portfolio?retryWrites=true&w=majority";

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 4000,
  connectTimeoutMS: 6000,
  socketTimeoutMS: 30000,
};

let cachedClient: MongoClient | null = null;
let lastFailTime = 0;
const FAIL_COOLDOWN_MS = 10000; // 10s cooldown before retrying if server is completely rejecting connections

export function getMongoUri(): string {
  return process.env.MONGODB_URI || DEFAULT_MONGODB_URI;
}

export function isMongoConfigured(): boolean {
  const uri = getMongoUri();
  return Boolean(uri && uri.startsWith("mongodb"));
}

export async function getMongoClient(): Promise<MongoClient | null> {
  const uri = getMongoUri();
  if (!uri) return null;

  try {
    if (cachedClient) {
      try {
        await cachedClient.db("admin").command({ ping: 1 });
        return cachedClient;
      } catch {
        try {
          await cachedClient.close();
        } catch {}
        cachedClient = null;
      }
    }

    // Cooldown check to avoid locking up serverless invocations if Atlas is unreachable
    if (Date.now() - lastFailTime < FAIL_COOLDOWN_MS) {
      return null;
    }

    const c = new MongoClient(uri, options);
    await c.connect();
    cachedClient = c;
    lastFailTime = 0;
    return cachedClient;
  } catch (error) {
    lastFailTime = Date.now();
    console.error("MongoDB Connection Failed:", error);
    cachedClient = null;
    return null;
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
    if (!db) {
      console.error("MongoDB Save Error: No database client available.");
      return false;
    }
    const collection = db.collection<MongoSiteDoc>(COLLECTION_NAME);
    const { _id, ...cleanData } = (data || {}) as unknown as Record<string, unknown>;
    const res = await collection.updateOne(
      { _id: DOC_ID },
      { $set: cleanData as Partial<MongoSiteDoc> },
      { upsert: true }
    );
    return Boolean(res.acknowledged);
  } catch (error) {
    console.error("MongoDB Write Error:", error);
    return false;
  }
}
