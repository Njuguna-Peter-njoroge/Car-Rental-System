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
  UseInterceptors,
  UploadedFiles,
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
  ApiConsumes,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
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

  @Get('available')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.LIST_VEHICLES)
  @ApiOperation({ summary: 'Get available vehicles with optional filters' })
  @ApiResponse({ status: 200, description: 'Available vehicles retrieved successfully' })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'location', required: false, type: String })
  @ApiQuery({ name: 'minSeats', required: false, type: Number })
  getAvailableVehicles(
    @Query('category') category?: string,
    @Query('location') location?: string,
    @Query('minSeats') minSeats?: number,
  ) {
    return this.vehiclesService.getAvailableVehicles({ category, location, minSeats });
  }

  @Get('search')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.LIST_VEHICLES)
  @ApiOperation({ summary: 'Search vehicles with advanced filters' })
  @ApiResponse({ status: 200, description: 'Search results retrieved' })
  @ApiQuery({ name: 'query', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'transmission', required: false, type: String })
  @ApiQuery({ name: 'fuelType', required: false, type: String })
  @ApiQuery({ name: 'minSeats', required: false, type: Number })
  @ApiQuery({ name: 'maxSeats', required: false, type: Number })
  @ApiQuery({ name: 'minDailyRate', required: false, type: Number })
  @ApiQuery({ name: 'maxDailyRate', required: false, type: Number })
  @ApiQuery({ name: 'location', required: false, type: String })
  search(
    @Query('query') query?: string,
    @Query('category') category?: string,
    @Query('transmission') transmission?: string,
    @Query('fuelType') fuelType?: string,
    @Query('minSeats') minSeats?: number,
    @Query('maxSeats') maxSeats?: number,
    @Query('minDailyRate') minDailyRate?: number,
    @Query('maxDailyRate') maxDailyRate?: number,
    @Query('location') location?: string,
  ) {
    return this.vehiclesService.searchVehicles({
      query,
      category,
      transmission,
      fuelType,
      minSeats,
      maxSeats,
      minDailyRate,
      maxDailyRate,
      location,
    });
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  @RequirePermissions(Permission.READ_VEHICLE)
  @RequireRoles(Role.ADMIN, Role.AGENT)
  @ApiOperation({ summary: 'Get vehicle statistics (Admin/Agent only)' })
  @ApiResponse({ status: 200, description: 'Vehicle statistics retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  getVehicleStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.vehiclesService.getVehicleStats({ startDate, endDate });
  }

  @Get('category/:category')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.LIST_VEHICLES)
  @ApiOperation({ summary: 'Get vehicles by category' })
  @ApiResponse({ status: 200, description: 'Vehicles by category retrieved successfully' })
  getVehiclesByCategory(@Param('category') category: string) {
    return this.vehiclesService.getVehiclesByCategory(category);
  }

  @Get('location/:location')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.LIST_VEHICLES)
  @ApiOperation({ summary: 'Get vehicles by location' })
  @ApiResponse({ status: 200, description: 'Vehicles by location retrieved successfully' })
  getVehiclesByLocation(@Param('location') location: string) {
    return this.vehiclesService.getVehiclesByLocation(location);
  }

  @Patch('bulk-status')
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  @RequirePermissions(Permission.UPDATE_VEHICLE)
  @RequireRoles(Role.ADMIN, Role.AGENT)
  @ApiOperation({ summary: 'Update bulk vehicle status (Admin/Agent only)' })
  @ApiResponse({ status: 200, description: 'Bulk vehicle status updated successfully' })
  updateBulkStatus(@Body() bulkStatusDto: { vehicleIds: string[]; status: string }) {
    return this.vehiclesService.updateBulkStatus(bulkStatusDto);
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

  @Get(':id/images')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.READ_VEHICLE)
  @ApiOperation({ summary: 'Get vehicle images' })
  @ApiResponse({ status: 200, description: 'Vehicle images retrieved successfully' })
  getVehicleImages(@Param('id') id: string) {
    return this.vehiclesService.getVehicleImages(id);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  @RequirePermissions(Permission.UPDATE_VEHICLE)
  @RequireRoles(Role.ADMIN, Role.AGENT)
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload vehicle images (Admin/Agent only)' })
  @ApiResponse({ status: 201, description: 'Vehicle images uploaded successfully' })
  uploadVehicleImages(
    @Param('id') id: string,
    @UploadedFiles() images: any[],
  ) {
    return this.vehiclesService.uploadVehicleImages(id, images);
  }

  @Get(':id/reviews')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.READ_VEHICLE)
  @ApiOperation({ summary: 'Get vehicle reviews' })
  @ApiResponse({ status: 200, description: 'Vehicle reviews retrieved successfully' })
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
  @ApiOperation({ summary: 'Create vehicle review (Authenticated users)' })
  @ApiResponse({ status: 201, description: 'Vehicle review created successfully' })
  createReview(
    @Param('id') id: string,
    @Body() createReviewDto: { rating: number; comment?: string },
    @CurrentUser()
    user: { id: string; name: string; email: string; role: string },
  ) {
    return this.vehiclesService.createVehicleReview(id, user.id, createReviewDto.rating, createReviewDto.comment);
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

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  @RequirePermissions(Permission.DELETE_VEHICLE)
  @RequireRoles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete vehicle (Admin only)' })
  @ApiResponse({ status: 200, description: 'Vehicle deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  remove(@Param('id') id: string) {
    return this.vehiclesService.deleteVehicle(id);
  }
}
