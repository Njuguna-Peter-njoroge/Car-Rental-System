import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/Guards/jwt/jwt-auth.guard/jwt-auth.guard';
import { PermissionsGuard } from '../auth/Guards/permissions.guard';
import { RolesGuard } from '../auth/Guards/roles.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorators';
import { RequireRoles } from '../auth/decorators/roles.decorators';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { Permission } from '../../permissions/permissions';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './Dtos/createVehicles.dto';
import { UpdateVehicleDto } from './Dtos/Updatevehicles.dto';
import { VehicleResponseDto } from './Dtos/vehicle-response.dto';

@ApiTags('Vehicles')
@Controller('vehicles')
@ApiBearerAuth()
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  @RequirePermissions(Permission.CREATE_VEHICLE)
  @RequireRoles(Role.ADMIN, Role.AGENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new vehicle (Admin/Agent only)' })
  @ApiResponse({
    status: 201,
    description: 'Vehicle created successfully',
    type: VehicleResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({
    status: 409,
    description: 'Vehicle with license plate or VIN already exists',
  })
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.createVehicle(createVehicleDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.LIST_VEHICLES)
  @ApiOperation({ summary: 'Get all vehicles with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Vehicles retrieved successfully' })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by vehicle category',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location',
  })
  @ApiQuery({
    name: 'available',
    required: false,
    description: 'Filter by availability',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    type: Number,
  })
  findAll(
    @Query('category') category?: string,
    @Query('location') location?: string,
    @Query('available') available?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.vehiclesService.findAllVehicles(
      category,
      location,
      available,
      page,
      limit,
    );
  }

  @Get('search')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.LIST_VEHICLES)
  @ApiOperation({ summary: 'Search vehicles with availability check' })
  @ApiResponse({ status: 200, description: 'Search results retrieved' })
  @ApiQuery({ name: 'query', required: true, description: 'Search query' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date for availability check',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date for availability check',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location',
  })
  search(
    @Query('query') query: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('category') category?: string,
    @Query('location') location?: string,
  ) {
    return this.vehiclesService.searchVehicles(
      query,
      startDate,
      endDate,
      category,
      location,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.READ_VEHICLE)
  @ApiOperation({ summary: 'Get vehicle by ID' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle retrieved successfully',
    type: VehicleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findVehicleById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  @RequirePermissions(Permission.UPDATE_VEHICLE)
  @RequireRoles(Role.ADMIN, Role.AGENT)
  @ApiOperation({ summary: 'Update vehicle (Admin/Agent only)' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle updated successfully',
    type: VehicleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({
    status: 409,
    description: 'Vehicle with license plate or VIN already exists',
  })
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesService.updateVehicle(id, updateVehicleDto);
  }

  @Patch(':id/availability')
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  @RequirePermissions(Permission.MANAGE_VEHICLE_AVAILABILITY)
  @RequireRoles(Role.ADMIN, Role.AGENT)
  @ApiOperation({ summary: 'Update vehicle availability (Admin/Agent only)' })
  @ApiResponse({
    status: 200,
    description: 'Availability updated successfully',
    type: VehicleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  updateAvailability(
    @Param('id') id: string,
    @Body() body: { isAvailable: boolean; reason?: string },
  ) {
    return this.vehiclesService.updateVehicleAvailability(
      id,
      body.isAvailable,
      body.reason,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  @RequirePermissions(Permission.DELETE_VEHICLE)
  @RequireRoles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete vehicle (Admin only)' })
  @ApiResponse({ status: 200, description: 'Vehicle deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete vehicle with active bookings',
  })
  remove(@Param('id') id: string) {
    return this.vehiclesService.deleteVehicle(id);
  }

  @Get(':id/reviews')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.READ_REVIEW)
  @ApiOperation({ summary: 'Get vehicle reviews' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    type: Number,
  })
  getReviews(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.vehiclesService.getVehicleReviews(id, page, limit);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.CREATE_REVIEW)
  @ApiOperation({ summary: 'Create vehicle review' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({
    status: 409,
    description: 'You have already reviewed this vehicle',
  })
  createReview(
    @Param('id') id: string,
    @Body() createReviewDto: { rating: number; comment?: string },
    @CurrentUser()
    user: { id: string; name: string; email: string; role: string },
  ) {
    return this.vehiclesService.createVehicleReview(
      id,
      user.id,
      createReviewDto.rating,
      createReviewDto.comment,
    );
  }
}
