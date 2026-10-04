import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HowToCalculateComponent } from './how-to-calculate.component';

describe('HowToCalculateComponent', () => {
  let component: HowToCalculateComponent;
  let fixture: ComponentFixture<HowToCalculateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HowToCalculateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HowToCalculateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
