-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('Pending', 'Confirmed', 'Cancelled', 'Returned');

-- CreateEnum
CREATE TYPE "OrderPaymentStatus" AS ENUM ('Paid', 'UnPaid', 'ReFunded');

-- CreateEnum
CREATE TYPE "PaymentMethods" AS ENUM ('Cash', 'Card', 'BankTransfer');

-- CreateTable
CREATE TABLE "Orders" (
    "id" TEXT NOT NULL,
    "order_no" SERIAL NOT NULL,
    "net_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "shipping_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "tax_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "discount_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "sub_total" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "currency" TEXT NOT NULL,
    "order_date" TIMESTAMP(3) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'Pending',
    "payment_status" "OrderPaymentStatus" NOT NULL DEFAULT 'UnPaid',
    "payment_method" TEXT NOT NULL,
    "payment_reference" "PaymentMethods",
    "company_id" TEXT NOT NULL,
    "address_id" TEXT,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order_items" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "item_discount_amount" DOUBLE PRECISION NOT NULL,
    "line_total" DOUBLE PRECISION NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT,
    "product_variant_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "Company_Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order_items" ADD CONSTRAINT "Order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order_items" ADD CONSTRAINT "Order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order_items" ADD CONSTRAINT "Order_items_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "Product_Variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
