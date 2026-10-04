import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternationalShippingRateComponent } from './international-shipping-rate.component';

describe('OrderdetailComponent', () => {
  let component: InternationalShippingRateComponent;
  let fixture: ComponentFixture<InternationalShippingRateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InternationalShippingRateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InternationalShippingRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
