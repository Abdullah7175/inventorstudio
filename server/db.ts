import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';
import { Pool as PgPool } from 'pg';
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Determine if we're using Neon (serverless) or standard PostgreSQL
const isNeonDatabase = process.env.DATABASE_URL.includes('neon.tech') || process.env.DATABASE_URL.includes('neon.db');

let db: ReturnType<typeof neonDrizzle> | ReturnType<typeof pgDrizzle>;

if (isNeonDatabase) {
  // Neon serverless configuration
  neonConfig.webSocketConstructor = ws;
  const neonPool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  db = neonDrizzle({ client: neonPool, schema });
} else {
  // Standard PostgreSQL configuration for local development
  const pgPool = new PgPool({ 
    connectionString: process.env.DATABASE_URL,
    // Local PostgreSQL optimizations
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Increased from 2000ms to 10000ms
    statement_timeout: 30000, // 30 second statement timeout
    query_timeout: 30000, // 30 second query timeout
  });
  
  // Handle connection errors gracefully
  pgPool.on('error', (err) => {
    console.error('PostgreSQL pool error:', err);
  });
  
  // Add connection retry logic
  pgPool.on('connect', (client) => {
    console.log('New PostgreSQL client connected');
  });
  
  pgPool.on('remove', (client) => {
    console.log('PostgreSQL client removed from pool');
  });
  
  db = pgDrizzle(pgPool, { schema });
}

export { db };
export const pool = isNeonDatabase ? undefined : 'pgPool'; // For backwards compatibility