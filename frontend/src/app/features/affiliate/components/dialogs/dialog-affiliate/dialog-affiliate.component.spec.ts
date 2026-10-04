import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAffiliateComponent } from './dialog-affiliate.component';

describe('DialogAffiliateComponent', () => {
  let component: DialogAffiliateComponent;
  let fixture: ComponentFixture<DialogAffiliateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogAffiliateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogAffiliateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
