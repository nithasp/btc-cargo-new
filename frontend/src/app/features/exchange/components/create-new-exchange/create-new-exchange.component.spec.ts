import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewExchangeComponent } from './create-new-exchange.component';

describe('CreateNewExchangeComponent', () => {
  let component: CreateNewExchangeComponent;
  let fixture: ComponentFixture<CreateNewExchangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateNewExchangeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNewExchangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
