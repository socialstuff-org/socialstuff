import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InformationTypeTileComponent } from './information-type-tile.component';

describe('InformationTypeTileComponent', () => {
  let component: InformationTypeTileComponent;
  let fixture: ComponentFixture<InformationTypeTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InformationTypeTileComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformationTypeTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
