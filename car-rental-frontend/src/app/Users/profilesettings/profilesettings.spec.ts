import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Profilesettings } from './profilesettings';

describe('Profilesettings', () => {
  let component: Profilesettings;
  let fixture: ComponentFixture<Profilesettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profilesettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Profilesettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
