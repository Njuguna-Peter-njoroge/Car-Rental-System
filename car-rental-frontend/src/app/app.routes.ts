import { Routes } from '@angular/router';
import { AuthComponent } from './Component/authcomponent/authcomponent';
import { LandingPage } from './Component/landing-page/landing-page';
import { UsersComponent } from "./Users/carspage/carspage";
import { AdminDashboardComponent } from './Admin/admin-dashboard/admin-dashboard';
import { CarDetailComponent } from './Component/car-booking/car-booking';
import { Profilesettings } from './Users/profilesettings/profilesettings';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: LandingPage },
  { path: 'about', component: LandingPage },
  { path: 'services', component: LandingPage },
  { path: 'pricing', component: LandingPage },
  { path: 'vehicles', component: LandingPage },
  { path: 'blog', component: LandingPage },
  { path: 'contact', component: LandingPage },
  { path: 'profile', component: Profilesettings },
  { path: 'bookings', component: CarDetailComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'booking', component: CarDetailComponent },
  { path: 'login', redirectTo: '/auth', pathMatch: 'full' },
  { path: 'register', redirectTo: '/auth', pathMatch: 'full' },
  { path: 'users/cars', component: UsersComponent },
  { path: '**', redirectTo: '/home' }
];
