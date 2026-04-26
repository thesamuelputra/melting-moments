import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

// Lazy initialization — don't create the client at import time
// so that build-time static generation doesn't fail when DATABASE_URL is missing
let _db: PrismaClient | null = null;

function getDb(): PrismaClient {
  if (!_db) {
    _db = globalThis.prismaGlobal ?? prismaClientSingleton();
    if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = _db;
  }
  return _db;
}

// Proxy so existing `db.xyz` calls work unchanged
const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  }
});

export default db
