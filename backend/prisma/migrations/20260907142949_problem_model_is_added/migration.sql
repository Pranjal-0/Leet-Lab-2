/*
  Warnings:

  - You are about to drop the column `pssword` on the `User` table. All the data in the column will be lost.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "pssword",
ADD COLUMN     "password" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "problem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "tags" TEXT[],
    "userId" TEXT NOT NULL,
    "example" JSONB NOT NULL,
    "constraints" TEXT NOT NULL,
    "hints" TEXT,
    "editorial" TEXT,
    "testcases" JSONB NOT NULL,
    "codesnippets" JSONB NOT NULL,
    "referencesolution" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "problem" ADD CONSTRAINT "problem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
