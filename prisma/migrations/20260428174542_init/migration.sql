/*
  Warnings:

  - The `modoGeracao` column on the `codigo_acesso` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ModoGeracao" AS ENUM ('automatico', 'manual');

-- AlterTable
ALTER TABLE "codigo_acesso" DROP COLUMN "modoGeracao",
ADD COLUMN     "modoGeracao" "ModoGeracao" NOT NULL DEFAULT 'automatico';
