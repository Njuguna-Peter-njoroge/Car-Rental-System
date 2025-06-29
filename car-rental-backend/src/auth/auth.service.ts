import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './register.dtos';
import { Role, Status } from '@prisma/client';
import { AuthResponse } from './interfaces/auth.interface';
import { ApiResponse } from '../../Shared/Apiresponse';
import * as bcrypt from 'bcrypt';
import { UserResponseDto } from '../user-services/Dtos/userResponseDto';
import { JwtService as CustomJwtService } from '../../Shared/Utils/jwt.service';
import { MailerService } from '../../Shared/Utils/mailer.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private customJwtService: CustomJwtService,
    private mailerService: MailerService,
  ) {}

  async login(loginDto: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>> {
    // Validate input
    if (!loginDto.email || !loginDto.password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.Status !== Status.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    // Update last login timestamp
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const access_token = this.customJwtService.generateToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // Generate refresh token
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      success: true,
      message: 'Login successful',
      data: {
        access_token,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          Status: user.Status,
        },
      },
    };
  }

  async register(
    registerDto: RegisterDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          name: registerDto.name,
          email: registerDto.email,
          password: hashedPassword,
          role: registerDto.role || Role.CUSTOMER,
          Status: Status.ACTIVE, // Set to ACTIVE for now, can be changed to PENDING when email verification is implemented
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          Status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // await this.mailerService.sendWelcomeEmail(user.email, user.name);

      return {
        success: true,
        message: 'Registration successful. Please login to continue.',
        data: user,
      };
    } catch {
      throw new BadRequestException('Failed to register user');
    }
  }

  async forgotPassword(
    email: string,
  ): Promise<ApiResponse<{ message: string }>> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        success: true,
        message:
          'If an account with this email exists, a password reset link has been sent.',
        data: { message: 'Password reset email sent' },
      };
    }

    // For now, just return success message
    // Password reset functionality can be implemented when the database schema is updated
    return {
      success: true,
      message:
        'If an account with this email exists, a password reset link has been sent.',
      data: { message: 'Password reset email sent' },
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<ApiResponse<{ message: string }>> {
    // For now, just return success message
    // This will be implemented when the database schema is updated
    return {
      success: true,
      message: 'Password reset successful',
      data: { message: 'Password reset successful' },
    };
  }

  async verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
    // For now, just return success message
    // This will be implemented when the database schema is updated
    return {
      success: true,
      message: 'Email verified successfully',
      data: { message: 'Email verified successfully' },
    };
  }

  async resendVerification(
    email: string,
  ): Promise<ApiResponse<{ message: string }>> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // For now, just return success message
    return {
      success: true,
      message: 'Verification email sent',
      data: { message: 'Verification email sent' },
    };
  }

  async getProfile(userId: string): Promise<ApiResponse<UserResponseDto>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        Status: true,
        profileImage: true,
        phone: true,
        emailVerified: true,
        emailVerificationToken: true,
        emailVerificationExpires: true,
        passwordResetToken: true,
        passwordResetExpires: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || user.Status !== Status.ACTIVE) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: user,
    };
  }

  async refreshToken(
    userId: string,
  ): Promise<ApiResponse<{ access_token: string; refresh_token: string }>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        Status: true,
      },
    });

    if (!user || user.Status !== Status.ACTIVE) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const access_token = this.customJwtService.generateToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refresh_token = await this.generateRefreshToken(user.id);

    return {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        access_token,
        refresh_token,
      },
    };
  }

  async logout(userId: string): Promise<ApiResponse<{ message: string }>> {
    // For now, just return success message
    // Refresh token invalidation will be implemented when the database schema is updated
    return {
      success: true,
      message: 'Logout successful',
      data: { message: 'Logout successful' },
    };
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    // For now, just return a random token
    // This will be implemented when the database schema is updated
    return randomBytes(32).toString('hex');
  }
}
