import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from "./generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// This configuration satisfies the TypeScript requirement for an adapter
const prisma = new PrismaClient({
  adapter: adapter,
  log: ['query', 'info', 'warn', 'error'],
});

export default prisma;