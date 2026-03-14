-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "phone" TEXT,
    "searchType" TEXT,
    "isFormSubmission" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyRequest" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "excludeArea" TEXT,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "yieldMin" DOUBLE PRECISION,
    "landAreaMin" INTEGER,
    "buildingAreaMin" INTEGER,
    "maxAge" INTEGER,
    "structure" TEXT,
    "parking" TEXT,
    "urgency" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT '新規',
    "syncSource" TEXT,
    "sheetRowIndex" INTEGER,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestNote" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset"("token");

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyRequest" ADD CONSTRAINT "PropertyRequest_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestNote" ADD CONSTRAINT "RequestNote_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "PropertyRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
