import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddProviderIdToPages1737562800001 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'pages',
            new TableColumn({
                name: 'provider_id',
                type: 'uuid',
                isNullable: true,
            })
        );

        await queryRunner.createForeignKey(
            'pages',
            new TableForeignKey({
                columnNames: ['provider_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'providers',
                onDelete: 'SET NULL',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('pages');
        const foreignKey = table?.foreignKeys.find(
            fk => fk.columnNames.indexOf('provider_id') !== -1
        );

        if (foreignKey) {
            await queryRunner.dropForeignKey('pages', foreignKey);
        }

        await queryRunner.dropColumn('pages', 'provider_id');
    }
}
