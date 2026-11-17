import { Schema } from 'mongoose';
import { FilmDto, SessionDto } from '../films/dto/films.dto';

export type FilmRecord = FilmDto & {
  schedule: SessionDto[];
};

const sessionSchema = new Schema<SessionDto>(
  {
    id: { type: String, required: true },
    daytime: { type: String, required: true },
    hall: { type: String, required: true },
    rows: { type: Number, required: true },
    seats: { type: Number, required: true },
    price: { type: Number, required: true },
    taken: { type: [String], default: [] },
  },
  { _id: false },
);

export const filmSchema = new Schema<FilmRecord>(
  {
    id: { type: String, required: true },
    rating: Number,
    director: String,
    tags: [String],
    title: String,
    about: String,
    description: String,
    image: String,
    cover: String,
    schedule: [sessionSchema],
  },
  { collection: 'films' },
);
