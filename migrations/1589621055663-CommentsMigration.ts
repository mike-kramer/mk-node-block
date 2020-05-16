import {MigrationInterface, QueryRunner} from "typeorm";

export class CommentsMigration1589621055663 implements MigrationInterface {
    name = 'CommentsMigration1589621055663'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `comment` (`id` int NOT NULL AUTO_INCREMENT, `authorName` varchar(255) NOT NULL, `authorEmail` varchar(255) NULL, `commentText` longtext NOT NULL, `postId` int NULL, createdAt datetime not null, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("ALTER TABLE `comment` ADD CONSTRAINT `FK_94a85bb16d24033a2afdd5df060` FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `comment` DROP FOREIGN KEY `FK_94a85bb16d24033a2afdd5df060`", undefined);
        await queryRunner.query("DROP TABLE `comment`", undefined);
    }

}
