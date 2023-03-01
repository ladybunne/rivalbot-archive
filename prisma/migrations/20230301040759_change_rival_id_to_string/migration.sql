/*
  Warnings:

  - The primary key for the `Rival` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CoinsUpdate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" INTEGER NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "rivalId" TEXT NOT NULL,
    CONSTRAINT "CoinsUpdate_rivalId_fkey" FOREIGN KEY ("rivalId") REFERENCES "Rival" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CoinsUpdate" ("amount", "id", "rivalId", "timestamp") SELECT "amount", "id", "rivalId", "timestamp" FROM "CoinsUpdate";
DROP TABLE "CoinsUpdate";
ALTER TABLE "new_CoinsUpdate" RENAME TO "CoinsUpdate";
CREATE TABLE "new_Rival" (
    "id" TEXT NOT NULL PRIMARY KEY
);
INSERT INTO "new_Rival" ("id") SELECT "id" FROM "Rival";
DROP TABLE "Rival";
ALTER TABLE "new_Rival" RENAME TO "Rival";
CREATE UNIQUE INDEX "Rival_id_key" ON "Rival"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
