import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/Guards/jwt/jwt-auth.guard/jwt-auth.guard';
import { PermissionsGuard } from '../auth/Guards/permissions.guard';
import { RolesGuard } from '../auth/Guards/roles.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorators';
import { RequireRoles } from '../auth/decorators/roles.decorators';
import { Permission } from '../../permissions/permissions';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('Admin Dashboard')
@Controller('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@RequireRoles(Role.ADMIN, Role.AGENT)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @RequirePermissions(Permission.VIEW_DASHBOARD)
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('bookings')
  @RequirePermissions(Permission.LIST_BOOKINGS)
  @ApiOperation({ summary: 'Get all bookings with filtering' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by booking status' })
  getAllBookings(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllBookings(page, limit, status);
  }

  @Patch('bookings/:id/approve')
  @RequirePermissions(Permission.APPROVE_BOOKING)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a pending booking' })
  @ApiResponse({ status: 200, description: 'Booking approved successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 400, description: 'Invalid booking status' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  approveBooking(@Param('id') id: string) {
    return this.adminService.approveBooking(id);
  }

  @Patch('bookings/:id/reject')
  @RequirePermissions(Permission.REJECT_BOOKING)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a pending booking' })
  @ApiResponse({ status: 200, description: 'Booking rejected successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 400, description: 'Invalid booking status' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  rejectBooking(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.adminService.rejectBooking(id, body.reason);
  }

  @Get('reviews')
  @RequirePermissions(Permission.LIST_REVIEWS)
  @ApiOperation({ summary: 'Get all reviews with filtering' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by review status (pending/approved)' })
  getAllReviews(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: 'pending' | 'approved',
  ) {
    return this.adminService.getAllReviews(page, limit, status);
  }

  @Patch('reviews/:id/approve')
  @RequirePermissions(Permission.MODERATE_REVIEW)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a pending review' })
  @ApiResponse({ status: 200, description: 'Review approved successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiResponse({ status: 400, description: 'Review already approved' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  approveReview(@Param('id') id: string) {
    return this.adminService.approveReview(id);
  }

  @Patch('reviews/:id/reject')
  @RequirePermissions(Permission.MODERATE_REVIEW)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject and delete a review' })
  @ApiResponse({ status: 200, description: 'Review rejected successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  rejectReview(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.adminService.rejectReview(id, body.reason);
  }
} 