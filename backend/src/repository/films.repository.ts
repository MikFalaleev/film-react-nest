import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { createConnection } from 'mongoose';
import { AppConfig } from '../app.config.provider';
import { FilmDto, SessionDto } from '../films/dto/films.dto';
import { filmSchema } from './film.schema';

@Injectable()
export class FilmsRepository implements OnModuleInit, OnModuleDestroy {
  private readonly connection = createConnection();
  private readonly films = this.connection.model('Film', filmSchema);

  constructor(@Inject('CONFIG') private readonly config: AppConfig) {}

  async onModuleInit(): Promise<void> {
    await this.connection.openUri(this.config.database.url, {
      serverSelectionTimeoutMS: 5000,
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.connection.close();
  }

  async findAll(): Promise<FilmDto[]> {
    return this.films.find({}, { _id: 0, __v: 0, schedule: 0 }).lean().exec();
  }

  async findSchedule(filmId: string): Promise<SessionDto[] | null> {
    const film = await this.films
      .findOne({ id: filmId }, { _id: 0, schedule: 1 })
      .lean()
      .exec();

    if (!film) {
      return null;
    }

    return (film.schedule ?? []).map((session) => ({
      ...session,
      hall: Number(session.hall),
    }));
  }

  async reserveSeat(
    filmId: string,
    sessionId: string,
    seat: string,
  ): Promise<boolean> {
    const result = await this.films
      .updateOne(
        {
          id: filmId,
          schedule: {
            $elemMatch: {
              id: sessionId,
              taken: { $ne: seat },
            },
          },
        },
        {
          $addToSet: { 'schedule.$.taken': seat },
        },
      )
      .exec();

    return result.modifiedCount === 1;
  }

  async releaseSeat(
    filmId: string,
    sessionId: string,
    seat: string,
  ): Promise<void> {
    await this.films
      .updateOne(
        {
          id: filmId,
          'schedule.id': sessionId,
        },
        {
          $pull: { 'schedule.$.taken': seat },
        },
      )
      .exec();
  }
}
