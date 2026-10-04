import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliateModalComponent } from './affiliate-modal.component';

describe('AffiliateModalComponent', () => {
  let component: AffiliateModalComponent;
  let fixture: ComponentFixture<AffiliateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AffiliateModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AffiliateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
