import { BookingStatus } from './create-booking.dto';

export class BookingResponseDto {
  id: string;
  userId: string;
  vehicleId: string;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  status: BookingStatus;
  pickupLocation: string;
  returnLocation: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;

  // Vehicle details
  vehicle?: {
    id: string;
    model: string;
    year: number;
    category: string;
    dailyRate: number;
    images: string[];
  };

  // User details
  user?: {
    id: string;
    name: string;
    email: string;
  };
} 