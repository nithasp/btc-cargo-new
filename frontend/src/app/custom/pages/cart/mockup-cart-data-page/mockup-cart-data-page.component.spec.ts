import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockupCartDataPageComponent } from './mockup-cart-data-page.component';

describe('MockupCartDataPageComponent', () => {
  let component: MockupCartDataPageComponent;
  let fixture: ComponentFixture<MockupCartDataPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MockupCartDataPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MockupCartDataPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
