import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, BookingStatus } from './Dtos/create-booking.dto';
import { UpdateBookingDto } from './Dtos/update-booking.dto';
import { BookingResponseDto } from './Dtos/booking-response.dto';
import { SearchBookingsDto } from './Dtos/search-bookings.dto';
import { ApiResponse } from '../../Shared/Apiresponse';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(userId: string, dto: CreateBookingDto): Promise<BookingResponseDto> {
    // Check vehicle availability
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: dto.vehicleId } });
    if (!vehicle || !vehicle.isAvailable) {
      throw new BadRequestException('Vehicle not available');
    }

    // Check for overlapping bookings
    const overlapping = await this.prisma.booking.findFirst({
      where: {
        vehicleId: dto.vehicleId,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
        OR: [
          {
            startDate: { lte: new Date(dto.endDate) },
            endDate: { gte: new Date(dto.startDate) },
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException('Vehicle already booked for selected period');
    }

    // Calculate total amount
    const days = (new Date(dto.endDate).getTime() - new Date(dto.startDate).getTime()) / (1000 * 60 * 60 * 24);
    const totalAmount = Math.ceil(days) * vehicle.dailyRate;

    // Create booking
    const booking = await this.prisma.booking.create({
      data: {
        userId,
        vehicleId: dto.vehicleId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        totalAmount,
        pickupLocation: dto.pickupLocation,
        returnLocation: dto.returnLocation,
        notes: dto.notes,
        status: BookingStatus.PENDING,
      },
      include: {
        vehicle: { select: { id: true, model: true, year: true, category: true, dailyRate: true, images: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return booking as BookingResponseDto;
  }

  async getAllBookings(query: SearchBookingsDto): Promise<BookingResponseDto[]> {
    const { userId, vehicleId, startDate, endDate, status, pickupLocation, page = 1, limit = 10 } = query;
    
    const where: any = {};
    if (userId) where.userId = userId;
    if (vehicleId) where.vehicleId = vehicleId;
    if (status) where.status = status;
    if (pickupLocation) where.pickupLocation = { contains: pickupLocation, mode: 'insensitive' };
    
    if (startDate && endDate) {
      where.OR = [
        { startDate: { lte: new Date(endDate) }, endDate: { gte: new Date(startDate) } },
      ];
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        vehicle: { select: { id: true, model: true, year: true, category: true, dailyRate: true, images: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return bookings as BookingResponseDto[];
  }

  async getBookingById(id: string, userId?: string): Promise<BookingResponseDto> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        vehicle: { select: { id: true, model: true, year: true, category: true, dailyRate: true, images: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (userId && booking.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return booking as BookingResponseDto;
  }

  async updateBooking(id: string, userId: string, dto: UpdateBookingDto): Promise<BookingResponseDto> {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Only allow update if booking is not completed/cancelled
    if ([BookingStatus.COMPLETED, BookingStatus.CANCELLED].includes(booking.status as BookingStatus)) {
      throw new BadRequestException('Cannot modify completed or cancelled booking');
    }

    // If dates are updated, check for overlap
    if (dto.startDate && dto.endDate) {
      const overlapping = await this.prisma.booking.findFirst({
        where: {
          id: { not: id },
          vehicleId: booking.vehicleId,
          status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
          OR: [
            {
              startDate: { lte: new Date(dto.endDate) },
              endDate: { gte: new Date(dto.startDate) },
            },
          ],
        },
      });

      if (overlapping) {
        throw new BadRequestException('Vehicle already booked for selected period');
      }
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: {
        vehicle: { select: { id: true, model: true, year: true, category: true, dailyRate: true, images: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return updated as BookingResponseDto;
  }

  async cancelBooking(id: string, userId: string): Promise<BookingResponseDto> {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if ([BookingStatus.COMPLETED, BookingStatus.CANCELLED].includes(booking.status as BookingStatus)) {
      throw new BadRequestException('Cannot cancel completed or already cancelled booking');
    }

    const cancelled = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: {
        vehicle: { select: { id: true, model: true, year: true, category: true, dailyRate: true, images: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return cancelled as BookingResponseDto;
  }

  async getUserBookings(userId: string, query: SearchBookingsDto): Promise<BookingResponseDto[]> {
    return this.getAllBookings({ ...query, userId });
  }

  // Admin methods for booking approval/rejection
  async approveBooking(id: string): Promise<ApiResponse<BookingResponseDto>> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        vehicle: { select: { id: true, model: true, year: true, category: true, dailyRate: true, images: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be approved');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CONFIRMED },
      include: {
        vehicle: { select: { id: true, model: true, year: true, category: true, dailyRate: true, images: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return {
      success: true,
      message: 'Booking approved successfully',
      data: updatedBooking as BookingResponseDto,
    };
  }

  async rejectBooking(id: string, reason?: string): Promise<ApiResponse<BookingResponseDto>> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        vehicle: { select: { id: true, model: true, year: true, category: true, dailyRate: true, images: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be rejected');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: { 
        status: BookingStatus.CANCELLED,
        notes: reason ? `Rejected: ${reason}` : 'Rejected by admin'
      },
      include: {
        vehicle: { select: { id: true, model: true, year: true, category: true, dailyRate: true, images: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return {
      success: true,
      message: 'Booking rejected successfully',
      data: updatedBooking as BookingResponseDto,
    };
  }
} 