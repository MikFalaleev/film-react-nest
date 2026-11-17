//TODO реализовать DTO для /orders
export class TicketDto {
  film: string;
  session: string;
  row: number;
  seat: number;
  daytime: string;
  price: number;
}

export class OrderDto {
  email: string;
  phone: string;
  tickets: TicketDto[];
}

export class BookedTicketDto extends TicketDto {
  id: string;
}
