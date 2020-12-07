import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {delay}                                    from '@socialstuff/utilities/common';

@Component({
  selector:    'app-microphone-test',
  templateUrl: './microphone-test.component.html',
  styleUrls:   ['./microphone-test.component.scss'],
})
export class MicrophoneTestComponent implements OnInit {

  private recordingFinishedEvent: BlobEvent;

  @ViewChild('audioPlayer')
  private audioPlayer: ElementRef<HTMLAudioElement>;

  constructor() {
  }

  public recordOption: 'Start' | 'Stop' = 'Start';
  private recorder: MediaRecorder;

  async ngOnInit() {
    const microphone = await navigator.mediaDevices.getUserMedia({audio: true});
    this.recorder = new MediaRecorder(microphone);
    this.recorder.addEventListener('dataavailable', data => {
      this.recordingFinishedEvent = data;
    });
  }

  async toggleRecording() {
    if (this.recordOption === 'Start') {
      this.recorder.start();
      this.recordOption = 'Stop';
    } else {
      this.recorder.stop();
      this.recordOption = 'Start';
      await delay(0);
      this.audioPlayer.nativeElement.src = URL.createObjectURL(this.recordingFinishedEvent.data);
      this.recordingFinishedEvent = undefined;
    }
  }

}
