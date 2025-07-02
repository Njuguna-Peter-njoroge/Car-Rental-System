import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './bookings.html',
  imports: [
    DatePipe
  ],
  styleUrls: ['./bookings.css']
})
export class AdminDashboardComponent implements OnInit {
  bookings: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.http.get<any[]>('http://localhost:3000/bookings')
      .subscribe(data => this.bookings = data);
  }

  updateStatus(id: number, status: 'APPROVED' | 'DENIED') {
    this.http.patch(`http://localhost:3000/bookings/${id}/status`, { status })
      .subscribe(() => this.loadBookings());
  }
}
