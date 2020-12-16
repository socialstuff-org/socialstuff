import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateDisplayNameComponent } from './update-display-name.component';

describe('UpdateDisplayNameComponent', () => {
  let component: UpdateDisplayNameComponent;
  let fixture: ComponentFixture<UpdateDisplayNameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateDisplayNameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateDisplayNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
