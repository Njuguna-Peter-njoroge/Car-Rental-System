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
import { LocationsService, CreateLocationDto, UpdateLocationDto } from './locations.service';

// DTO class for Swagger documentation
export class LocationResponseDto {
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

@ApiTags('Locations')
@Controller('locations')
@ApiBearerAuth()
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  @RequirePermissions(Permission.CREATE_LOCATION)
  @RequireRoles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new location (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Location created successfully',
    type: LocationResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationsService.createLocation(createLocationDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.LIST_LOCATIONS)
  @ApiOperation({ summary: 'Get all locations with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Locations retrieved successfully' })
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
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter by active status',
    type: Boolean,
  })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.locationsService.findAllLocations(page, limit, isActive);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.READ_LOCATION)
  @ApiOperation({ summary: 'Get location by ID' })
  @ApiResponse({
    status: 200,
    description: 'Location retrieved successfully',
    type: LocationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  findOne(@Param('id') id: string) {
    return this.locationsService.findLocationById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  @RequirePermissions(Permission.UPDATE_LOCATION)
  @RequireRoles(Role.ADMIN)
  @ApiOperation({ summary: 'Update location (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Location updated successfully',
    type: LocationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto) {
    return this.locationsService.updateLocation(id, updateLocationDto);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  @RequirePermissions(Permission.UPDATE_LOCATION)
  @RequireRoles(Role.ADMIN)
  @ApiOperation({ summary: 'Toggle location active status (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Location status toggled successfully',
    type: LocationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  toggleStatus(@Param('id') id: string) {
    return this.locationsService.toggleLocationStatus(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  @RequirePermissions(Permission.DELETE_LOCATION)
  @RequireRoles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete location (Admin only)' })
  @ApiResponse({ status: 200, description: 'Location deleted successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete location with associated vehicles',
  })
  @ApiParam({ name: 'id', description: 'Location ID' })
  remove(@Param('id') id: string) {
    return this.locationsService.deleteLocation(id);
  }
} 