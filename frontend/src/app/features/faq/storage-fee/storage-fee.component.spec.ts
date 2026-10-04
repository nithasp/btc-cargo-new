import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageFeeComponent } from './storage-fee.component';

describe('StorageFeeComponent', () => {
  let component: StorageFeeComponent;
  let fixture: ComponentFixture<StorageFeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StorageFeeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StorageFeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
