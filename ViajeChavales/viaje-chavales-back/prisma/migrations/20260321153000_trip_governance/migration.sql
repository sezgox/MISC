-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Pending', 'Tripper', 'Admin');

-- CreateEnum
CREATE TYPE "TripRole" AS ENUM ('Accommodation', 'Transport', 'Visits');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('Planning', 'Closed', 'Discarded');

-- CreateEnum
CREATE TYPE "ProposalType" AS ENUM ('Accommodation', 'Transport', 'Visit');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('Proposed', 'Accepted', 'Denied');

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_chatId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_userId_fkey";

-- DropForeignKey
ALTER TABLE "FreeDays" DROP CONSTRAINT "FreeDays_username_fkey";

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_userId_fkey";

-- AlterTable
ALTER TABLE "Comment"
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Group"
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Group" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Participant"
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Trip"
DROP COLUMN "accomodation",
DROP COLUMN "price",
DROP COLUMN "userId",
ADD COLUMN "acceptedAccommodationProposalId" INTEGER,
ADD COLUMN "acceptedTransportProposalId" INTEGER,
ADD COLUMN "acceptedVisitProposalId" INTEGER,
ADD COLUMN "budget" INTEGER,
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "groupId" TEXT NOT NULL,
ADD COLUMN "plannerUsername" TEXT NOT NULL,
ADD COLUMN "status" "TripStatus" NOT NULL DEFAULT 'Planning',
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Trip" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "userRole" "UserRole" NOT NULL DEFAULT 'Pending';

ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- Preserve full access for pre-role users already present in local dev.
UPDATE "User" SET "userRole" = 'Admin';

-- CreateTable
CREATE TABLE "TripRoleAssignment" (
    "tripId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TripRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripRoleAssignment_pkey" PRIMARY KEY ("tripId","userId","role")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" SERIAL NOT NULL,
    "tripId" INTEGER NOT NULL,
    "createdByUsername" TEXT NOT NULL,
    "type" "ProposalType" NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'Proposed',
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalVote" (
    "proposalId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProposalVote_pkey" PRIMARY KEY ("proposalId","userId")
);

-- CreateTable
CREATE TABLE "AccommodationProposalObject" (
    "id" SERIAL NOT NULL,
    "proposalId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "place" TEXT NOT NULL,
    "nights" INTEGER NOT NULL,
    "pricePerPersonCents" INTEGER NOT NULL,
    "referenceLink" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccommodationProposalObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportProposalObject" (
    "id" SERIAL NOT NULL,
    "proposalId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "pricePerPersonCents" INTEGER NOT NULL,
    "referenceLink" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportProposalObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitProposalObject" (
    "id" SERIAL NOT NULL,
    "proposalId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "pricePerPersonCents" INTEGER NOT NULL,
    "referenceLink" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisitProposalObject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Proposal_tripId_type_idx" ON "Proposal"("tripId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Trip_acceptedAccommodationProposalId_key" ON "Trip"("acceptedAccommodationProposalId");

-- CreateIndex
CREATE UNIQUE INDEX "Trip_acceptedTransportProposalId_key" ON "Trip"("acceptedTransportProposalId");

-- CreateIndex
CREATE UNIQUE INDEX "Trip_acceptedVisitProposalId_key" ON "Trip"("acceptedVisitProposalId");

-- CreateIndex
CREATE INDEX "Trip_groupId_status_idx" ON "Trip"("groupId", "status");

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_plannerUsername_fkey" FOREIGN KEY ("plannerUsername") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_acceptedAccommodationProposalId_fkey" FOREIGN KEY ("acceptedAccommodationProposalId") REFERENCES "Proposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_acceptedTransportProposalId_fkey" FOREIGN KEY ("acceptedTransportProposalId") REFERENCES "Proposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_acceptedVisitProposalId_fkey" FOREIGN KEY ("acceptedVisitProposalId") REFERENCES "Proposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripRoleAssignment" ADD CONSTRAINT "TripRoleAssignment_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripRoleAssignment" ADD CONSTRAINT "TripRoleAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_createdByUsername_fkey" FOREIGN KEY ("createdByUsername") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalVote" ADD CONSTRAINT "ProposalVote_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalVote" ADD CONSTRAINT "ProposalVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccommodationProposalObject" ADD CONSTRAINT "AccommodationProposalObject_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportProposalObject" ADD CONSTRAINT "TransportProposalObject_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitProposalObject" ADD CONSTRAINT "VisitProposalObject_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreeDays" ADD CONSTRAINT "FreeDays_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
