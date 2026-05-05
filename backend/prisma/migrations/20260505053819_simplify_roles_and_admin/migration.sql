/*
  Warnings:

  - You are about to drop the `event_organizers` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "GlobalRole" AS ENUM ('admin', 'user');

-- DropForeignKey
ALTER TABLE "event_organizers" DROP CONSTRAINT "event_organizers_event_id_fkey";

-- DropForeignKey
ALTER TABLE "event_organizers" DROP CONSTRAINT "event_organizers_user_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "GlobalRole" NOT NULL DEFAULT 'user';

-- DropTable
DROP TABLE "event_organizers";

-- DropEnum
DROP TYPE "OrganizerRole";
