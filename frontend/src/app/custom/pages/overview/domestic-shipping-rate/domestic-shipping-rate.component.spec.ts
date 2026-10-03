import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DomesticShippingRateComponent } from './domestic-shipping-rate.component';

describe('OrderdetailComponent', () => {
  let component: DomesticShippingRateComponent;
  let fixture: ComponentFixture<DomesticShippingRateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DomesticShippingRateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DomesticShippingRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
