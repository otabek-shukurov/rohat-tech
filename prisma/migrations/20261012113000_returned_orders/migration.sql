-- AddEnumValue
ALTER TYPE "OrderStatus" ADD VALUE 'RETURNED';

-- AlterTable
ALTER TABLE "orders"
ADD COLUMN "returnedAt" TIMESTAMP(3),
ADD COLUMN "returnedById" TEXT;

-- CreateIndex
CREATE INDEX "orders_returnedAt_idx" ON "orders"("returnedAt");

-- CreateIndex
CREATE INDEX "orders_returnedById_idx" ON "orders"("returnedById");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_returnedById_fkey" FOREIGN KEY ("returnedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
