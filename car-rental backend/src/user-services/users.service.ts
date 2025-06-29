/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './Dtos/createUserDto';
import { UserResponseDto } from './Dtos/userResponseDto';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponse } from '../../Shared/Apiresponse';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './Dtos/updateUserDto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';
import { Role, Status } from '@prisma/client';
// import { MailerService } from '../../Shared/Utils/mailer.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    // private mailerService: MailerService,
  ) {}

  private sanitizeUser(user: any): UserResponseDto {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { password, ...rest } = user;
    return rest as UserResponseDto;
  }

  async create(data: CreateUserDto): Promise<ApiResponse<UserResponseDto>> {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    try {
      const user = await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email.toLowerCase(),
          password: hashedPassword,
          role: data.role || Role.CUSTOMER,
          profileImage: data.profileImage || '',
        },
      });

      // Send welcome email
      // try {
      //     await this.mailerService.sendWelcomeEmail(user.email, user.name);
      //     this.logger.log(`Welcome email sent to ${user.email}`);
      // } catch (emailError) {
      //     this.logger.error(`Failed to send welcome email to ${user.email}:`, emailError);
      //     // Don't fail the user creation if email fails
      // }

      return {
        success: true,
        message: 'User created successfully',
        data: this.sanitizeUser(user),
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Email already exists');
        }
        throw new BadRequestException(`Database error: ${error.message}`);
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async findAll(paginationOptions: {
    page: number | undefined;
    limit: number | undefined;
  }): Promise<ApiResponse<UserResponseDto[]>> {
    const users = await this.prisma.user.findMany({
      where: { Status: Status.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      message: 'Users retrieved successfully',
      data: users.map((user) => this.sanitizeUser(user)),
    };
  }

  async findOne(id: string): Promise<ApiResponse<UserResponseDto>> {
    if (!id) throw new BadRequestException('User ID is required');

    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user || !user.Status) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      message: 'User retrieved successfully',
      data: this.sanitizeUser(user),
    };
  }

  async findByEmail(email: string): Promise<ApiResponse<UserResponseDto>> {
    if (!email) throw new BadRequestException('Email is required');

    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.Status) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      message: 'User retrieved successfully',
      data: this.sanitizeUser(user),
    };
  }

  async update(
    id: string,
    data: UpdateUserDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    if (!id) throw new BadRequestException('User ID is required');

    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser || !existingUser.Status) {
      throw new NotFoundException('User not found');
    }

    const updateData: Prisma.UserUpdateInput = {};

    // Update name if provided
    if (data.name) updateData.name = { set: data.name };

    // Update email if provided
    if (data.email) {
      // Check if email is already taken by another user
      const emailExists = await this.prisma.user.findFirst({
        where: {
          email: data.email.toLowerCase(),
          id: { not: id },
        },
      });
      if (emailExists) {
        throw new BadRequestException('Email already exists');
      }
      updateData.email = { set: data.email.toLowerCase() };
    }

    // Update phone if provided
    if (data.phone) updateData.phone = { set: data.phone };

    // Update profile image if provided
    if (data.profileImage) updateData.profileImage = { set: data.profileImage };

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateData,
      });

      return {
        success: true,
        message: 'User updated successfully',
        data: this.sanitizeUser(updatedUser),
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Email already exists');
        }
        if (error.code === 'P2025') {
          throw new NotFoundException('User not found');
        }
      }
      throw new BadRequestException('Failed to update user');
    }
  }

  async deleteUser(id: string): Promise<ApiResponse<{ message: string }>> {
    if (!id) throw new BadRequestException('User ID is required');

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.update({
      where: { id },
      data: { Status: 'INACTIVE' },
    });

    return {
      success: true,
      message: 'User deactivated successfully',
      data: { message: 'User deactivated successfully' },
    };
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!isCurrentPasswordValid) {
        throw new ConflictException('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      await this.prisma.user.update({
        where: { id },
        data: { password: hashedNewPassword },
      });

      return { message: 'Password changed successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to change password');
    }
  }
}
