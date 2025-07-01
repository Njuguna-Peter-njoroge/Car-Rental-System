import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Carpost } from './carpost';

describe('Carpost', () => {
  let component: Carpost;
  let fixture: ComponentFixture<Carpost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Carpost]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Carpost);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
