-- DropForeignKey
ALTER TABLE `comments_tb` DROP FOREIGN KEY `comments_tb_ibfk_1`;

-- DropForeignKey
ALTER TABLE `comments_tb` DROP FOREIGN KEY `comments_tb_ibfk_2`;

-- DropForeignKey
ALTER TABLE `places_tb` DROP FOREIGN KEY `places_tb_ibfk_1`;

-- AddForeignKey
ALTER TABLE `places_tb` ADD CONSTRAINT `places_tb_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user_tb`(`userId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `comments_tb` ADD CONSTRAINT `comments_tb_placeId_fkey` FOREIGN KEY (`placeId`) REFERENCES `places_tb`(`placeId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `comments_tb` ADD CONSTRAINT `comments_tb_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user_tb`(`userId`) ON DELETE CASCADE ON UPDATE NO ACTION;
