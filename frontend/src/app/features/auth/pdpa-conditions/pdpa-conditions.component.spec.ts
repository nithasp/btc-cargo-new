import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdpaConditionsComponent } from './pdpa-conditions.component';

describe('PdpaConditionsComponent', () => {
  let component: PdpaConditionsComponent;
  let fixture: ComponentFixture<PdpaConditionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PdpaConditionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PdpaConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
