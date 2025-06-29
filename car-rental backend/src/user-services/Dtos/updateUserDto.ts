import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUrl,
  MinLength,
  IsOptional,
  IsEnum,
  IsPhoneNumber,
} from 'class-validator';
import { Role, Status } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least two characters' })
  name?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'New password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Profile image is required' })
  @IsUrl({}, { message: 'Profile image must be a valid URL' })
  profileImage?: string;

  @IsEnum(Role, { message: 'Invalid role' })
  @IsOptional()
  role?: Role;

  @IsEnum(Status, { message: 'Invalid status' })
  @IsOptional()
  status?: Status;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
