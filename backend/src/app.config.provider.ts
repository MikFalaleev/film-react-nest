import { ConfigService } from '@nestjs/config';

export interface AppConfig {
  database: {
    driver: string;
    url: string;
  };
}

export const configProvider = {
  provide: 'CONFIG',
  inject: [ConfigService],
  useFactory: (config: ConfigService): AppConfig => ({
    database: {
      driver: config.get<string>('DATABASE_DRIVER', 'mongodb'),
      url: config.getOrThrow<string>('DATABASE_URL'),
    },
  }),
};
