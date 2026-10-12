/*
  Warnings:

  - Added the required column `dailyRate` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "dailyRate" INTEGER NOT NULL,
ADD COLUMN     "endDate" DATE NOT NULL,
ADD COLUMN     "returnedAt" TIMESTAMP(3),
ADD COLUMN     "startDate" DATE NOT NULL;

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "dailyRate" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ItemImage" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ItemImage_itemId_idx" ON "ItemImage"("itemId");

-- AddForeignKey
ALTER TABLE "ItemImage" ADD CONSTRAINT "ItemImage_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Lets a gist index combine plain equality (itemId) with a date range
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Old rule: only one approved booking per item, ever
DROP INDEX IF EXISTS "unique_approved_booking";

-- New rule: approved bookings for the same item may not share a day.
-- '[]' means both the first and last day count as taken (inclusive).
ALTER TABLE "Booking"
ADD CONSTRAINT "no_overlapping_approved_bookings"
EXCLUDE USING gist (
  "itemId" WITH =,
  daterange("startDate", "endDate", '[]') WITH &&
)
WHERE (status = 'APPROVED');

-- Safety nets, so bad data fails in the database even if app code has a bug
ALTER TABLE "Booking"
ADD CONSTRAINT "booking_dates_valid" CHECK ("endDate" >= "startDate");
ALTER TABLE "Booking"
ADD CONSTRAINT "booking_daily_rate_valid" CHECK ("dailyRate" >= 0);
ALTER TABLE "Item"
ADD CONSTRAINT "item_daily_rate_valid" CHECK ("dailyRate" >= 0);
