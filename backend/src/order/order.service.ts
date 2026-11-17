import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ListResponseDto } from '../films/dto/films.dto';
import { FilmsRepository } from '../repository/films.repository';
import { BookedTicketDto, OrderDto } from './dto/order.dto';

@Injectable()
export class OrderService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  async createOrder(
    order: OrderDto,
  ): Promise<ListResponseDto<BookedTicketDto>> {
    if (!Array.isArray(order?.tickets) || order.tickets.length === 0) {
      throw new BadRequestException({
        error: 'Добавьте хотя бы один билет',
      });
    }

    const items: BookedTicketDto[] = [];
    const seatsInOrder = new Set<string>();

    // Проверяем все билеты до начала записи.
    for (const ticket of order.tickets) {
      if (
        typeof ticket?.film !== 'string' ||
        typeof ticket?.session !== 'string' ||
        !Number.isInteger(ticket.row) ||
        !Number.isInteger(ticket.seat)
      ) {
        throw new BadRequestException({
          error: 'Некорректные данные билета',
        });
      }

      const schedule = await this.filmsRepository.findSchedule(ticket.film);
      const session = schedule?.find((item) => item.id === ticket.session);

      if (!session) {
        throw new BadRequestException({
          error: 'Сеанс фильма не найден',
        });
      }

      if (
        ticket.row < 1 ||
        ticket.row > session.rows ||
        ticket.seat < 1 ||
        ticket.seat > session.seats
      ) {
        throw new BadRequestException({
          error: 'Такого места в зале нет',
        });
      }

      const seat = `${ticket.row}:${ticket.seat}`;
      const bookingKey = JSON.stringify([
        ticket.film,
        ticket.session,
        ticket.row,
        ticket.seat,
      ]);

      if (seatsInOrder.has(bookingKey)) {
        throw new BadRequestException({
          error: `Место ${seat} повторяется в заказе`,
        });
      }

      if (session.taken.includes(seat)) {
        throw new BadRequestException({
          error: `Место ${seat} уже занято`,
        });
      }

      seatsInOrder.add(bookingKey);

      items.push({
        id: randomUUID(),
        film: ticket.film,
        session: ticket.session,
        row: ticket.row,
        seat: ticket.seat,
        daytime: session.daytime,
        price: session.price,
      });
    }

    const reserved: BookedTicketDto[] = [];

    try {
      for (const ticket of items) {
        const seat = `${ticket.row}:${ticket.seat}`;

        const success = await this.filmsRepository.reserveSeat(
          ticket.film,
          ticket.session,
          seat,
        );

        if (!success) {
          throw new BadRequestException({
            error: `Место ${seat} уже занято или сеанс недоступен`,
          });
        }

        reserved.push(ticket);
      }
    } catch (error) {
      // Освобождаем места, записанные в рамках этого запроса.
      await Promise.all(
        reserved.map((ticket) =>
          this.filmsRepository.releaseSeat(
            ticket.film,
            ticket.session,
            `${ticket.row}:${ticket.seat}`,
          ),
        ),
      );

      throw error;
    }

    return { total: items.length, items };
  }
}
