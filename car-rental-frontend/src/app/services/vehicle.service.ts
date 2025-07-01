import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';

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
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface VehiclesResponse {
  vehicles: Vehicle[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get all vehicles
  getAllVehicles(): Observable<ApiResponse<VehiclesResponse>> {
    return this.http.get<ApiResponse<VehiclesResponse>>(`${this.apiUrl}/vehicles`).pipe(
      catchError(error => {
        console.error('Error fetching vehicles:', error);
        // Return fallback data structure
        return of({
          success: false,
          message: 'Failed to fetch vehicles',
          data: {
            vehicles: [],
            total: 0,
            page: 1,
            limit: 10
          }
        });
      })
    );
  }

  // Get vehicle by ID
  getVehicleById(id: string): Observable<ApiResponse<Vehicle>> {
    return this.http.get<ApiResponse<Vehicle>>(`${this.apiUrl}/vehicles/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching vehicle:', error);
        return of({
          success: false,
          message: 'Failed to fetch vehicle',
          data: null as any
        });
      })
    );
  }

  // Search vehicles with filters
  searchVehicles(filters: {
    category?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    fuelType?: string;
    model?: string;
  }): Observable<ApiResponse<VehiclesResponse>> {
    return this.http.get<ApiResponse<VehiclesResponse>>(`${this.apiUrl}/vehicles/search`, {
      params: filters as any
    }).pipe(
      catchError(error => {
        console.error('Error searching vehicles:', error);
        return of({
          success: false,
          message: 'Failed to search vehicles',
          data: {
            vehicles: [],
            total: 0,
            page: 1,
            limit: 10
          }
        });
      })
    );
  }

  // Book a vehicle
  bookVehicle(vehicleId: string, bookingData: {
    startDate: string;
    endDate: string;
    pickupLocation: string;
    returnLocation: string;
  }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/bookings`, {
      vehicleId,
      ...bookingData
    }).pipe(
      catchError(error => {
        console.error('Error booking vehicle:', error);
        return of({
          success: false,
          message: 'Failed to book vehicle',
          data: null
        });
      })
    );
  }

  // Create a new vehicle (Admin only)
  createVehicle(vehicleData: Partial<Vehicle>): Observable<ApiResponse<Vehicle>> {
    return this.http.post<ApiResponse<Vehicle>>(`${this.apiUrl}/vehicles`, vehicleData).pipe(
      catchError(error => {
        console.error('Error creating vehicle:', error);
        return of({
          success: false,
          message: 'Failed to create vehicle',
          data: null as any
        });
      })
    );
  }

  // Update a vehicle (Admin only)
  updateVehicle(id: string, vehicleData: Partial<Vehicle>): Observable<ApiResponse<Vehicle>> {
    return this.http.put<ApiResponse<Vehicle>>(`${this.apiUrl}/vehicles/${id}`, vehicleData).pipe(
      catchError(error => {
        console.error('Error updating vehicle:', error);
        return of({
          success: false,
          message: 'Failed to update vehicle',
          data: null as any
        });
      })
    );
  }

  // Delete a vehicle (Admin only)
  deleteVehicle(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/vehicles/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting vehicle:', error);
        return of({
          success: false,
          message: 'Failed to delete vehicle',
          data: null
        });
      })
    );
  }
} 