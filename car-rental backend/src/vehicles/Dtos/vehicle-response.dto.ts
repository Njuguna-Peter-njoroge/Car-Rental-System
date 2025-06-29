import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VehicleResponseDto {
  @ApiProperty({ description: 'Vehicle ID' })
  id: string;

  @ApiProperty({ description: 'Vehicle model name' })
  model: string;

  @ApiProperty({ description: 'Manufacturing year' })
  year: number;

  @ApiProperty({ description: 'License plate number' })
  licensePlate: string;

  @ApiProperty({ description: 'Vehicle Identification Number' })
  vin: string;

  @ApiProperty({ description: 'Vehicle category' })
  category: string;

  @ApiProperty({ description: 'Transmission type' })
  transmission: string;

  @ApiProperty({ description: 'Fuel type' })
  fuelType: string;

  @ApiProperty({ description: 'Number of seats' })
  seats: number;

  @ApiProperty({ description: 'Daily rental rate' })
  dailyRate: number;

  @ApiPropertyOptional({ description: 'Hourly rental rate' })
  hourlyRate?: number;

  @ApiProperty({ description: 'Vehicle availability status' })
  isAvailable: boolean;

  @ApiProperty({ description: 'Vehicle location' })
  location: string;

  @ApiProperty({ description: 'Vehicle features', type: [String] })
  features: string[];

  @ApiPropertyOptional({ description: 'Vehicle images', type: [String] })
  images?: string[];

  @ApiPropertyOptional({ description: 'Vehicle description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Vehicle mileage' })
  mileage?: number;

  @ApiProperty({ description: 'Vehicle status' })
  status: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
