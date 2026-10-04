import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportPaymentComponent } from './transport-payment.component';

describe('TransportPaymentComponent', () => {
  let component: TransportPaymentComponent;
  let fixture: ComponentFixture<TransportPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransportPaymentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransportPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
