import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteCodeRowComponent } from './invite-code-row.component';

describe('InviteCodeRowComponent', () => {
  let component: InviteCodeRowComponent;
  let fixture: ComponentFixture<InviteCodeRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InviteCodeRowComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InviteCodeRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
