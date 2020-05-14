import {MigrationInterface, QueryRunner} from "typeorm";

export class CategoryMigration1589435120953 implements MigrationInterface {
    name = 'CategoryMigration1589435120953'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `category` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `nsleft` int NOT NULL DEFAULT 1, `nsright` int NOT NULL DEFAULT 2, `parentId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("ALTER TABLE `category` ADD CONSTRAINT `FK_d5456fd7e4c4866fec8ada1fa10` FOREIGN KEY (`parentId`) REFERENCES `category`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `category` DROP FOREIGN KEY `FK_d5456fd7e4c4866fec8ada1fa10`", undefined);
        await queryRunner.query("DROP TABLE `category`", undefined);
    }

}
