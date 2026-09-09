// import { PrismaClient } from "../generated/prisma/index.js";
// import { PrismaPg } from "@prisma/adapter-pg";

// const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
// const globalForPrisma = globalThis;

// export const db = globalForPrisma.prisma || new PrismaClient({ adapter });

// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prisma = db;
// }

import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/index.js";
import dotenv from "dotenv";
dotenv.config();
console.log("DATABASE_URL is:", JSON.stringify(process.env.DATABASE_URL));
const pool = new pg.Pool({
  connectionString: String(process.env.DATABASE_URL || ""),
});
console.log("DATABASE_URL is:", JSON.stringify(process.env.DATABASE_URL));

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis;
export const db = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}