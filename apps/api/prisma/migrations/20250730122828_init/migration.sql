/*
  Warnings:

  - Added the required column `createdAt` to the `edge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `edge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `node` table without a default value. This is not possible if the table is not empty.
  - Added the required column `threshold` to the `node` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `node` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."edge" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."node" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "threshold" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
