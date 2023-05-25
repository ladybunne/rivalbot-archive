/*
  Warnings:

  - The primary key for the `Settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Settings` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tournamentVersion" TEXT NOT NULL
);
INSERT INTO "new_Settings" ("id", "tournamentVersion") SELECT "id", "tournamentVersion" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
CREATE UNIQUE INDEX "Settings_id_key" ON "Settings"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
