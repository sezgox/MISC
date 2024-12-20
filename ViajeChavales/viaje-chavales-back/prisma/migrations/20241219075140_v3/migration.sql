-- CreateTable
CREATE TABLE "Participant" (
    "userId" TEXT NOT NULL,
    "tripId" INTEGER NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("userId","tripId")
);

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
