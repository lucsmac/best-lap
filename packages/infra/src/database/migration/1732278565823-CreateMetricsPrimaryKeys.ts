import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMetricsPrimaryKeys1732278565823 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "metrics"
            ADD CONSTRAINT "PK_metrics_id_time" PRIMARY KEY ("id", "time");
        `);
    }

    public async down(): Promise<void> {
    }

}
