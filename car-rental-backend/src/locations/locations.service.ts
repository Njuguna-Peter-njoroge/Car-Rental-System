import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponse } from '../../Shared/Apiresponse';

export interface CreateLocationDto {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone?: string;
  email?: string;
}

export interface UpdateLocationDto {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export interface LocationResponseDto {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper method to transform Prisma location to DTO
  private transformLocationToDto(location: any): LocationResponseDto {
    return {
      ...location,
      phone: location.phone ?? undefined,
      email: location.email ?? undefined
    };
  }

  async createLocation(createLocationDto: CreateLocationDto): Promise<ApiResponse<LocationResponseDto>> {
    const location = await this.prisma.location.create({
      data: createLocationDto,
    });

    return {
      success: true,
      message: 'Location created successfully',
      data: this.transformLocationToDto(location),
    };
  }

  async findAllLocations(page: number = 1, limit: number = 10, isActive?: boolean): Promise<ApiResponse<any>> {
    const skip = (page - 1) * limit;
    
    const where = isActive !== undefined ? { isActive } : {};

    const [locations, total] = await Promise.all([
      this.prisma.location.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.location.count({ where }),
    ]);

    return {
      success: true,
      message: 'Locations retrieved successfully',
      data: {
        locations: locations.map(location => this.transformLocationToDto(location)),
        total,
        page,
        limit,
      },
    };
  }

  async findLocationById(id: string): Promise<ApiResponse<LocationResponseDto>> {
    if (!id) {
      throw new BadRequestException('Location ID is required');
    }

    const location = await this.prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return {
      success: true,
      message: 'Location retrieved successfully',
      data: this.transformLocationToDto(location),
    };
  }

  async updateLocation(id: string, updateLocationDto: UpdateLocationDto): Promise<ApiResponse<LocationResponseDto>> {
    if (!id) {
      throw new BadRequestException('Location ID is required');
    }

    const existingLocation = await this.prisma.location.findUnique({
      where: { id },
    });

    if (!existingLocation) {
      throw new NotFoundException('Location not found');
    }

    const updatedLocation = await this.prisma.location.update({
      where: { id },
      data: updateLocationDto,
    });

    return {
      success: true,
      message: 'Location updated successfully',
      data: this.transformLocationToDto(updatedLocation),
    };
  }

  async deleteLocation(id: string): Promise<ApiResponse<{ message: string }>> {
    if (!id) {
      throw new BadRequestException('Location ID is required');
    }

    const existingLocation = await this.prisma.location.findUnique({
      where: { id },
    });

    if (!existingLocation) {
      throw new NotFoundException('Location not found');
    }

    // Check if location has associated vehicles
    const vehiclesWithLocation = await this.prisma.vehicle.findFirst({
      where: { location: existingLocation.name },
    });

    if (vehiclesWithLocation) {
      throw new BadRequestException(
        'Cannot delete location that has associated vehicles',
      );
    }

    await this.prisma.location.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Location deleted successfully',
      data: { message: 'Location has been permanently removed' },
    };
  }

  async toggleLocationStatus(id: string): Promise<ApiResponse<LocationResponseDto>> {
    if (!id) {
      throw new BadRequestException('Location ID is required');
    }

    const existingLocation = await this.prisma.location.findUnique({
      where: { id },
    });

    if (!existingLocation) {
      throw new NotFoundException('Location not found');
    }

    const updatedLocation = await this.prisma.location.update({
      where: { id },
      data: { isActive: !existingLocation.isActive },
    });

    return {
      success: true,
      message: `Location ${updatedLocation.isActive ? 'activated' : 'deactivated'} successfully`,
      data: this.transformLocationToDto(updatedLocation),
    };
  }
} 