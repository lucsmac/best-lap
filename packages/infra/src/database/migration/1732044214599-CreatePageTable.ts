import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreatePageTable1732044214599 implements MigrationInterface {

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
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ]
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'pages',
      new TableForeignKey({
        columnNames: ['channel_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'channels',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pages', true, true, true);
  }
}
