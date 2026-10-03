import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodsConfirmComponent } from './goods-confirm.component';

describe('GoodsConfirmComponent', () => {
  let component: GoodsConfirmComponent;
  let fixture: ComponentFixture<GoodsConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoodsConfirmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoodsConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
