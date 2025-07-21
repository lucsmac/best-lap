import { MigrationInterface, QueryRunner } from "typeorm";

export class SetupHypertable1732050948683 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            SELECT create_hypertable('metrics', 'time');
        `);
    }
    
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS metrics;
        `);
    }

}
