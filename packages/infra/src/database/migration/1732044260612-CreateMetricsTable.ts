import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateMetricsTable1732044260612 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'metrics',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isNullable: false,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()'
                    },
                    {
                        name: 'page_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'score',
                        type: 'float',
                        isNullable: false,
                    },
                    {
                        name: 'responseTime',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'fcp',
                        type: 'float',
                        isNullable: false,
                    },
                    {
                        name: 'si',
                        type: 'float',
                        isNullable: false,
                    },
                    {
                        name: 'lcp',
                        type: 'float',
                        isNullable: false,
                    },
                    {
                        name: 'tbt',
                        type: 'float',
                        isNullable: false,
                    },
                    {
                        name: 'cls',
                        type: 'float',
                        isNullable: false,
                    },
                    {
                        name: 'time',
                        type: 'timestamp with time zone',
                        isNullable: false,
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
                indices: [
                    {
                        columnNames: ['id', 'time'],
                        isUnique: true
                    }
                ]
            }),
            true,
        );

        await queryRunner.createForeignKey(
            'metrics',
            new TableForeignKey({
                columnNames: ['page_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'page',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('metrics');
        const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.indexOf('page_id') !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey('metrics', foreignKey);
        }


        await queryRunner.dropTable('metrics', true);
    }
}
