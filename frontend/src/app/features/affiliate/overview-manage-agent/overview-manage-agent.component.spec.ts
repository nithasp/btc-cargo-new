import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewManageAgentComponent } from './overview-manage-agent.component';

describe('OverviewManageAgentComponent', () => {
  let component: OverviewManageAgentComponent;
  let fixture: ComponentFixture<OverviewManageAgentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OverviewManageAgentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewManageAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
