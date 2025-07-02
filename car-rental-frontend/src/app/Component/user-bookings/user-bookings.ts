import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../Shared/navbar/navbar';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

interface Booking {
  id: string;
  userId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  pickupLocation: string;
  returnLocation: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  vehicle: {
    id: string;
    model: string;
    year: number;
    category: string;
    dailyRate: number;
    images: string[];
  };
}

@Component({
  selector: 'app-user-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './user-bookings.html',
  styleUrls: ['./user-bookings.css']
})
export class UserBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  isLoading = false;
  error = '';
  userId: string | null = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    if (!this.userId) {
      this.error = 'Please log in to view your bookings';
      return;
    }
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading = true;
    this.error = '';

    const token = this.authService.getToken();
    this.http.get<Booking[]>(`${environment.apiUrl}/bookings/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.bookings = response;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.error = 'Failed to load bookings. Please try again.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'status-confirmed';
      case 'PENDING': return 'status-pending';
      case 'CANCELLED': return 'status-cancelled';
      case 'COMPLETED': return 'status-completed';
      default: return 'status-pending';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'Confirmed';
      case 'PENDING': return 'Pending';
      case 'CANCELLED': return 'Cancelled';
      case 'COMPLETED': return 'Completed';
      default: return 'Pending';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  cancelBooking(bookingId: string): void {
    if (confirm('Are you sure you want to cancel this booking?')) {
      const token = this.authService.getToken();
      this.http.delete<{success: boolean, message: string}>(`${environment.apiUrl}/bookings/${bookingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).subscribe({
        next: (response) => {
          this.loadBookings(); // Reload bookings
          alert('Booking cancelled successfully');
        },
        error: (error) => {
          console.error('Error cancelling booking:', error);
          alert('Failed to cancel booking. Please try again.');
        }
      });
    }
  }
} 