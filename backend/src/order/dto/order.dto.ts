import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class TicketDto {
  @IsUUID()
  film: string;

  @IsUUID()
  session: string;

  @IsInt()
  @Min(1)
  row: number;

  @IsInt()
  @Min(1)
  seat: number;

  @IsOptional()
  @IsDateString()
  daytime?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}

export class OrderDto {
  @IsEmail()
  email: string;

  @IsPhoneNumber()
  phone: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TicketDto)
  tickets: TicketDto[];
}

export class BookedTicketDto extends TicketDto {
  id: string;
  daytime: string;
  price: number;
}
