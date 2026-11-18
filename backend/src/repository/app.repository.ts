import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { Repository } from 'typeorm';
import { FilmDto, SessionDto } from '../films/dto/films.dto';
import { Film } from './entities/film.entity';
import { Schedule } from './entities/schedule.entity';
import { FilmsRepository } from './films.repository';

@Injectable()
export class AppRepository implements FilmsRepository {
  constructor(
    @InjectRepository(Film)
    private readonly films: Repository<Film>,
    @InjectRepository(Schedule)
    private readonly schedules: Repository<Schedule>,
  ) {}

  async findAll(): Promise<FilmDto[]> {
    const films = await this.films.find();

    return films.map((film) => ({
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: film.tags,
      title: film.title,
      about: film.about,
      description: film.description,
      image: film.image,
      cover: film.cover,
    }));
  }

  async findSchedule(filmId: string): Promise<SessionDto[] | null> {
    if (!isUUID(filmId)) {
      return null;
    }

    const filmExists = await this.films.existsBy({ id: filmId });

    if (!filmExists) {
      return null;
    }

    const schedule = await this.schedules.find({
      where: { filmId },
      order: { daytime: 'ASC', id: 'ASC' },
    });

    return schedule.map((session) => ({
      id: session.id,
      daytime: session.daytime,
      hall: session.hall,
      rows: session.rows,
      seats: session.seats,
      price: session.price,
      taken: session.taken,
    }));
  }

  async reserveSeat(
    filmId: string,
    sessionId: string,
    seat: string,
  ): Promise<boolean> {
    if (!isUUID(filmId) || !isUUID(sessionId)) {
      return false;
    }

    const result = await this.schedules
      .createQueryBuilder()
      .update(Schedule)
      .set({
        taken: () => `concat_ws(',', NULLIF("taken", ''), :seat)`,
      })
      .where('id = :sessionId', { sessionId })
      .andWhere('"filmId" = :filmId', { filmId })
      .andWhere(`NOT (:seat = ANY(string_to_array("taken", ',')))`)
      .setParameter('seat', seat)
      .execute();

    return result.affected === 1;
  }

  async releaseSeat(
    filmId: string,
    sessionId: string,
    seat: string,
  ): Promise<void> {
    if (!isUUID(filmId) || !isUUID(sessionId)) {
      return;
    }

    await this.schedules
      .createQueryBuilder()
      .update(Schedule)
      .set({
        taken: () =>
          `array_to_string(array_remove(string_to_array("taken", ','), :seat), ',')`,
      })
      .where('id = :sessionId', { sessionId })
      .andWhere('"filmId" = :filmId', { filmId })
      .setParameter('seat', seat)
      .execute();
  }
}
