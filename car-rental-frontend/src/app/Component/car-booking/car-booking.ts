import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-car-detail',
  templateUrl: './car-booking.html',
  styleUrls: ['./car-booking.css'],
  imports: [FormsModule, CommonModule, RouterModule]
})
export class CarDetailComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  bookingData = {
    vehicleId: '30984705-ede0-40c5-9b89-11c6681329ab', // Use available vehicle ID
    startDate: '',
    endDate: '',
    pickupLocation: '',
    returnLocation: '',
    notes: '',
    couponCode: ''
  };

  isSubmitting = false;
  isAuthenticated = false;

  ngOnInit() {
    console.log('CarDetailComponent loaded');
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  submitBooking() {
    // Check if user is authenticated
    if (!this.isAuthenticated) {
      alert('Please login first to make a booking.');
      return;
    }

    // Check if required fields are filled
    const requiredFields = ['startDate', 'endDate', 'pickupLocation', 'returnLocation'];
    const isComplete = requiredFields.every(field => this.bookingData[field as keyof typeof this.bookingData]?.toString().trim() !== '');

    if (isComplete) {
      this.isSubmitting = true;
      console.log('Sending booking request to backend:', this.bookingData);
      
      // Get auth token from auth service
      const token = this.authService.getToken();
      
      if (!token) {
        alert('Please login first to make a booking.');
        this.isSubmitting = false;
        return;
      }

      // Send booking request to backend with auth header
      this.http.post('http://localhost:3000/bookings', this.bookingData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .subscribe({
          next: (response) => {
            console.log('Booking request successful:', response);
            alert('Booking submitted successfully! We will contact you soon.');
            
            // Reset form
            this.bookingData = {
              vehicleId: '30984705-ede0-40c5-9b89-11c6681329ab',
              startDate: '',
              endDate: '',
              pickupLocation: '',
              returnLocation: '',
              notes: '',
              couponCode: ''
            };
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Booking request failed:', error);
            if (error.status === 401) {
              alert('Please login first to make a booking.');
            } else {
              alert('Booking submission failed. Please try again.');
            }
            this.isSubmitting = false;
          }
        });
    } else {
      alert('Please fill in all required fields (Start Date, End Date, Pickup Location, Return Location).');
    }
  }
}
