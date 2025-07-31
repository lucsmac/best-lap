import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContinuousAggregatesAndPolicies1732278565824 implements MigrationInterface {
  public readonly transaction = false;

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar continuous aggregate diária
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW metrics_daily
      WITH (timescaledb.continuous) AS
      SELECT
        time_bucket('1 day', time) AS bucket,
        page_id,
        avg(score) AS avg_score,
        avg(response_time) AS avg_response_time,
        avg(fcp) AS avg_fcp,
        avg(si) AS avg_si,
        avg(lcp) AS avg_lcp,
        avg(tbt) AS avg_tbt,
        avg(cls) AS avg_cls
      FROM metrics
      GROUP BY bucket, page_id;
    `);

    // Criar continuous aggregate semanal com origem fixa
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW metrics_weekly
      WITH (timescaledb.continuous) AS
      SELECT
        time_bucket('1 week', time, TIMESTAMPTZ '2025-07-26 00:00:00') AS bucket,
        page_id,
        avg(score) AS avg_score,
        avg(response_time) AS avg_response_time,
        avg(fcp) AS avg_fcp,
        avg(si) AS avg_si,
        avg(lcp) AS avg_lcp,
        avg(tbt) AS avg_tbt,
        avg(cls) AS avg_cls
      FROM metrics
      GROUP BY bucket, page_id;
    `);

    // Políticas de continuous aggregates
    await queryRunner.query(`
      SELECT add_continuous_aggregate_policy('metrics_daily',
        start_offset => INTERVAL '90 days',
        end_offset => INTERVAL '1 day',
        schedule_interval => INTERVAL '1 hour');
    `);

    await queryRunner.query(`
      SELECT add_continuous_aggregate_policy('metrics_weekly',
        start_offset => INTERVAL '1 year',
        end_offset => INTERVAL '1 week',
        schedule_interval => INTERVAL '1 hour');
    `);

    // Políticas de retenção
    await queryRunner.query(`
      SELECT add_retention_policy('metrics', INTERVAL '14 days');
    `);

    await queryRunner.query(`
      SELECT add_retention_policy('metrics_daily', INTERVAL '90 days');
    `);

    // Ativar compressão na tabela metrics
    await queryRunner.query(`
      ALTER TABLE metrics SET (
        timescaledb.compress,
        timescaledb.compress_segmentby = 'page_id'
      );
    `);

    // Política de compressão para dados com mais de 7 dias
    await queryRunner.query(`
      SELECT add_compression_policy('metrics', INTERVAL '7 days');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover políticas criadas
    await queryRunner.query(`
      SELECT remove_continuous_aggregate_policy('metrics_daily');
    `);
    await queryRunner.query(`
      SELECT remove_continuous_aggregate_policy('metrics_weekly');
    `);
    await queryRunner.query(`
      SELECT remove_retention_policy('metrics');
    `);
    await queryRunner.query(`
      SELECT remove_retention_policy('metrics_daily');
    `);
    await queryRunner.query(`
      SELECT remove_compression_policy('metrics');
    `);

    // Remover configuração de compressão da tabela metrics
    await queryRunner.query(`
      ALTER TABLE metrics RESET (timescaledb.compress, timescaledb.compress_segmentby);
    `);

    // Dropar as materialized views
    await queryRunner.query(`
      DROP MATERIALIZED VIEW IF EXISTS metrics_daily;
    `);
    await queryRunner.query(`
      DROP MATERIALIZED VIEW IF EXISTS metrics_weekly;
    `);
  }
}
