import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentNoticeComponent } from './payment-notice.component';

describe('PaymentNoticeComponent', () => {
  let component: PaymentNoticeComponent;
  let fixture: ComponentFixture<PaymentNoticeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentNoticeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentNoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
