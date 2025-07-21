import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateChannelTable1732044214596 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'channel',
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
                    },
                    {
                        name: 'theme',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'is_reference',
                        type: 'bool',
                        isNullable: true,
                    }
                ]
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('channel')
    }

}
