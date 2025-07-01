import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest, RegisterRequest } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './authcomponent.html',
  styleUrls: ['./authcomponent.css']
})
export class AuthComponent implements OnInit {
  activeTab: 'login' | 'signup' = 'login';
  loginForm: FormGroup;
  signupForm: FormGroup;
  forgotPasswordForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showForgotPassword = false;
  countries = [
    { name: 'Nigeria', code: 'NG', dial_code: '+234', flag: '🇳🇬' },
    { name: 'United States', code: 'US', dial_code: '+1', flag: '🇺🇸' },
    { name: 'United Kingdom', code: 'GB', dial_code: '+44', flag: '🇬🇧' },
    { name: 'Ghana', code: 'GH', dial_code: '+233', flag: '🇬🇭' },
    { name: 'Kenya', code: 'KE', dial_code: '+254', flag: '🇰🇪' },
    { name: 'South Africa', code: 'ZA', dial_code: '+27', flag: '🇿🇦' },
    { name: 'Canada', code: 'CA', dial_code: '+1', flag: '🇨🇦' },
    { name: 'India', code: 'IN', dial_code: '+91', flag: '🇮🇳' },
    { name: 'Germany', code: 'DE', dial_code: '+49', flag: '🇩🇪' },
    { name: 'France', code: 'FR', dial_code: '+33', flag: '🇫🇷' },
    // Add more as needed
  ];
  selectedCountry = this.countries[0];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      country: [this.selectedCountry.code, [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^0?\d{6,14}$/)]]
    }, { validators: this.passwordMatchValidator });

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/landing']);
    }
  }

  switchTab(tab: 'login' | 'signup'): void {
    this.activeTab = tab;
    this.clearMessages();
  }

  showForgotPasswordForm(): void {
    this.showForgotPassword = true;
    this.clearMessages();
  }

  hideForgotPasswordForm(): void {
    this.showForgotPassword = false;
    this.clearMessages();
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.clearMessages();

      const loginData: LoginRequest = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Login successful! Redirecting...';
          setTimeout(() => {
            const user = response.user;
            console.log('Logged in user:', user);
            console.log('User role:', user?.role);
            if (user && user.role && user.role.toLowerCase() === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/users/carspage']);
            }
          }, 1000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Login failed. Please try again.';
        }
      });
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  onSignup(): void {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.clearMessages();

      let phone = this.signupForm.value.phone.trim();
      // Remove all non-digit characters
      phone = phone.replace(/\D/g, '');
      // Remove leading zeros
      phone = phone.replace(/^0+/, '');
      // For Kenya, keep only the last 9 digits (mobile numbers)
      if (this.selectedCountry.code === 'KE' && phone.length > 9) {
        phone = phone.slice(-9);
      }
      phone = this.selectedCountry.dial_code + phone;

      // Debug output
      console.log('Phone input value:', this.signupForm.value.phone);
      console.log('Processed phone:', phone);
      console.log('Phone control errors:', this.signupForm.get('phone')?.errors);

      const signupData: RegisterRequest = {
        name: this.signupForm.value.name,
        email: this.signupForm.value.email,
        password: this.signupForm.value.password,
        phone: phone
      };

      this.authService.register(signupData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Registration successful! Please log in to continue.';
          this.switchTab('login');
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Registration failed. Please try again.';
        }
      });
    } else {
      this.markFormGroupTouched(this.signupForm);
    }
  }

  onForgotPassword(): void {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.clearMessages();

      this.authService.forgotPassword(this.forgotPasswordForm.value.email).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Password reset instructions have been sent to your email.';
          this.hideForgotPasswordForm();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Failed to send reset email. Please try again.';
        }
      });
    } else {
      this.markFormGroupTouched(this.forgotPasswordForm);
    }
  }

  private passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }

    return null;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.touched && field.errors) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        return 'Please provide a valid phone number (e.g. 712345678 or 0712345678)';
      }
    }
    return '';
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.touched && field.errors);
  }

  onCountryChange(event: Event): void {
    const code = (event.target as HTMLSelectElement).value;
    this.selectedCountry = this.countries.find(c => c.code === code) || this.countries[0];
  }
}
