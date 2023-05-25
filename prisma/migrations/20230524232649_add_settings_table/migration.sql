-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tournamentVersion" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Settings_id_key" ON "Settings"("id");
