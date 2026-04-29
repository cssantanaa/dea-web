/*
  Warnings:

  - You are about to drop the column `fimPeriodo` on the `barreiras` table. All the data in the column will be lost.
  - You are about to drop the column `inicioPeriodo` on the `barreiras` table. All the data in the column will be lost.
  - Added the required column `periodoInicial` to the `barreiras` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "barreiras" DROP COLUMN "fimPeriodo",
DROP COLUMN "inicioPeriodo",
ADD COLUMN     "periodoFinal" TIMESTAMP(3),
ADD COLUMN     "periodoInicial" TIMESTAMP(3) NOT NULL;
