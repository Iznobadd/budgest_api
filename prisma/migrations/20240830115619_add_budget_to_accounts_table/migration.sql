/*
  Warnings:

  - Added the required column `budget` to the `accounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "budget" DECIMAL(65,30) NOT NULL;
