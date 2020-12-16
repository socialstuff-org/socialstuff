import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { delay } from '@socialstuff/utilities/common';

@Component({
  selector: 'app-voice-message',
  templateUrl: './voice-message.component.html',
  styleUrls: ['./voice-message.component.scss']
})
export class VoiceMessageComponent implements OnInit {

  @Output()
  public recordingReady = new EventEmitter<Blob>();

  public recordingState = false;
  private recorder: MediaRecorder;
  private voiceRecording: Blob;

  constructor() { }

  async ngOnInit() {
    const microphone = await navigator.mediaDevices.getUserMedia({audio: true});
    this.recorder = new MediaRecorder(microphone);
    this.recorder.addEventListener('dataavailable', e => {
      this.voiceRecording = e.data;
    });
  }

  public toggleRecording() {
    if (this.recordingState) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  public startRecording() {
    this.recordingState = true;
    this.recorder.start();
  }

  public async stopRecording() {
    this.recordingState = false;
    this.recorder.stop();
    await delay(0);
    this.recordingReady.emit(this.voiceRecording)
  }

  public async cancel() {
    this.recordingState = false;
    this.recorder.stop();
    await delay(0);
    this.voiceRecording = undefined;
  }

}
