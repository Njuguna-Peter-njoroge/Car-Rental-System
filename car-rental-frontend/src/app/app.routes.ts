import { Routes } from '@angular/router';
import { AuthComponent } from './Component/authcomponent/authcomponent';
import { LandingPage } from './Component/landing-page/landing-page';
import { UsersComponent } from "./Users/carspage/carspage";
import { AdminDashboardComponent } from './Admin/admin-dashboard/admin-dashboard';
import { AdminBookingsComponent } from './Admin/admin-bookings/admin-bookings';
import { CarDetailComponent } from './Component/car-booking/car-booking';
import { UserBookingsComponent } from './Component/user-bookings/user-bookings';
import { UserProfileComponent } from './Users/profilesettings/profilesettings';
import { ResetPasswordComponent } from './Component/reset-password/reset-password';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: LandingPage },
  { path: 'about', component: LandingPage },
  { path: 'services', component: LandingPage },
  { path: 'pricing', component: LandingPage },
  { path: 'vehicles', component: LandingPage },
  { path: 'blog', component: LandingPage },
  { path: 'contact', component: LandingPage },
  { path: 'profile', component: UserProfileComponent },
  { path: 'bookings', component: CarDetailComponent },
  { path: 'my-bookings', component: UserBookingsComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'admin/bookings', component: AdminBookingsComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'booking', component: CarDetailComponent },
  { path: 'login', redirectTo: '/auth', pathMatch: 'full' },
  { path: 'register', redirectTo: '/auth', pathMatch: 'full' },
  { path: 'users/cars', component: UsersComponent },
  { path: '**', redirectTo: '/home' }
];
