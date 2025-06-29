import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({ description: 'Vehicle model name' })
  @IsString()
  model: string;

  @ApiProperty({ description: 'Manufacturing year' })
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @ApiProperty({ description: 'License plate number' })
  @IsString()
  licensePlate: string;

  @ApiProperty({ description: 'Vehicle Identification Number' })
  @IsString()
  vin: string;

  @ApiProperty({ description: 'Vehicle category (SUV, Sedan, Economy, etc.)' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Transmission type' })
  @IsString()
  transmission: string;

  @ApiProperty({ description: 'Fuel type' })
  @IsString()
  fuelType: string;

  @ApiProperty({ description: 'Number of seats' })
  @IsNumber()
  @Min(1)
  @Max(20)
  seats: number;

  @ApiProperty({ description: 'Daily rental rate' })
  @IsNumber()
  @Min(0)
  dailyRate: number;

  @ApiPropertyOptional({ description: 'Hourly rental rate' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @ApiPropertyOptional({ description: 'Vehicle availability status' })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ description: 'Vehicle location' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Vehicle features', type: [String] })
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @ApiPropertyOptional({ description: 'Vehicle images', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'Vehicle description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Vehicle mileage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  mileage?: number;

  @ApiPropertyOptional({ description: 'Vehicle status' })
  @IsOptional()
  @IsString()
  status?: string;
}
