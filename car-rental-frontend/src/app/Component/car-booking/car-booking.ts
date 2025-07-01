import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {NavbarComponent} from '../Shared/navbar/navbar';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-booking',
  templateUrl: './car-booking.html',
  styleUrls: ['./car-booking.css'],
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NavbarComponent,
    MatDatepickerToggle,
    MatDatepicker,
    MatDatepickerInput,
    MatIconModule,
  ]
})
export class BookingComponent {
  booking = {
    fullName: '',
    email: '',
    bookingDate: '',
    carModel: ''
  };

  constructor(private http: HttpClient) {}

  submitBooking() {
    const apiUrl = 'http://localhost:3000/bookings'; // Replace with your NestJS endpoint
    this.http.post(apiUrl, this.booking).subscribe({
      next: () => alert('Booking submitted successfully!'),
      error: err => alert('Error submitting booking: ' + err.message),
    });
  }
}
