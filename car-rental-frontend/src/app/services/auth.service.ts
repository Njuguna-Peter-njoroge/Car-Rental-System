import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'USER' | 'ADMIN';
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Login user
  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginData)
      .pipe(
        map(response => {
          if (response.user && response.token) {
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            localStorage.setItem('token', response.token);
            this.currentUserSubject.next(response.user);
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // Register new user
  register(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerData)
      .pipe(
        map(response => {
          if (response.user && response.token) {
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            localStorage.setItem('token', response.token);
            this.currentUserSubject.next(response.user);
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // Forgot password
  forgotPassword(email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/forgot-password`, { email })
      .pipe(catchError(this.handleError));
  }

  // Reset password
  resetPassword(token: string, newPassword: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/reset-password`, { 
      token, 
      newPassword 
    }).pipe(catchError(this.handleError));
  }

  // Logout user
  logout(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/logout`, {})
      .pipe(
        map(response => {
          this.clearLocalStorage();
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const user = this.currentUserValue;
    const token = localStorage.getItem('token');
    return !!(user && token);
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Refresh token
  refreshToken(): Observable<ApiResponse<{ token: string }>> {
    return this.http.post<ApiResponse<{ token: string }>>(`${this.apiUrl}/refresh-token`, {})
      .pipe(
        map(response => {
          if (response.data?.token) {
            localStorage.setItem('token', response.data.token);
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // Verify email
  verifyEmail(token: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/verify-email?token=${token}`)
      .pipe(catchError(this.handleError));
  }

  // Resend verification email
  resendVerification(email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/resend-verification`, { email })
      .pipe(catchError(this.handleError));
  }

  // Get user profile
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`)
      .pipe(
        map(user => {
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(this.handleError)
      );
  }

  // Update user profile
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, userData)
      .pipe(
        map(user => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(this.handleError)
      );
  }

  // Change password
  changePassword(currentPassword: string, newPassword: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword
    }).pipe(catchError(this.handleError));
  }

  // Delete account
  deleteAccount(password: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/me`, {
      body: { password }
    }).pipe(
      map(response => {
        this.clearLocalStorage();
        return response;
      }),
      catchError(this.handleError)
    );
  }

  // Clear local storage
  private clearLocalStorage(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  // Error handling
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (error.status === 401) {
        errorMessage = 'Invalid credentials. Please try again.';
      } else if (error.status === 403) {
        errorMessage = 'Access denied. You do not have permission to perform this action.';
      } else if (error.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (error.status === 409) {
        errorMessage = 'Email already exists. Please use a different email address.';
      } else if (error.status === 422) {
        errorMessage = error.error?.message || 'Validation error. Please check your input.';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
      }
    }
    
    console.error('AuthService Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  // Check if user has admin role
  isAdmin(): boolean {
    const user = this.currentUserValue;
    return user?.role === 'ADMIN';
  }

  // Check if user has user role
  isUser(): boolean {
    const user = this.currentUserValue;
    return user?.role === 'USER';
  }

  // Check if email is verified
  isEmailVerified(): boolean {
    const user = this.currentUserValue;
    return user?.isEmailVerified || false;
  }
} 