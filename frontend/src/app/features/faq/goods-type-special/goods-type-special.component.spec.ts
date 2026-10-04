import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodsTypeSpecialComponent } from './goods-type-special.component';

describe('GoodsTypeSpecialComponent', () => {
  let component: GoodsTypeSpecialComponent;
  let fixture: ComponentFixture<GoodsTypeSpecialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoodsTypeSpecialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoodsTypeSpecialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
