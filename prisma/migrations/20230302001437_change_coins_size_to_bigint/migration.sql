/*
  Warnings:

  - You are about to drop the column `amount` on the `CoinsUpdate` table. All the data in the column will be lost.
  - Added the required column `coins` to the `CoinsUpdate` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CoinsUpdate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "coins" BIGINT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "rivalId" TEXT NOT NULL,
    CONSTRAINT "CoinsUpdate_rivalId_fkey" FOREIGN KEY ("rivalId") REFERENCES "Rival" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CoinsUpdate" ("id", "rivalId", "timestamp") SELECT "id", "rivalId", "timestamp" FROM "CoinsUpdate";
DROP TABLE "CoinsUpdate";
ALTER TABLE "new_CoinsUpdate" RENAME TO "CoinsUpdate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
