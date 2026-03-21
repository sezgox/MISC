ALTER TABLE "Trip"
ADD COLUMN "name" TEXT NOT NULL DEFAULT 'Trip';

UPDATE "Trip"
SET "name" = LEFT(COALESCE(NULLIF(TRIM("destination"), ''), 'Trip'), 20)
WHERE "name" = 'Trip';

ALTER TABLE "Trip" ALTER COLUMN "name" DROP DEFAULT;
