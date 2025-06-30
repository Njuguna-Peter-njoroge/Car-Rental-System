import { Routes } from '@angular/router';
import { AuthComponent } from './Component/authcomponent/authcomponent';
import { LandingPage } from './Component/landing-page/landing-page';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: LandingPage },
  { path: 'about', component: LandingPage },
  { path: 'services', component: LandingPage },
  { path: 'pricing', component: LandingPage },
  { path: 'vehicles', component: LandingPage },
  { path: 'blog', component: LandingPage },
  { path: 'contact', component: LandingPage },
  { path: 'profile', component: LandingPage },
  { path: 'bookings', component: LandingPage },
  { path: 'admin', component: LandingPage },
  { path: 'auth', component: AuthComponent },
  { path: 'login', redirectTo: '/auth', pathMatch: 'full' },
  { path: 'register', redirectTo: '/auth', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];
