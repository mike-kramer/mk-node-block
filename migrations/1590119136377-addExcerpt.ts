import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class addExcerpt1590119136377 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.addColumn("post", new TableColumn({
            name: "excerpt",
            type: "text",
            isNullable: true,
            default: null
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropColumn("post", "excerpt");
    }

}
