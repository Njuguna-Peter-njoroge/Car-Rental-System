import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../Component/Shared/navbar/navbar';
import { VehicleService, Vehicle } from '../../services/vehicle.service';

@Component({
  selector: 'app-users',
  templateUrl: './carspage.html',
  styleUrls: ['./carspage.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    CurrencyPipe
  ]
})
export class UsersComponent implements OnInit {
  // Filter options - will be populated from actual data
  categories: string[] = [];
  locations: string[] = [];
  fuelTypes: string[] = [];
  models: string[] = [];

  // Selected filters
  selectedCategory = '';
  selectedLocation = '';
  selectedFuel = '';
  selectedModel = '';
  selectedPrice = '';
  searchText = '';

  // Vehicle data from backend
  vehicles: Vehicle[] = [];
  filteredVehicles: Vehicle[] = [];
  isLoading = false;
  error = '';

  // Notification system
  notifications: Array<{
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
    timestamp: Date;
  }> = [];

  constructor(
    private vehicleService: VehicleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  // Load vehicles from backend
  loadVehicles(): void {
    this.isLoading = true;
    this.error = '';

    this.vehicleService.getAllVehicles().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.vehicles = response.data.vehicles || [];
          this.filteredVehicles = [...this.vehicles];
          console.log('Vehicles loaded from backend:', this.vehicles);
          
          // Generate filter options from actual data
          this.generateFilterOptions();
        } else {
          this.error = response.message || 'Failed to load vehicles';
          this.addNotification('Failed to load vehicles', 'error');
        }
      },
      error: (error) => {
        console.error('Error loading vehicles:', error);
        this.error = 'Failed to load vehicles from server';
        this.addNotification('Failed to load vehicles from server', 'error');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // Generate filter options from actual vehicle data
  generateFilterOptions(): void {
    // Extract unique categories
    this.categories = [...new Set(this.vehicles.map(v => v.category))].sort();
    
    // Extract unique locations
    this.locations = [...new Set(this.vehicles.map(v => v.location))].sort();
    
    // Extract unique fuel types
    this.fuelTypes = [...new Set(this.vehicles.map(v => v.fuelType))].sort();
    
    // Extract unique models
    this.models = [...new Set(this.vehicles.map(v => v.model))].sort();
    
    console.log('Filter options generated:', {
      categories: this.categories,
      locations: this.locations,
      fuelTypes: this.fuelTypes,
      models: this.models
    });
  }

  // Filter logic
  filterVehicles(): void {
    this.filteredVehicles = this.vehicles.filter(vehicle => {
      const matchesCategory = !this.selectedCategory || vehicle.category === this.selectedCategory;
      const matchesLocation = !this.selectedLocation || vehicle.location === this.selectedLocation;
      const matchesFuel = !this.selectedFuel || vehicle.fuelType === this.selectedFuel;
      const matchesModel = !this.selectedModel || vehicle.model === this.selectedModel;
      const matchesPrice =
        !this.selectedPrice ||
        (this.selectedPrice === '0-20000' && vehicle.dailyRate < 20000) ||
        (this.selectedPrice === '20000-40000' && vehicle.dailyRate >= 20000 && vehicle.dailyRate <= 40000) ||
        (this.selectedPrice === '40000-60000' && vehicle.dailyRate > 40000 && vehicle.dailyRate <= 60000) ||
        (this.selectedPrice === '60000-80000' && vehicle.dailyRate > 60000 && vehicle.dailyRate <= 80000) ||
        (this.selectedPrice === '80000+' && vehicle.dailyRate > 80000);

      let matchesSearch = true;
      if (this.searchText) {
        const search = this.searchText.toLowerCase();
        matchesSearch =
          vehicle.model.toLowerCase().includes(search) ||
          vehicle.category.toLowerCase().includes(search) ||
          vehicle.location.toLowerCase().includes(search);
      }

      return (
        matchesCategory &&
        matchesLocation &&
        matchesFuel &&
        matchesModel &&
        matchesPrice &&
        matchesSearch
      );
    });
  }

  // Clear all filters
  clearAllFilters(): void {
    this.selectedCategory = '';
    this.selectedLocation = '';
    this.selectedFuel = '';
    this.selectedModel = '';
    this.selectedPrice = '';
    this.searchText = '';
    this.filterVehicles();
    this.addNotification('All filters cleared', 'info');
  }

  // View vehicle details
  viewDetails(vehicle: Vehicle): void {
    // Navigate to vehicle details page
    this.router.navigate(['/vehicle-details', vehicle.id]);
  }

  // Book vehicle - FIXED ROUTING
  bookNow(vehicle: Vehicle): void {
    console.log('🎯 Book Now button clicked for vehicle:', vehicle);
    console.log('Vehicle ID:', vehicle.id);
    console.log('Vehicle Name:', vehicle.model);
    console.log('Vehicle Available:', vehicle.isAvailable);
    
    // Add booking notification
    this.addNotification(`Redirecting to booking page for ${vehicle.model}`, 'success');
    
    // Navigate to booking page with vehicle details
    this.router.navigate(['/booking'], { 
      queryParams: { 
        vehicleId: vehicle.id,
        vehicleName: vehicle.model,
        dailyRate: vehicle.dailyRate
      } 
    });
  }

  // Add notification
  addNotification(message: string, type: 'success' | 'error' | 'info'): void {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    
    this.notifications.unshift(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, 5000);
  }

  // Remove notification
  removeNotification(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  // Get notification count
  getNotificationCount(): number {
    return this.notifications.length;
  }

  // Handle image loading errors
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/images/default-profile.svg';
    }
  }
}
