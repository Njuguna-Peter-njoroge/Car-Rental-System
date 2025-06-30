import { Component } from '@angular/core';
import {NavbarComponent} from '../Shared/navbar/navbar';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-userpage',
  imports: [
    NavbarComponent,
    RouterOutlet
  ],
  templateUrl: './userpage.html',
  styleUrl: './userpage.css'
})
export class Userpage {

}
