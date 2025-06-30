// car-rental-contact.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Country {
  name: string;
  code: string;
  flag: string;
  dial: string;
}

@Component({
  selector: 'app-car-rental-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './contactus.html',
  styleUrls: ['./contactus.css']
})
export class CarRentalContactComponent {
  contactForm: FormGroup;
  countries: Country[] = [
    { name: 'United States', code: 'US', flag: '🇺🇸', dial: '+1' },
    { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', dial: '+44' },
    { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', dial: '+971' },
    { name: 'Canada', code: 'CA', flag: '🇨🇦', dial: '+1' },
    { name: 'Germany', code: 'DE', flag: '🇩🇪', dial: '+49' },
    { name: 'France', code: 'FR', flag: '🇫🇷', dial: '+33' },
    { name: 'India', code: 'IN', flag: '🇮🇳', dial: '+91' },
    { name: 'Nigeria', code: 'NG', flag: '🇳🇬', dial: '+234' },
    { name: 'South Africa', code: 'ZA', flag: '🇿🇦', dial: '+27' },
    { name: 'Australia', code: 'AU', flag: '🇦🇺', dial: '+61' },
    { name: 'Kenya', code: 'KE', flag: '🇰🇪', dial: '+254' },
    { name: 'Ghana', code: 'GH', flag: '🇬🇭', dial: '+233' },
    { name: 'China', code: 'CN', flag: '🇨🇳', dial: '+86' },
    { name: 'Japan', code: 'JP', flag: '🇯🇵', dial: '+81' },
    { name: 'Brazil', code: 'BR', flag: '🇧🇷', dial: '+55' },
    { name: 'South Korea', code: 'KR', flag: '🇰🇷', dial: '+82' },
    { name: 'Turkey', code: 'TR', flag: '🇹🇷', dial: '+90' },
    { name: 'Russia', code: 'RU', flag: '🇷🇺', dial: '+7' },
    { name: 'Italy', code: 'IT', flag: '🇮🇹', dial: '+39' },
    { name: 'Spain', code: 'ES', flag: '🇪🇸', dial: '+34' },
  ];
  selectedCountry: Country = this.countries[0];

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      country: [this.selectedCountry, Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{7,15}$/)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onCountryChange(event: any) {
    const country = this.countries.find(c => c.code === event.target.value);
    if (country) {
      this.selectedCountry = country;
      this.contactForm.patchValue({ country });
    }
  }

  onSubmit() {
    if (this.contactForm.valid) {
      const formValue = this.contactForm.value;
      const fullPhone = `${formValue.country.dial}${formValue.phone}`;
      const payload = { ...formValue, phone: fullPhone };
      console.log('Contact form submitted:', payload);
      alert('Thank you for contacting us! We will get back to you soon.');
      this.contactForm.reset({ country: this.selectedCountry });
    } else {
      this.contactForm.markAllAsTouched();
    }
  }
}
