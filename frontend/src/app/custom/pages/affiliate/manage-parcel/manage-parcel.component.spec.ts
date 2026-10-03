import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageParcelComponent } from './manage-parcel.component';

describe('ManageParcelComponent', () => {
  let component: ManageParcelComponent;
  let fixture: ComponentFixture<ManageParcelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageParcelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageParcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
