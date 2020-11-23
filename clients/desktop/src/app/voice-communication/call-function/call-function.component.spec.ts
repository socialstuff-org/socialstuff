import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallFunctionComponent } from './call-function.component';

describe('CallFunctionComponent', () => {
  let component: CallFunctionComponent;
  let fixture: ComponentFixture<CallFunctionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallFunctionComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallFunctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
