import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddUpdatedDateToPost1595172271351 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.addColumn("post", new TableColumn({
            name: "updatedAtTimestamp",
            type: "bigint"
        }));
        await queryRunner.query(`
            update post set updatedAtTimestamp = UNIX_TIMESTAMP(createdAt)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropColumn("post", "updatedAtTimeStamp");
    }

}
