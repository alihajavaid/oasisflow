/*
  Warnings:

  - You are about to drop the column `areaId` on the `DriverProfile` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `DriverProfile` DROP FOREIGN KEY `DriverProfile_areaId_fkey`;

-- DropIndex
DROP INDEX `DriverProfile_areaId_fkey` ON `DriverProfile`;

-- AlterTable
ALTER TABLE `DriverProfile` DROP COLUMN `areaId`;

-- AlterTable
ALTER TABLE `Stop` ADD COLUMN `cashAmount` DOUBLE NULL,
    ADD COLUMN `cashReceived` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `startedAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `Attendance` (
    `id` VARCHAR(191) NOT NULL,
    `driverId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `status` ENUM('PRESENT', 'ABSENT', 'LEAVE') NOT NULL DEFAULT 'PRESENT',
    `markedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Attendance_driverId_date_key`(`driverId`, `date`),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_DriverAreas` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_DriverAreas_AB_unique`(`A`, `B`),
    INDEX `_DriverAreas_B_index`(`B`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `DriverProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DriverAreas` ADD CONSTRAINT `_DriverAreas_A_fkey` FOREIGN KEY (`A`) REFERENCES `DeliveryArea`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DriverAreas` ADD CONSTRAINT `_DriverAreas_B_fkey` FOREIGN KEY (`B`) REFERENCES `DriverProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
