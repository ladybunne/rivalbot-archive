-- CreateTable
CREATE TABLE "TournamentUpdate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "waves" BIGINT NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "version" TEXT NOT NULL,
    "rivalId" TEXT NOT NULL,
    CONSTRAINT "TournamentUpdate_rivalId_fkey" FOREIGN KEY ("rivalId") REFERENCES "Rival" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Rival" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tagline" TEXT,
    "startDate" BIGINT,
    "tournamentStrategy" TEXT NOT NULL DEFAULT 'Unspecified',
    "farmingStrategy" TEXT NOT NULL DEFAULT 'Unspecified',
    "rivalCardThreadId" TEXT
);
INSERT INTO "new_Rival" ("id") SELECT "id" FROM "Rival";
DROP TABLE "Rival";
ALTER TABLE "new_Rival" RENAME TO "Rival";
CREATE UNIQUE INDEX "Rival_id_key" ON "Rival"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
