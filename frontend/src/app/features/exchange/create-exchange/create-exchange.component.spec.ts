import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateExchangeComponent } from './create-exchange.component';

describe('OrderdetailComponent', () => {
  let component: CreateExchangeComponent;
  let fixture: ComponentFixture<CreateExchangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateExchangeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateExchangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
