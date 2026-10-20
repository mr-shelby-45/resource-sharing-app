-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('NONE', 'PENDING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "recipientCode" TEXT,
ADD COLUMN     "recipientPhone" TEXT;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "approvedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "channel" TEXT,
    "payoutStatus" "TransferStatus" NOT NULL DEFAULT 'NONE',
    "payoutReference" TEXT,
    "payoutNote" TEXT,
    "paidOutAt" TIMESTAMP(3),
    "refundStatus" "TransferStatus" NOT NULL DEFAULT 'NONE',
    "refundNote" TEXT,
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_bookingId_key" ON "Payment"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_reference_key" ON "Payment"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_payoutReference_key" ON "Payment"("payoutReference");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- bookings approved before payments existed get a fresh payment window
UPDATE "Booking" SET "approvedAt" = NOW() WHERE "status" = 'APPROVED';
