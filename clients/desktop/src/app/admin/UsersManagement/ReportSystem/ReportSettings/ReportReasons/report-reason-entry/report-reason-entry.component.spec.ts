import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportReasonEntryComponent } from './report-reason-entry.component';

describe('ReportReasonEntryComponent', () => {
  let component: ReportReasonEntryComponent;
  let fixture: ComponentFixture<ReportReasonEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportReasonEntryComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportReasonEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
