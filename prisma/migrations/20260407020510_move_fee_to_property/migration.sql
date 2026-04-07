/*
  Warnings:

  - You are about to drop the column `feeAmount` on the `Owner` table. All the data in the column will be lost.
  - You are about to drop the column `feeType` on the `Owner` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Property" ADD COLUMN "feeAmount" REAL;
ALTER TABLE "Property" ADD COLUMN "feeType" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Owner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Owner" ("address", "createdAt", "email", "firstName", "id", "lastName", "notes", "phone", "updatedAt") SELECT "address", "createdAt", "email", "firstName", "id", "lastName", "notes", "phone", "updatedAt" FROM "Owner";
DROP TABLE "Owner";
ALTER TABLE "new_Owner" RENAME TO "Owner";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
