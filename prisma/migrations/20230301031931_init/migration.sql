-- CreateTable
CREATE TABLE "Rival" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- CreateTable
CREATE TABLE "CoinsUpdate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" INTEGER NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "rivalId" INTEGER NOT NULL,
    CONSTRAINT "CoinsUpdate_rivalId_fkey" FOREIGN KEY ("rivalId") REFERENCES "Rival" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Rival_id_key" ON "Rival"("id");
