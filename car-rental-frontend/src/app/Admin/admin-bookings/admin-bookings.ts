import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../Component/Shared/navbar/navbar';
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
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './admin-bookings.html',
  styleUrls: ['./admin-bookings.css']
})
export class AdminBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  isLoading = false;
  error = '';
  selectedStatus = 'ALL';
  statusFilter = 'ALL';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.error = 'Access denied. Admin privileges required.';
      return;
    }
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading = true;
    this.error = '';

    const token = this.authService.getToken();
    this.http.get<{success: boolean, data: Booking[], message: string}>(`${environment.apiUrl}/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.bookings = response.data;
        } else {
          this.error = response.message || 'Failed to load bookings';
        }
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

  getFilteredBookings(): Booking[] {
    if (this.statusFilter === 'ALL') {
      return this.bookings;
    }
    return this.bookings.filter(booking => booking.status === this.statusFilter);
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

  approveBooking(bookingId: string): void {
    if (confirm('Are you sure you want to approve this booking?')) {
      this.updateBookingStatus(bookingId, 'CONFIRMED');
    }
  }

  rejectBooking(bookingId: string): void {
    if (confirm('Are you sure you want to reject this booking?')) {
      this.updateBookingStatus(bookingId, 'CANCELLED');
    }
  }

  completeBooking(bookingId: string): void {
    if (confirm('Mark this booking as completed?')) {
      this.updateBookingStatus(bookingId, 'COMPLETED');
    }
  }

  private updateBookingStatus(bookingId: string, status: string): void {
    const token = this.authService.getToken();
    this.http.patch<{success: boolean, message: string}>(`${environment.apiUrl}/bookings/${bookingId}/status`, 
      { status }, 
      { headers: { 'Authorization': `Bearer ${token}` } }
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadBookings(); // Reload bookings
          alert(`Booking ${status.toLowerCase()} successfully`);
        } else {
          alert(response.message || `Failed to ${status.toLowerCase()} booking`);
        }
      },
      error: (error) => {
        console.error(`Error updating booking status:`, error);
        alert(`Failed to ${status.toLowerCase()} booking. Please try again.`);
      }
    });
  }

  getUserName(user: any): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  }

  getStatusCount(status: string): number {
    return this.bookings.filter(booking => booking.status === status).length;
  }

  getTotalBookings(): number {
    return this.bookings.length;
  }
} 