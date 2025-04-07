-- CreateTable
CREATE TABLE `user_tb` (
    `userId` INTEGER NOT NULL AUTO_INCREMENT,
    `userName` VARCHAR(50) NOT NULL,
    `userEmail` VARCHAR(100) NOT NULL,
    `userPassword` TEXT NOT NULL,
    `userImage` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `userEmail`(`userEmail`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `places_tb` (
    `placeId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `placeName` VARCHAR(100) NOT NULL,
    `placeImage` VARCHAR(255) NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `userId`(`userId`),
    PRIMARY KEY (`placeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comments_tb` (
    `commentId` INTEGER NOT NULL AUTO_INCREMENT,
    `placeId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `commentText` TEXT NOT NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `placeId`(`placeId`),
    INDEX `userId`(`userId`),
    PRIMARY KEY (`commentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `places_tb` ADD CONSTRAINT `places_tb_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user_tb`(`userId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `comments_tb` ADD CONSTRAINT `comments_tb_ibfk_1` FOREIGN KEY (`placeId`) REFERENCES `places_tb`(`placeId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `comments_tb` ADD CONSTRAINT `comments_tb_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `user_tb`(`userId`) ON DELETE CASCADE ON UPDATE NO ACTION;
