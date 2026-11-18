import { ConfigService } from '@nestjs/config';

export interface AppConfig {
  database: {
    driver: 'postgres';
    url: string;
    username: string;
    password: string;
  };
}

export const configProvider = {
  provide: 'CONFIG',
  inject: [ConfigService],
  useFactory: (config: ConfigService): AppConfig => {
    const driver = config.get<string>('DATABASE_DRIVER', 'postgres');

    if (driver !== 'postgres') {
      throw new Error('DATABASE_DRIVER должен иметь значение postgres');
    }

    return {
      database: {
        driver,
        url: config.getOrThrow<string>('DATABASE_URL'),
        username: config.getOrThrow<string>('DATABASE_USERNAME'),
        password: config.getOrThrow<string>('DATABASE_PASSWORD'),
      },
    };
  },
};
