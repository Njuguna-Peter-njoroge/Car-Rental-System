import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './Dtos/create-booking.dto';
import { UpdateBookingDto } from './Dtos/update-booking.dto';
import { SearchBookingsDto } from './Dtos/search-bookings.dto';
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
  ApiParam,
} from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Bookings')
@Controller('bookings')
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  async create(@Req() req: Request, @Body() dto: CreateBookingDto) {
    // @ts-ignore
    const userId = req.user.id;
    return this.bookingsService.createBooking(userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all bookings (with filtering)' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  async getAll(@Query() query: SearchBookingsDto) {
    return this.bookingsService.getAllBookings(query);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user bookings' })
  @ApiResponse({ status: 200, description: 'User bookings retrieved successfully' })
  async getMyBookings(@Req() req: Request, @Query() query: SearchBookingsDto) {
    // @ts-ignore
    const userId = req.user.id;
    return this.bookingsService.getUserBookings(userId, query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({ status: 200, description: 'Booking retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async getOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    // @ts-ignore
    const userId = req.user.id;
    return this.bookingsService.getBookingById(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update booking' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
    @Body() dto: UpdateBookingDto,
  ) {
    // @ts-ignore
    const userId = req.user.id;
    return this.bookingsService.updateBooking(id, userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async cancel(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    // @ts-ignore
    const userId = req.user.id;
    return this.bookingsService.cancelBooking(id, userId);
  }

  // Admin endpoints for booking approval/rejection
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  @RequirePermissions(Permission.APPROVE_BOOKING)
  @RequireRoles(Role.ADMIN, Role.AGENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a pending booking (Admin/Agent only)' })
  @ApiResponse({ status: 200, description: 'Booking approved successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 400, description: 'Invalid booking status' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async approveBooking(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.approveBooking(id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  @RequirePermissions(Permission.REJECT_BOOKING)
  @RequireRoles(Role.ADMIN, Role.AGENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a pending booking (Admin/Agent only)' })
  @ApiResponse({ status: 200, description: 'Booking rejected successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 400, description: 'Invalid booking status' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async rejectBooking(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { reason?: string },
  ) {
    return this.bookingsService.rejectBooking(id, body.reason);
  }
}
