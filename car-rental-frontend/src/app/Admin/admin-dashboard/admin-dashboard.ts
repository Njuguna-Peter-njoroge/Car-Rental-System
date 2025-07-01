import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../Component/Shared/navbar/navbar';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NavbarComponent],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  vehicleForm: FormGroup;
  vehicles: Vehicle[] = [];
  isUploading = false;
  isSubmitting = false;
  imageUrl = '';
  message = '';
  messageType = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private authService: AuthService,
    private router: Router
  ) {
    this.vehicleForm = this.fb.group({
      model: ['', [Validators.required]],
      year: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
      licensePlate: ['', [Validators.required]],
      vin: ['', [Validators.required]],
      category: ['', [Validators.required]],
      transmission: ['', [Validators.required]],
      fuelType: ['', [Validators.required]],
      seats: ['', [Validators.required, Validators.min(1), Validators.max(20)]],
      dailyRate: ['', [Validators.required, Validators.min(0)]],
      hourlyRate: ['', [Validators.min(0)]],
      location: ['', [Validators.required]],
      description: ['', [Validators.required]],
      mileage: ['', [Validators.min(0)]],
      features: ['']
    });
  }

  ngOnInit(): void {
    // Check if user is admin
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/auth']);
      return;
    }
    
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.isLoading = true;
    this.vehicleService.getAllVehicles().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.vehicles = response.data.vehicles || [];
        } else {
          this.showMessage('Failed to load vehicles', 'error');
        }
      },
      error: (error) => {
        console.error('Error loading vehicles:', error);
        this.showMessage('Failed to load vehicles from server', 'error');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.isUploading = true;
      this.imageUrl = '';
      
      // For now, create a local URL for preview
      // In production, you'd upload to Cloudinary here
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;
        this.isUploading = false;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.vehicleForm.valid && this.imageUrl) {
      this.isSubmitting = true;
      
      const formValue = this.vehicleForm.value;
      const vehicleData = {
        ...formValue,
        features: formValue.features ? formValue.features.split(',').map((f: string) => f.trim()) : [],
        images: [this.imageUrl], // In production, this would be the Cloudinary URL
        isAvailable: true,
        status: 'ACTIVE'
      };

      this.vehicleService.createVehicle(vehicleData).subscribe({
        next: (response) => {
          if (response.success) {
            this.showMessage('Vehicle added successfully!', 'success');
            this.vehicleForm.reset();
            this.imageUrl = '';
            this.loadVehicles(); // Reload the list
          } else {
            this.showMessage(response.message || 'Failed to add vehicle', 'error');
          }
        },
        error: (error) => {
          console.error('Error adding vehicle:', error);
          this.showMessage('Failed to add vehicle. Please try again.', 'error');
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.vehicleForm);
      if (!this.imageUrl) {
        this.showMessage('Please select an image for the vehicle', 'error');
      }
    }
  }

  editVehicle(vehicleId: string): void {
    // Navigate to edit page or open edit modal
    this.router.navigate(['/admin/vehicles', vehicleId, 'edit']);
  }

  deleteVehicle(vehicleId: string): void {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      this.vehicleService.deleteVehicle(vehicleId).subscribe({
        next: (response) => {
          if (response.success) {
            this.showMessage('Vehicle deleted successfully!', 'success');
            this.loadVehicles(); // Reload the list
          } else {
            this.showMessage(response.message || 'Failed to delete vehicle', 'error');
          }
        },
        error: (error) => {
          console.error('Error deleting vehicle:', error);
          this.showMessage('Failed to delete vehicle. Please try again.', 'error');
        }
      });
    }
  }

  viewUserProductsPage(): void {
    // Navigate to the user-facing vehicles page
    this.router.navigate(['/users']);
  }

  showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 5000);
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.vehicleForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.vehicleForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['min']) return `${fieldName} must be at least ${field.errors['min'].min}`;
      if (field.errors['max']) return `${fieldName} must be at most ${field.errors['max'].max}`;
    }
    return '';
  }
} 