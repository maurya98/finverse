-- CreateTable
CREATE TABLE "mobile_verifications" (
    "verification_id" TEXT NOT NULL,
    "phone_number" VARCHAR(10) NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "verification_failed" BOOLEAN NOT NULL DEFAULT false,
    "verification_failed_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "verification_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_verification_attempt_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mobile_verifications_pkey" PRIMARY KEY ("verification_id")
);

-- CreateTable
CREATE TABLE "leads" (
    "lead_id" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "customer_id" TEXT NOT NULL,
    "lead_stage" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "visit_id" TEXT,
    "employment_type" TEXT,
    "mobile_no" TEXT NOT NULL,
    "income" DECIMAL(15,2),
    "annual_turnover" DECIMAL(15,2),
    "pincode" INTEGER,
    "city_name" TEXT,
    "segment" TEXT,
    "optional_info" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("lead_id")
);

-- CreateTable
CREATE TABLE "lead_states" (
    "id" SERIAL NOT NULL,
    "lead_id" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "partner_id" INTEGER,
    "application_id" TEXT,
    "lead_details" JSONB,
    "lead_stage" TEXT NOT NULL,
    "utm_details" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creditcard" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "partner_id" INTEGER,
    "lead_details" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "cardName" TEXT NOT NULL,
    "similarCards" TEXT[],
    "information" JSONB[],
    "firstYearFee" DOUBLE PRECISION,
    "additionalInfo" JSONB,
    "cardImg" TEXT,
    "theme" TEXT,
    "isPreQualified" BOOLEAN NOT NULL DEFAULT false,
    "tagName" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creditcard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mobile_verifications_phone_number_key" ON "mobile_verifications"("phone_number");

-- CreateIndex
CREATE INDEX "mobile_verifications_is_verified_idx" ON "mobile_verifications"("is_verified");

-- CreateIndex
CREATE INDEX "mobile_verifications_verified_at_idx" ON "mobile_verifications"("verified_at");

-- CreateIndex
CREATE INDEX "lead_states_lead_id_idx" ON "lead_states"("lead_id");

-- CreateIndex
CREATE INDEX "creditcard_lead_id_idx" ON "creditcard"("lead_id");

-- AddForeignKey
ALTER TABLE "lead_states" ADD CONSTRAINT "lead_states_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("lead_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creditcard" ADD CONSTRAINT "creditcard_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("lead_id") ON DELETE CASCADE ON UPDATE CASCADE;
