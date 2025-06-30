import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiTestService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Test if backend is reachable
  testConnection(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`, { 
      headers: { 'Authorization': 'Bearer test' },
      observe: 'response'
    });
  }

  // Test login endpoint
  testLogin(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  // Test register endpoint
  testRegister(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // Test forgot password endpoint
  testForgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }
} 