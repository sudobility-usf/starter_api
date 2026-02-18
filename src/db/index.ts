import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";
import * as schema from "./schema";
import { getRequiredEnv } from "../lib/env-helper";

let _client: Sql | null = null;
let _db: PostgresJsDatabase<typeof schema> | null = null;

function getClient(): Sql {
  if (!_client) {
    const connectionString = getRequiredEnv("DATABASE_URL");
    _client = postgres(connectionString);
  }
  return _client;
}

export const db: PostgresJsDatabase<typeof schema> = new Proxy(
  {} as PostgresJsDatabase<typeof schema>,
  {
    get(_, prop) {
      if (!_db) {
        _db = drizzle(getClient(), { schema });
      }
      return (_db as any)[prop];
    },
  }
);

export async function initDatabase() {
  const client = getClient();

  await client`CREATE SCHEMA IF NOT EXISTS starter`;

  await client`
    CREATE TABLE IF NOT EXISTS starter.users (
      firebase_uid VARCHAR(128) PRIMARY KEY,
      email VARCHAR(255),
      display_name VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await client`
    CREATE TABLE IF NOT EXISTS starter.histories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id VARCHAR(128) NOT NULL REFERENCES starter.users(firebase_uid) ON DELETE CASCADE,
      datetime TIMESTAMP NOT NULL,
      value NUMERIC(12, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await client`
    CREATE INDEX IF NOT EXISTS starter_histories_user_idx
    ON starter.histories(user_id)
  `;

  console.log("Database tables initialized");
}

export async function closeDatabase() {
  if (_client) {
    await _client.end();
    _client = null;
    _db = null;
  }
}

export * from "./schema";
