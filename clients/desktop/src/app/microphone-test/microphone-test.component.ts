import {Component, OnInit} from '@angular/core';
import {delay}             from '@socialstuff/utilities/common';

@Component({
  selector:    'app-microphone-test',
  templateUrl: './microphone-test.component.html',
  styleUrls:   ['./microphone-test.component.scss'],
})
export class MicrophoneTestComponent implements OnInit {

  private recordingBuffer: any[] = [];

  constructor() {
  }

  public recordOption: 'Start' | 'Stop' = 'Start';
  private recorder: MediaRecorder;

  async ngOnInit() {
    const microphone = await navigator.mediaDevices.getUserMedia({audio: true});
    this.recorder = new MediaRecorder(microphone);
    this.recorder.addEventListener('dataavailable', data => {
      this.recordingBuffer.push(data);
    });
  }

  async toggleRecording() {
    if (this.recordOption === 'Start') {
      this.recorder.start();
      this.recordOption = 'Stop';
    } else {
      this.recorder.requestData();
      this.recorder.stop();
      this.recordOption = 'Start';
      await delay(0);
      console.log(this.recordingBuffer);
      this.recordingBuffer = [];
    }
  }

}
