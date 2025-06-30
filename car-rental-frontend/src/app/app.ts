import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './Component/Shared/navbar/navbar';
import { FooterComponent } from './Component/Shared/footer/footer';
import { CarRentalContactComponent } from './Component/Shared/contactus/contactus';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CarRentalContactComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'car-rental-frontend';
}
