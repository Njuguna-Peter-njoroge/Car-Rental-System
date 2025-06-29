import { IsString, IsDateString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export class CreateBookingDto {
  @IsString()
  vehicleId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  pickupLocation: string;

  @IsString()
  returnLocation: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;
} 