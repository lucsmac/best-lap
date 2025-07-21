import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreatePageTable1732044214596 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'pages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
          },
          {
            name: 'name',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'path',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'channel_id',
            type: 'uuid',
            isNullable: false,
          },
        ]
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pages', true, true, true);
  }
}
