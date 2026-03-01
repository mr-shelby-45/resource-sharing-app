/*
  Warnings:

  - A unique constraint covering the columns `[ownerId]` on the table `Item` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Item_ownerId_key" ON "Item"("ownerId");
