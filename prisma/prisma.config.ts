// prisma/prisma.config.ts
import { PrismaClient } from "@/app/generated/prisma/client";

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});