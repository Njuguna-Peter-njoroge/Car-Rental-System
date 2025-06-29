import { VehicleResponseDto } from '../Dtos/vehicle-response.dto';

export interface Vehicle {
  id: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  category: string;
  transmission: string;
  fuelType: string;
  seats: number;
  dailyRate: number;
  hourlyRate?: number;
  isAvailable: boolean;
  location: string;
  features: string[];
  images: string[];
  description?: string;
  mileage?: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleUpdateData {
  isAvailable?: boolean;
  status?: string;
}

export interface VehicleFilters {
  category?: string;
  location?: { contains: string; mode: 'insensitive' };
  isAvailable?: boolean;
  id?: { notIn?: string[] };
}

export interface VehicleSearchFilters {
  OR: Array<{
    model?: { contains: string; mode: 'insensitive' };
    category?: { contains: string; mode: 'insensitive' };
    description?: { contains: string; mode: 'insensitive' };
  }>;
  isAvailable: boolean;
  category?: string;
  location?: { contains: string; mode: 'insensitive' };
  id?: { notIn?: string[] };
}

export interface VehicleListResponse {
  vehicles: VehicleResponseDto[];
  total: number;
  page: number;
  limit: number;
}

export interface ReviewUser {
  id: string;
  name: string;
  profileImage: string | null;
}

export interface VehicleReview {
  id: string;
  userId: string;
  vehicleId: string;
  bookingId: string | null;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: ReviewUser;
}

export interface VehicleReviewsResponse {
  reviews: VehicleReview[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateReviewData {
  vehicleId: string;
  userId: string;
  rating: number;
  comment?: string;
  isApproved: boolean;
}
