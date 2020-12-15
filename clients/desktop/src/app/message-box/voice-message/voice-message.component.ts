import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-voice-message',
  templateUrl: './voice-message.component.html',
  styleUrls: ['./voice-message.component.scss']
})
export class VoiceMessageComponent implements OnInit {

  public recordingState = false;

  constructor() { }

  ngOnInit(): void {
  }

  public toggleRecording() {
    if (this.recordingState) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
    this.recordingState = !this.recordingState;
  }

  public startRecording() {

  }

  public stopRecording() {
    // TODO implement
  }

  public cancel() {
    this.recordingState = false;
    // TODO clear current audio stream
  }

}
