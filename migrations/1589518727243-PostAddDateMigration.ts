import {MigrationInterface, QueryRunner} from "typeorm";

export class PostAddDateMigration1589518727243 implements MigrationInterface {
    name = 'PostAddDateMigration1589518727243'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `post` ADD `createdAt` datetime NOT NULL", undefined);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `post` DROP COLUMN `createdAt`", undefined);
    }

}
