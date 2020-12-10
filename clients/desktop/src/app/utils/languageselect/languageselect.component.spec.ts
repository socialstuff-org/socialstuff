import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageselectComponent } from './languageselect.component';

describe('LanguageselectComponent', () => {
  let component: LanguageselectComponent;
  let fixture: ComponentFixture<LanguageselectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LanguageselectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LanguageselectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
