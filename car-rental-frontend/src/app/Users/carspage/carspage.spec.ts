import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Carspage } from './carspage';

describe('Carspage', () => {
  let component: Carspage;
  let fixture: ComponentFixture<Carspage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Carspage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Carspage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
