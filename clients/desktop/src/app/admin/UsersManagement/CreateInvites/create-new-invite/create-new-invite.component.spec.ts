import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewInviteComponent } from './create-new-invite.component';

describe('CreateNewInviteComponent', () => {
  let component: CreateNewInviteComponent;
  let fixture: ComponentFixture<CreateNewInviteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateNewInviteComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNewInviteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
