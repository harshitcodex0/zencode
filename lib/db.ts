//This code will prevent a lot of connections to happen and online one connection will be created
// and will be in use.

import {getPrismaClient} from "@prisma/client/runtime/client";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const pool = new Pool ({
    connectionString: process.env.DATABASE_URL
})

const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma ??  new PrismaClient({
    adapter:adapter
});

if(process.env.NODE_ENV === "production") {
    globalForPrisma.prisma = prisma;
}

