import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportedUsersComponent } from './reported-users.component';

describe('ReportedUsersComponent', () => {
  let component: ReportedUsersComponent;
  let fixture: ComponentFixture<ReportedUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportedUsersComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportedUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
