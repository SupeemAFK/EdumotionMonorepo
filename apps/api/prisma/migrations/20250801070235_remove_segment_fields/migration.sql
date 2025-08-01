/*
  Warnings:

  - You are about to drop the column `videoEndTime` on the `node` table. All the data in the column will be lost.
  - You are about to drop the column `videoStartTime` on the `node` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."node" DROP COLUMN "videoEndTime",
DROP COLUMN "videoStartTime";
