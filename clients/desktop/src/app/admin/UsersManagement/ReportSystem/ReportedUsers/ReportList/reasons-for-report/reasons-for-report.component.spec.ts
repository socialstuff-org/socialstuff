import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReasonsForReportComponent } from './reasons-for-report.component';

describe('ReasonsForReportComponent', () => {
  let component: ReasonsForReportComponent;
  let fixture: ComponentFixture<ReasonsForReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReasonsForReportComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReasonsForReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
