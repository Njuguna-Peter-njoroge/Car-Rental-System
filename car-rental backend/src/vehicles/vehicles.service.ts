import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './Dtos/createVehicles.dto';
import { UpdateVehicleDto } from './Dtos/Updatevehicles.dto';
import { VehicleResponseDto } from './Dtos/vehicle-response.dto';
import { ApiResponse } from '../../Shared/Apiresponse';
import {
  VehicleFilters,
  VehicleSearchFilters,
  VehicleListResponse,
  VehicleReviewsResponse,
  VehicleReview,
  VehicleUpdateData,
} from './interfaces/vehicles.interfaces';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper method to transform Prisma vehicle to DTO
  private transformVehicleToDto(vehicle: any): VehicleResponseDto {
    return {
      ...vehicle,
      hourlyRate: vehicle.hourlyRate ?? undefined,
      images: vehicle.images ?? [],
      description: vehicle.description ?? undefined,
      mileage: vehicle.mileage ?? undefined
    };
  }

  async createVehicle(
    createVehicleDto: CreateVehicleDto,
  ): Promise<ApiResponse<VehicleResponseDto>> {
    // Check if the license plate already exists
    const existingLicensePlate = await this.prisma.vehicle.findUnique({
      where: { licensePlate: createVehicleDto.licensePlate },
    });
    if (existingLicensePlate) {
      throw new ConflictException(
        'Vehicle with this license plate already exists',
      );
    }

    // Check if VIN already exists
    const existingVin = await this.prisma.vehicle.findUnique({
      where: { vin: createVehicleDto.vin },
    });
    if (existingVin) {
      throw new ConflictException('Vehicle with this VIN already exists');
    }

    const vehicle = await this.prisma.vehicle.create({
      data: {
        ...createVehicleDto,
        isAvailable: createVehicleDto.isAvailable ?? true,
        status: createVehicleDto.status ?? 'ACTIVE',
        images: createVehicleDto.images ?? [],
      },
    });

    return {
      success: true,
      message: 'Vehicle created successfully',
      data: this.transformVehicleToDto(vehicle),
    };
  }

  async findAllVehicles(
    category?: string,
    location?: string,
    available?: boolean,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<VehicleListResponse>> {
    const skip = (page - 1) * limit;

    const where: VehicleFilters = {};
    if (category) where.category = category;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (available !== undefined) where.isAvailable = available;

    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return {
      success: true,
      message: 'Vehicles retrieved successfully',
      data: {
        vehicles: vehicles.map(vehicle => this.transformVehicleToDto(vehicle)),
        total,
        page,
        limit,
      },
    };
  }

  async searchVehicles(
    query: string,
    startDate?: string,
    endDate?: string,
    category?: string,
    location?: string,
  ): Promise<ApiResponse<VehicleResponseDto[]>> {
    const where: VehicleSearchFilters = {
      OR: [
        { model: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
      isAvailable: true,
    };

    if (category) where.category = category;
    if (location) where.location = { contains: location, mode: 'insensitive' };

    // If date range is provided, check for conflicting bookings
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const conflictingBookings = await this.prisma.booking.findMany({
        where: {
          vehicleId: { not: undefined },
          OR: [
            {
              AND: [{ startDate: { lte: start } }, { endDate: { gte: start } }],
            },
            {
              AND: [{ startDate: { lte: end } }, { endDate: { gte: end } }],
            },
            {
              AND: [{ startDate: { gte: start } }, { endDate: { lte: end } }],
            },
          ],
          status: { in: ['CONFIRMED', 'PENDING'] },
        },
        select: { vehicleId: true },
      });

      const conflictingVehicleIds = conflictingBookings.map(
        (booking) => booking.vehicleId,
      );
      if (conflictingVehicleIds.length > 0) {
        where.id = { notIn: conflictingVehicleIds };
      }
    }

    const vehicles = await this.prisma.vehicle.findMany({
      where,
      orderBy: { dailyRate: 'asc' },
    });

    return {
      success: true,
      message: 'Vehicle search completed',
      data: vehicles.map(vehicle => this.transformVehicleToDto(vehicle)),
    };
  }

  async findVehicleById(id: string): Promise<ApiResponse<VehicleResponseDto>> {
    if (!id) {
      throw new BadRequestException('Vehicle ID is required');
    }

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return {
      success: true,
      message: 'Vehicle retrieved successfully',
      data: this.transformVehicleToDto(vehicle),
    };
  }

  async updateVehicle(
    id: string,
    updateVehicleDto: UpdateVehicleDto,
  ): Promise<ApiResponse<VehicleResponseDto>> {
    if (!id) {
      throw new BadRequestException('Vehicle ID is required');
    }

    // Check if vehicle exists
    const existingVehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });
    if (!existingVehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // Check for license plate conflicts if being updated
    if (
      updateVehicleDto.licensePlate &&
      updateVehicleDto.licensePlate !== existingVehicle.licensePlate
    ) {
      const licensePlateExists = await this.prisma.vehicle.findUnique({
        where: { licensePlate: updateVehicleDto.licensePlate },
      });
      if (licensePlateExists) {
        throw new ConflictException(
          'Vehicle with this license plate already exists',
        );
      }
    }

    // Check for VIN conflicts if being updated
    if (updateVehicleDto.vin && updateVehicleDto.vin !== existingVehicle.vin) {
      const vinExists = await this.prisma.vehicle.findUnique({
        where: { vin: updateVehicleDto.vin },
      });
      if (vinExists) {
        throw new ConflictException('Vehicle with this VIN already exists');
      }
    }

    const updatedVehicle = await this.prisma.vehicle.update({
      where: { id },
      data: updateVehicleDto,
    });

    return {
      success: true,
      message: 'Vehicle updated successfully',
      data: this.transformVehicleToDto(updatedVehicle),
    };
  }

  async updateVehicleAvailability(
    id: string,
    isAvailable: boolean,
    reason?: string,
  ): Promise<ApiResponse<VehicleResponseDto>> {
    if (!id) {
      throw new BadRequestException('Vehicle ID is required');
    }

    const existingVehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });
    if (!existingVehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const updateData: VehicleUpdateData = { isAvailable };
    if (reason) {
      updateData.status = reason;
    }

    const updatedVehicle = await this.prisma.vehicle.update({
      where: { id },
      data: updateData,
    });

    return {
      success: true,
      message: `Vehicle availability updated to ${isAvailable ? 'available' : 'unavailable'}`,
      data: this.transformVehicleToDto(updatedVehicle),
    };
  }

  async deleteVehicle(id: string): Promise<ApiResponse<{ message: string }>> {
    if (!id) {
      throw new BadRequestException('Vehicle ID is required');
    }

    const existingVehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });
    if (!existingVehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // Check if vehicle has active bookings
    const activeBookings = await this.prisma.booking.findFirst({
      where: {
        vehicleId: id,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (activeBookings) {
      throw new BadRequestException(
        'Cannot delete vehicle with active bookings',
      );
    }

    await this.prisma.vehicle.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Vehicle deleted successfully',
      data: { message: 'Vehicle has been permanently removed' },
    };
  }

  async getVehicleReviews(
    id: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<VehicleReviewsResponse>> {
    if (!id) {
      throw new BadRequestException('Vehicle ID is required');
    }

    const existingVehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });
    if (!existingVehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: {
          vehicleId: id,
          isApproved: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({
        where: {
          vehicleId: id,
          isApproved: true,
        },
      }),
    ]);

    return {
      success: true,
      message: 'Vehicle reviews retrieved successfully',
      data: {
        reviews,
        total,
        page,
        limit,
      },
    };
  }

  async createVehicleReview(
    id: string,
    userId: string,
    rating: number,
    comment?: string,
  ): Promise<ApiResponse<VehicleReview>> {
    if (!id) {
      throw new BadRequestException('Vehicle ID is required');
    }

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const existingVehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });
    if (!existingVehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // Check if user has already reviewed this vehicle
    const existingReview = await this.prisma.review.findFirst({
      where: {
        vehicleId: id,
        userId: userId,
      },
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this vehicle');
    }

    const review = await this.prisma.review.create({
      data: {
        vehicleId: id,
        userId: userId,
        rating,
        comment,
        isApproved: false, // Requires admin approval
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Review submitted successfully and pending approval',
      data: review,
    };
  }
}
