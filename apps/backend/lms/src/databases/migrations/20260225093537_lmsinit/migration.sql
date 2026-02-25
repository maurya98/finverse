-- CreateTable
CREATE TABLE "lead_master" (
    "lead_id" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "customer_id" TEXT NOT NULL,
    "fname" TEXT,
    "lname" TEXT,
    "pan_card" TEXT,
    "company_name" TEXT,
    "gender" TEXT,
    "dob" DATE,
    "email" TEXT,
    "mobile_no" TEXT NOT NULL,
    "pincode" INTEGER,
    "employment_type" INTEGER,
    "income" INTEGER,
    "city" TEXT,
    "segment" TEXT,
    "visit_id" TEXT,
    "utm_source" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "optional_info" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_master_pkey" PRIMARY KEY ("lead_id")
);

-- CreateTable
CREATE TABLE "lead_stage" (
    "id" SERIAL NOT NULL,
    "lead_id" TEXT NOT NULL,
    "stage_name" TEXT NOT NULL,
    "stage_description" TEXT,
    "journey_details" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_stage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "lead_id" TEXT NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "rejection_reason" TEXT,
    "is_application_created" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lead_master_email_key" ON "lead_master"("email");

-- CreateIndex
CREATE UNIQUE INDEX "lead_master_mobile_no_key" ON "lead_master"("mobile_no");

-- CreateIndex
CREATE UNIQUE INDEX "lead_master_product_id_customer_id_key" ON "lead_master"("product_id", "customer_id");

-- CreateIndex
CREATE INDEX "lead_stage_lead_id_stage_name_idx" ON "lead_stage"("lead_id", "stage_name");

-- CreateIndex
CREATE UNIQUE INDEX "offer_product_id_lead_id_key" ON "offer"("product_id", "lead_id");

-- AddForeignKey
ALTER TABLE "lead_stage" ADD CONSTRAINT "lead_stage_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "lead_master"("lead_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer" ADD CONSTRAINT "offer_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "lead_master"("lead_id") ON DELETE RESTRICT ON UPDATE CASCADE;
