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

  async searchVehicles(options: {
    query?: string;
    category?: string;
    transmission?: string;
    fuelType?: string;
    minSeats?: number;
    maxSeats?: number;
    minDailyRate?: number;
    maxDailyRate?: number;
    location?: string;
  } = {}): Promise<ApiResponse<VehicleResponseDto[]>> {
    const {
      query,
      category,
      transmission,
      fuelType,
      minSeats,
      maxSeats,
      minDailyRate,
      maxDailyRate,
      location,
    } = options;

    const where: any = {};

    if (query) {
      where.OR = [
        { model: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { licensePlate: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (category) where.category = category;
    if (transmission) where.transmission = transmission;
    if (fuelType) where.fuelType = fuelType;
    if (location) where.location = { contains: location, mode: 'insensitive' };

    if (minSeats || maxSeats) {
      where.seats = {};
      if (minSeats) where.seats.gte = minSeats;
      if (maxSeats) where.seats.lte = maxSeats;
    }

    if (minDailyRate || maxDailyRate) {
      where.dailyRate = {};
      if (minDailyRate) where.dailyRate.gte = minDailyRate;
      if (maxDailyRate) where.dailyRate.lte = maxDailyRate;
    }

    const vehicles = await this.prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Check if vehicle exists
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has already reviewed this vehicle
    const existingReview = await this.prisma.review.findFirst({
      where: {
        vehicleId: id,
        userId: userId,
      },
    });

    if (existingReview) {
      throw new ConflictException('User has already reviewed this vehicle');
    }

    const review = await this.prisma.review.create({
      data: {
        vehicleId: id,
        userId: userId,
        rating,
        comment,
        isApproved: false, // Reviews need approval by default
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
      message: 'Review created successfully',
      data: {
        id: review.id,
        userId: review.userId,
        vehicleId: review.vehicleId,
        bookingId: review.bookingId,
        rating: review.rating,
        comment: review.comment,
        isApproved: review.isApproved,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        user: {
          id: review.user.id,
          name: review.user.name,
          profileImage: review.user.profileImage ?? null,
        },
      },
    };
  }

  async getAvailableVehicles(options: {
    category?: string;
    location?: string;
    minSeats?: number;
  } = {}): Promise<ApiResponse<VehicleResponseDto[]>> {
    const { category, location, minSeats } = options;
    
    const where: any = { isAvailable: true };
    
    if (category) where.category = category;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (minSeats) where.seats = { gte: minSeats };

    const vehicles = await this.prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      message: 'Available vehicles retrieved successfully',
      data: vehicles.map(vehicle => this.transformVehicleToDto(vehicle)),
    };
  }

  async getVehiclesByCategory(category: string): Promise<ApiResponse<VehicleResponseDto[]>> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { category: { equals: category, mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      message: 'Vehicles by category retrieved successfully',
      data: vehicles.map(vehicle => this.transformVehicleToDto(vehicle)),
    };
  }

  async getVehiclesByLocation(location: string): Promise<ApiResponse<VehicleResponseDto[]>> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { location: { contains: location, mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      message: 'Vehicles by location retrieved successfully',
      data: vehicles.map(vehicle => this.transformVehicleToDto(vehicle)),
    };
  }

  async getVehicleStats(options: { startDate?: string; endDate?: string } = {}): Promise<ApiResponse<any>> {
    const { startDate, endDate } = options;
    
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [
      totalVehicles,
      availableVehicles,
      maintenanceVehicles,
      categoryStats,
    ] = await Promise.all([
      this.prisma.vehicle.count({ where }),
      this.prisma.vehicle.count({ where: { ...where, isAvailable: true } }),
      this.prisma.vehicle.count({ where: { ...where, status: 'MAINTENANCE' } }),
      this.prisma.vehicle.groupBy({
        by: ['category'],
        where,
        _count: { id: true },
      }),
    ]);

    return {
      success: true,
      message: 'Vehicle statistics retrieved successfully',
      data: {
        totalVehicles,
        availableVehicles,
        maintenanceVehicles,
        categoryStats,
      },
    };
  }

  async updateBulkStatus(bulkStatusDto: { vehicleIds: string[]; status: string }): Promise<ApiResponse<any>> {
    const { vehicleIds, status } = bulkStatusDto;

    if (!vehicleIds || vehicleIds.length === 0) {
      throw new BadRequestException('Vehicle IDs are required');
    }

    if (!status) {
      throw new BadRequestException('Status is required');
    }

    const result = await this.prisma.vehicle.updateMany({
      where: {
        id: { in: vehicleIds },
      },
      data: {
        status: status as any,
        isAvailable: status === 'ACTIVE',
      },
    });

    return {
      success: true,
      message: 'Bulk vehicle status updated successfully',
      data: {
        updatedCount: result.count,
      },
    };
  }

  async getVehicleImages(id: string): Promise<ApiResponse<string[]>> {
    if (!id) {
      throw new BadRequestException('Vehicle ID is required');
    }

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      select: { images: true },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return {
      success: true,
      message: 'Vehicle images retrieved successfully',
      data: vehicle.images || [],
    };
  }

  async uploadVehicleImages(id: string, images: any[]): Promise<ApiResponse<any>> {
    if (!id) {
      throw new BadRequestException('Vehicle ID is required');
    }

    if (!images || images.length === 0) {
      throw new BadRequestException('Images are required');
    }

    // Check if vehicle exists
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // For now, we'll just return a success message
    // In a real implementation, you would upload images to Cloudinary or similar service
    const imageUrls = images.map((image, index) => `https://example.com/vehicle-${id}-image-${index}.jpg`);

    // Update vehicle with new images
    const updatedVehicle = await this.prisma.vehicle.update({
      where: { id },
      data: {
        images: [...(vehicle.images || []), ...imageUrls],
      },
    });

    return {
      success: true,
      message: 'Vehicle images uploaded successfully',
      data: {
        vehicleId: id,
        uploadedImages: imageUrls,
        totalImages: updatedVehicle.images.length,
      },
    };
  }
}
