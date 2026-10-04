import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportPaymentDetailComponent } from './transport-payment-detail.component';

describe('TransportPaymentDetailComponent', () => {
  let component: TransportPaymentDetailComponent;
  let fixture: ComponentFixture<TransportPaymentDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransportPaymentDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransportPaymentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
