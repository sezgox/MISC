-- CreateTable
CREATE TABLE "GroupMembership" (
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userRole" "UserRole" NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupMembership_pkey" PRIMARY KEY ("userId","groupId")
);

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "activeGroupId" TEXT;

-- Data migration
UPDATE "User"
SET "activeGroupId" = "groupId"
WHERE "groupId" IS NOT NULL;

INSERT INTO "GroupMembership" ("userId", "groupId", "userRole", "createdAt", "updatedAt")
SELECT "username", "groupId", "userRole", "createdAt", "updatedAt"
FROM "User"
WHERE "groupId" IS NOT NULL;

-- CreateIndex
CREATE INDEX "GroupMembership_groupId_userRole_idx" ON "GroupMembership"("groupId", "userRole");

-- AddForeignKey
ALTER TABLE "GroupMembership"
ADD CONSTRAINT "GroupMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership"
ADD CONSTRAINT "GroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop old relation and columns
ALTER TABLE "User"
DROP CONSTRAINT "User_groupId_fkey",
DROP COLUMN "groupId",
DROP COLUMN "userRole";
