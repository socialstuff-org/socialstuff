import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSettingsComponent } from './report-settings.component';

describe('ReportSettingsComponent', () => {
  let component: ReportSettingsComponent;
  let fixture: ComponentFixture<ReportSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportSettingsComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
