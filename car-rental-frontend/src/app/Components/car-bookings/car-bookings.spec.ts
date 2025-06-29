import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarBookings } from './car-bookings';

describe('CarBookings', () => {
  let component: CarBookings;
  let fixture: ComponentFixture<CarBookings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarBookings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarBookings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
