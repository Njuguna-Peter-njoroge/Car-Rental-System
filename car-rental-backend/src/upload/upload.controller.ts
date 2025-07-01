import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
  Param,
  UseGuards,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CloudinaryService, CarRentalUploadType } from '../../Shared/Utils/Cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/Guards/jwt/jwt-auth.guard/jwt-auth.guard';
import { RolesGuard } from '../auth/Guards/roles.guard';
import { RequireRoles } from '../auth/decorators/roles.decorators';
import { Role } from '@prisma/client';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Get('test')
  @ApiOperation({ summary: 'Test Cloudinary connectivity' })
  @ApiResponse({ status: 200, description: 'Cloudinary connection test successful' })
  async testCloudinary() {
    try {
      // Test basic connectivity
      return {
        success: true,
        message: 'Cloudinary service is working',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Cloudinary test failed:', error);
      throw new BadRequestException('Cloudinary service test failed');
    }
  }

  @Post('test-upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Test file upload to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async testUpload(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      const result = await this.cloudinaryService.uploadFile(
        file,
        CarRentalUploadType.DOCUMENT,
        {
          entityType: 'test',
          tags: ['test-upload'],
        },
      );

      return {
        success: true,
        message: 'Test upload successful',
        data: result,
      };
    } catch (error) {
      this.logger.error('Test upload failed:', error);
      throw new BadRequestException('Upload failed: ' + error.message);
    }
  }

  @Post('profile-image')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload user profile image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
        userId: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Profile image uploaded successfully' })
  async uploadProfileImage(
    @UploadedFile() file: any,
    @Body('userId') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      const result = await this.cloudinaryService.uploadUserProfileImage(
        file,
        userId,
      );

      return {
        success: true,
        message: 'Profile image uploaded successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Profile image upload failed:', error);
      throw new BadRequestException('Profile image upload failed: ' + error.message);
    }
  }

  @Post('vehicle-images')
  @UseInterceptors(FilesInterceptor('images', 10))
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(Role.ADMIN)
  @ApiOperation({ summary: 'Upload multiple vehicle images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        vehicleId: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Vehicle images uploaded successfully' })
  async uploadVehicleImages(
    @UploadedFiles() files: any[],
    @Body('vehicleId') vehicleId: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No image files provided');
    }

    if (!vehicleId) {
      throw new BadRequestException('Vehicle ID is required');
    }

    try {
      const results = await this.cloudinaryService.uploadMultipleFiles(
        files,
        CarRentalUploadType.VEHICLE_IMAGE, // Using vehicle image config
        {
          entityId: vehicleId,
          entityType: 'vehicle',
          tags: ['vehicle-images'],
        },
      );

      return {
        success: true,
        message: `${files.length} vehicle images uploaded successfully`,
        data: results,
      };
    } catch (error) {
      this.logger.error('Vehicle images upload failed:', error);
      throw new BadRequestException('Vehicle images upload failed: ' + error.message);
    }
  }

  @Post('document')
  @UseInterceptors(FileInterceptor('document'))
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload a document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        document: {
          type: 'string',
          format: 'binary',
        },
        documentType: {
          type: 'string',
          enum: ['booking', 'id', 'general'],
        },
        entityId: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  async uploadDocument(
    @UploadedFile() file: any,
    @Body('documentType') documentType: string,
    @Body('entityId') entityId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No document file provided');
    }

    let uploadType: CarRentalUploadType;
    switch (documentType) {
      case 'booking':
        uploadType = CarRentalUploadType.BOOKING_DOCUMENT;
        break;
      case 'id':
        uploadType = CarRentalUploadType.ID_DOCUMENT;
        break;
      case 'general':
      default:
        uploadType = CarRentalUploadType.DOCUMENT;
        break;
    }

    try {
      const result = await this.cloudinaryService.uploadFile(
        file,
        uploadType,
        {
          entityId,
          entityType: documentType,
          tags: ['document', documentType],
        },
      );

      return {
        success: true,
        message: 'Document uploaded successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Document upload failed:', error);
      throw new BadRequestException('Document upload failed: ' + error.message);
    }
  }

  @Post('gallery')
  @UseInterceptors(FilesInterceptor('images', 20))
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(Role.ADMIN)
  @ApiOperation({ summary: 'Upload gallery images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Gallery images uploaded successfully' })
  async uploadGalleryImages(@UploadedFiles() files: any[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No image files provided');
    }

    try {
      const results = await this.cloudinaryService.uploadMultipleFiles(
        files,
        CarRentalUploadType.GALLERY,
        {
          entityType: 'gallery',
          tags: ['gallery'],
        },
      );

      return {
        success: true,
        message: `${files.length} gallery images uploaded successfully`,
        data: results,
      };
    } catch (error) {
      this.logger.error('Gallery images upload failed:', error);
      throw new BadRequestException('Gallery images upload failed: ' + error.message);
    }
  }

  @Post('delete/:publicId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a file from Cloudinary' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(@Param('publicId') publicId: string) {
    if (!publicId) {
      throw new BadRequestException('Public ID is required');
    }

    try {
      await this.cloudinaryService.deleteFile(publicId);

      return {
        success: true,
        message: 'File deleted successfully',
        publicId,
      };
    } catch (error) {
      this.logger.error('File deletion failed:', error);
      throw new BadRequestException('File deletion failed: ' + error.message);
    }
  }
} 