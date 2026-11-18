import { Module } from '@nestjs/common';
import { configProvider } from '../app.config.provider';
import { FilmsRepository } from './films.repository';

@Module({
  providers: [configProvider, FilmsRepository],
  exports: [FilmsRepository],
})
export class RepositoryModule {}
