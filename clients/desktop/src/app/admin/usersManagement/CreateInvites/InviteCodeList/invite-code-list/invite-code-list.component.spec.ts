import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteCodeListComponent } from './invite-code-list.component';

describe('InviteCodeListComponent', () => {
  let component: InviteCodeListComponent;
  let fixture: ComponentFixture<InviteCodeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InviteCodeListComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InviteCodeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
