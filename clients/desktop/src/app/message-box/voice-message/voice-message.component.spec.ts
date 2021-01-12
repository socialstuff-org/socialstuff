import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoiceMessageComponent } from './voice-message.component';

describe('VoiceMessageComponent', () => {
  let component: VoiceMessageComponent;
  let fixture: ComponentFixture<VoiceMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoiceMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoiceMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
