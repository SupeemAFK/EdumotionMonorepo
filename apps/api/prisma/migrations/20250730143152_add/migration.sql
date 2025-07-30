/*
  Warnings:

  - Added the required column `type` to the `node` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."node" ADD COLUMN     "type" TEXT NOT NULL;
