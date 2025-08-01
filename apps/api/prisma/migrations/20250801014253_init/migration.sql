-- AlterTable
ALTER TABLE "public"."node" ALTER COLUMN "video" DROP NOT NULL,
ALTER COLUMN "algorithm" DROP NOT NULL,
ALTER COLUMN "threshold" DROP NOT NULL;
