import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatedParcelListComponent } from './created-parcel-list.component';

describe('CreatedParcelListComponent', () => {
  let component: CreatedParcelListComponent;
  let fixture: ComponentFixture<CreatedParcelListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatedParcelListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatedParcelListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
