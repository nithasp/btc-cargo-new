import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlipayPaymentComponent } from './alipay-payment.component';

describe('AlipayPaymentComponent', () => {
  let component: AlipayPaymentComponent;
  let fixture: ComponentFixture<AlipayPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlipayPaymentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlipayPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
