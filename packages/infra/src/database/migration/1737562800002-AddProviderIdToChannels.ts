import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddProviderIdToChannels1737562800002 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'channels',
            new TableColumn({
                name: 'provider_id',
                type: 'uuid',
                isNullable: true,
            })
        );

        await queryRunner.createForeignKey(
            'channels',
            new TableForeignKey({
                columnNames: ['provider_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'providers',
                onDelete: 'SET NULL',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('channels');
        const foreignKey = table?.foreignKeys.find(
            fk => fk.columnNames.indexOf('provider_id') !== -1
        );

        if (foreignKey) {
            await queryRunner.dropForeignKey('channels', foreignKey);
        }

        await queryRunner.dropColumn('channels', 'provider_id');
    }
}
