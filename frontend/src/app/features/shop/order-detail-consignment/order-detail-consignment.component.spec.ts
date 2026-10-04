import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDetailConsignmentComponent } from './order-detail-consignment.component';

describe('OrderDetailConsignmentComponent', () => {
  let component: OrderDetailConsignmentComponent;
  let fixture: ComponentFixture<OrderDetailConsignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderDetailConsignmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderDetailConsignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
