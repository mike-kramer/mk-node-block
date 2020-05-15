import {MigrationInterface, QueryRunner} from "typeorm";

export class PostsMigration1589517800297 implements MigrationInterface {
    name = 'PostsMigration1589517800297'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `post` (`id` int NOT NULL AUTO_INCREMENT, `title` varchar(255) NOT NULL, `text` longtext NOT NULL, `categoryId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("ALTER TABLE `category` DROP FOREIGN KEY `FK_d5456fd7e4c4866fec8ada1fa10`", undefined);
        await queryRunner.query("ALTER TABLE `category` CHANGE `parentId` `parentId` int NULL", undefined);
        await queryRunner.query("ALTER TABLE `post` ADD CONSTRAINT `FK_1077d47e0112cad3c16bbcea6cd` FOREIGN KEY (`categoryId`) REFERENCES `category`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `category` ADD CONSTRAINT `FK_d5456fd7e4c4866fec8ada1fa10` FOREIGN KEY (`parentId`) REFERENCES `category`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `category` DROP FOREIGN KEY `FK_d5456fd7e4c4866fec8ada1fa10`", undefined);
        await queryRunner.query("ALTER TABLE `post` DROP FOREIGN KEY `FK_1077d47e0112cad3c16bbcea6cd`", undefined);
        await queryRunner.query("ALTER TABLE `category` CHANGE `parentId` `parentId` int NULL DEFAULT 'NULL'", undefined);
        await queryRunner.query("ALTER TABLE `category` ADD CONSTRAINT `FK_d5456fd7e4c4866fec8ada1fa10` FOREIGN KEY (`parentId`) REFERENCES `category`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("DROP TABLE `post`", undefined);
    }

}
