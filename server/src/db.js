import 'dotenv/config';
import pg from 'pg';
import { MongoClient } from 'mongodb';

if (!process.env.DATABASE_URL || !process.env.MONGODB_URI) {
  console.error('Missing DATABASE_URL or MONGODB_URI. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 5
});

const mongoClient = new MongoClient(process.env.MONGODB_URI);
let mongoDb;

export async function connectMongo() {
  await mongoClient.connect();
  mongoDb = mongoClient.db(process.env.MONGODB_DB || 'velora');
  return mongoDb;
}
export function mongo() {
  if (!mongoDb) throw new Error('MongoDB is not connected');
  return mongoDb;
}
