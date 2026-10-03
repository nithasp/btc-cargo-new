import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackingDetailsMobileComponent } from './tracking-details-mobile.component';

describe('TrackingDetailsMobileComponent', () => {
  let component: TrackingDetailsMobileComponent;
  let fixture: ComponentFixture<TrackingDetailsMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrackingDetailsMobileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackingDetailsMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
