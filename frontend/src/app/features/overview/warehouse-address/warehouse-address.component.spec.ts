import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseAddressComponent } from './warehouse-address.component';

describe('OrderdetailComponent', () => {
  let component: WarehouseAddressComponent;
  let fixture: ComponentFixture<WarehouseAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
