import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig, Pool } from "@neondatabase/serverless";

// Use fetch-based approach for serverless environments (no WebSocket needed)
neonConfig.useSecureWebSocket = false;
neonConfig.webSocketConstructor = undefined;
neonConfig.pipelineTLS = false;
neonConfig.pipelineConnect = false;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      `DATABASE_URL is not set. Available env keys: ${Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('POSTGRES')).join(', ') || 'none matching'}`
    );
  }
  const pool = new Pool({ connectionString });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaNeon(pool as any);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
