import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppConfig, configProvider } from '../app.config.provider';
import { AppRepository } from './app.repository';
import { Film } from './entities/film.entity';
import { Schedule } from './entities/schedule.entity';
import { FilmsRepository } from './films.repository';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      extraProviders: [configProvider],
      inject: ['CONFIG'],
      useFactory: (config: AppConfig): TypeOrmModuleOptions => {
        const url = new URL(config.database.url);
        url.username = config.database.username;
        url.password = config.database.password;

        return {
          type: config.database.driver,
          url: url.toString(),
          entities: [Film, Schedule],
          synchronize: false,
        };
      },
    }),
    TypeOrmModule.forFeature([Film, Schedule]),
  ],
  providers: [
    {
      provide: FilmsRepository,
      useClass: AppRepository,
    },
  ],
  exports: [FilmsRepository],
})
export class RepositoryModule {}
