import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponse } from '../../Shared/Apiresponse';

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalVehicles: number;
  availableVehicles: number;
  totalBookings: number;
  activeBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalReviews: number;
  pendingReviews: number;
  totalLocations: number;
}

export interface DashboardStats {
  stats: SystemStats;
  recentBookings: any[];
  recentReviews: any[];
  topVehicles: any[];
  revenueChart: any[];
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const [
      totalUsers,
      activeUsers,
      totalVehicles,
      availableVehicles,
      totalBookings,
      activeBookings,
      pendingBookings,
      totalRevenue,
      monthlyRevenue,
      totalReviews,
      pendingReviews,
      totalLocations,
      recentBookings,
      recentReviews,
      topVehicles,
      revenueChart
    ] = await Promise.all([
      // User stats
      this.prisma.user.count(),
      this.prisma.user.count({ where: { Status: 'ACTIVE' } }),
      
      // Vehicle stats
      this.prisma.vehicle.count(),
      this.prisma.vehicle.count({ where: { isAvailable: true } }),
      
      // Booking stats
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.booking.count({ where: { status: 'PENDING' } }),
      
      // Revenue stats
      this.getTotalRevenue(),
      this.getMonthlyRevenue(),
      
      // Review stats
      this.prisma.review.count(),
      this.prisma.review.count({ where: { isApproved: false } }),
      
      // Location stats
      this.prisma.location.count(),
      
      // Recent data
      this.getRecentBookings(),
      this.getRecentReviews(),
      this.getTopVehicles(),
      this.getRevenueChart()
    ]);

    const stats: SystemStats = {
      totalUsers,
      activeUsers,
      totalVehicles,
      availableVehicles,
      totalBookings,
      activeBookings,
      pendingBookings,
      totalRevenue,
      monthlyRevenue,
      totalReviews,
      pendingReviews,
      totalLocations
    };

    return {
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: {
        stats,
        recentBookings,
        recentReviews,
        topVehicles,
        revenueChart
      }
    };
  }

  async approveBooking(bookingId: string): Promise<ApiResponse<any>> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { vehicle: true, user: true }
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Only pending bookings can be approved');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
      include: { vehicle: true, user: true }
    });

    return {
      success: true,
      message: 'Booking approved successfully',
      data: updatedBooking
    };
  }

  async rejectBooking(bookingId: string, reason?: string): Promise<ApiResponse<any>> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { vehicle: true, user: true }
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Only pending bookings can be rejected');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status: 'CANCELLED',
        notes: reason ? `Rejected: ${reason}` : 'Rejected by admin'
      },
      include: { vehicle: true, user: true }
    });

    return {
      success: true,
      message: 'Booking rejected successfully',
      data: updatedBooking
    };
  }

  async approveReview(reviewId: string): Promise<ApiResponse<any>> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { user: true, vehicle: true }
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.isApproved) {
      throw new BadRequestException('Review is already approved');
    }

    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: { isApproved: true },
      include: { user: true, vehicle: true }
    });

    return {
      success: true,
      message: 'Review approved successfully',
      data: updatedReview
    };
  }

  async rejectReview(reviewId: string, reason?: string): Promise<ApiResponse<any>> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { user: true, vehicle: true }
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Delete the review instead of just marking as rejected
    await this.prisma.review.delete({
      where: { id: reviewId }
    });

    return {
      success: true,
      message: 'Review rejected and deleted successfully',
      data: { id: reviewId }
    };
  }

  async getAllReviews(page: number = 1, limit: number = 10, status?: 'pending' | 'approved'): Promise<ApiResponse<any>> {
    const skip = (page - 1) * limit;
    
    const where = status === 'pending' 
      ? { isApproved: false }
      : status === 'approved'
      ? { isApproved: true }
      : {};

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true
            }
          },
          vehicle: {
            select: {
              id: true,
              model: true,
              licensePlate: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.review.count({ where })
    ]);

    return {
      success: true,
      message: 'Reviews retrieved successfully',
      data: {
        reviews,
        total,
        page,
        limit
      }
    };
  }

  async getAllBookings(page: number = 1, limit: number = 10, status?: string): Promise<ApiResponse<any>> {
    const skip = (page - 1) * limit;
    
    const where = status ? { status } : {};

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          vehicle: {
            select: {
              id: true,
              model: true,
              licensePlate: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.booking.count({ where })
    ]);

    return {
      success: true,
      message: 'Bookings retrieved successfully',
      data: {
        bookings,
        total,
        page,
        limit
      }
    };
  }

  private async getTotalRevenue(): Promise<number> {
    const result = await this.prisma.payment.aggregate({
      where: { paymentStatus: 'COMPLETED' },
      _sum: { amount: true }
    });
    return result._sum.amount || 0;
  }

  private async getMonthlyRevenue(): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await this.prisma.payment.aggregate({
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: { gte: startOfMonth }
      },
      _sum: { amount: true }
    });
    return result._sum.amount || 0;
  }

  private async getRecentBookings(): Promise<any[]> {
    return this.prisma.booking.findMany({
      take: 5,
      include: {
        user: { select: { name: true, email: true } },
        vehicle: { select: { model: true, licensePlate: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  private async getRecentReviews(): Promise<any[]> {
    return this.prisma.review.findMany({
      take: 5,
      include: {
        user: { select: { name: true } },
        vehicle: { select: { model: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  private async getTopVehicles(): Promise<any[]> {
    return this.prisma.vehicle.findMany({
      take: 5,
      include: {
        _count: { select: { bookings: true } }
      },
      orderBy: { bookings: { _count: 'desc' } }
    });
  }

  private async getRevenueChart(): Promise<any[]> {
    // Get revenue for last 6 months
    const months: Array<{ month: string; revenue: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setMonth(endDate.getMonth() + 1);
      
      const result = await this.prisma.payment.aggregate({
        where: {
          paymentStatus: 'COMPLETED',
          createdAt: { gte: date, lt: endDate }
        },
        _sum: { amount: true }
      });
      
      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        revenue: result._sum.amount || 0
      });
    }
    
    return months;
  }
} 