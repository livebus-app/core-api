/*
  Warnings:

  - Added the required column `name` to the `Camera` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Camera" ADD COLUMN     "name" TEXT NOT NULL;
