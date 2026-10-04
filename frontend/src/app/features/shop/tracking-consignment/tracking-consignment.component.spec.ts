import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackingConsignmentComponent } from './tracking-consignment.component';

describe('TrackingConsignmentComponent', () => {
  let component: TrackingConsignmentComponent;
  let fixture: ComponentFixture<TrackingConsignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrackingConsignmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackingConsignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
