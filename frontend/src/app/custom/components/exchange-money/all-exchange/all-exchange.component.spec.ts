import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllExchangeComponent } from './all-exchange.component';

describe('AllExchangeComponent', () => {
  let component: AllExchangeComponent;
  let fixture: ComponentFixture<AllExchangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllExchangeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllExchangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
