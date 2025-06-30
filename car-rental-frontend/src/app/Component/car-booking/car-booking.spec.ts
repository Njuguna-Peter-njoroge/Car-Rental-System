import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarBooking } from './car-booking';

describe('CarBooking', () => {
  let component: CarBooking;
  let fixture: ComponentFixture<CarBooking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarBooking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarBooking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
