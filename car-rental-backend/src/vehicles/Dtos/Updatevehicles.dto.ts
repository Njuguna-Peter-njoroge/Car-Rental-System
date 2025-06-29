import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVehicleDto {
  @ApiPropertyOptional({ description: 'Vehicle model name' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ description: 'Manufacturing year' })
  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year?: number;

  @ApiPropertyOptional({ description: 'License plate number' })
  @IsOptional()
  @IsString()
  licensePlate?: string;

  @ApiPropertyOptional({ description: 'Vehicle Identification Number' })
  @IsOptional()
  @IsString()
  vin?: string;

  @ApiPropertyOptional({
    description: 'Vehicle category (SUV, Sedan, Economy, etc.)',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Transmission type' })
  @IsOptional()
  @IsString()
  transmission?: string;

  @ApiPropertyOptional({ description: 'Fuel type' })
  @IsOptional()
  @IsString()
  fuelType?: string;

  @ApiPropertyOptional({ description: 'Number of seats' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  seats?: number;

  @ApiPropertyOptional({ description: 'Daily rental rate' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyRate?: number;

  @ApiPropertyOptional({ description: 'Hourly rental rate' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @ApiPropertyOptional({ description: 'Vehicle availability status' })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ description: 'Vehicle location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Vehicle features', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

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
