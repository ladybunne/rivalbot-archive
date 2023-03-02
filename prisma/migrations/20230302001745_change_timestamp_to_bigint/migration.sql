/*
  Warnings:

  - You are about to alter the column `timestamp` on the `CoinsUpdate` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CoinsUpdate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "coins" BIGINT NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "rivalId" TEXT NOT NULL,
    CONSTRAINT "CoinsUpdate_rivalId_fkey" FOREIGN KEY ("rivalId") REFERENCES "Rival" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CoinsUpdate" ("coins", "id", "rivalId", "timestamp") SELECT "coins", "id", "rivalId", "timestamp" FROM "CoinsUpdate";
DROP TABLE "CoinsUpdate";
ALTER TABLE "new_CoinsUpdate" RENAME TO "CoinsUpdate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
