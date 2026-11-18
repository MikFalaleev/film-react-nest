import { FilmDto, SessionDto } from '../films/dto/films.dto';

export abstract class FilmsRepository {
  abstract findAll(): Promise<FilmDto[]>;

  abstract findSchedule(filmId: string): Promise<SessionDto[] | null>;

  abstract reserveSeat(
    filmId: string,
    sessionId: string,
    seat: string,
  ): Promise<boolean>;

  abstract releaseSeat(
    filmId: string,
    sessionId: string,
    seat: string,
  ): Promise<void>;
}
