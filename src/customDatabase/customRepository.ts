import { Provider, Type } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions, Repository } from 'typeorm';

export function provideCustomRepository<Entity extends Record<string, any>, Repo extends Repository<Entity>>(
    entity: Type<Entity>,
    repository: Type<Repo>,
    dataSource?: DataSource | DataSourceOptions | string
): Provider<Repo> {
    return {
        provide: repository,
        inject: [getDataSourceToken(dataSource)],
        useFactory(dataSource: DataSource) {
            const baseRepository = dataSource.getRepository(entity);
            
            return new repository(
                baseRepository.target,
                baseRepository.manager,
                baseRepository.queryRunner
            );
        },
    };
}
