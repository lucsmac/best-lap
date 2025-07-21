import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateChannelTable1732044214596 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'channels',
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
                        name: 'domain',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'internal_link',
                        type: 'text',
                        isNullable: false,
                        isUnique: true,
                    },
                    {
                        name: 'theme',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'active',
                        type: 'boolean',
                        isNullable: false,
                        default: false,
                    },
                    {
                        name: 'is_reference',
                        type: 'boolean',
                        isNullable: false,
                        default: false,
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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('channels', true, true, true);
    }
}
