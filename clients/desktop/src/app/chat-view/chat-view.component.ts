import {Component, OnInit}                   from '@angular/core';
import {Message}                             from '../models/Message';
import {ChatPartner, createEmptyChatPartner} from '../models/ChatPartner';
import {UtilService}                         from '../services/util.service';
import {DebugService}                        from '../services/debug.service';
import {ContactService}                      from '../services/contact.service';
import {take}                                from '../../lib/functional';
import {delay}             from '@socialstuff/utilities/common';

@Component({
  selector:    'app-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls:   ['./chat-view.component.scss'],
})
export class ChatViewComponent implements OnInit {

  private recordingBuffer: any[] = [];

  public messages: Message[];
  public chatPartner: ChatPartner;

  constructor(
    private utils: UtilService,
    private debug: DebugService,
    private contacts: ContactService,
  ) {
    this.messages = [];
    this.chatPartner = createEmptyChatPartner();
    this.chatPartner.realName = 'Max Mustermann';
    this.chatPartner.username = 'maxmustermann99';
    this.chatPartner.imageUrl = 'https://cdn.code-lake.com/mergery/users/vanderzee.jpg';
    this.chatPartner.acronym = this.utils.generateAcronym(this.chatPartner.realName);
  }
  //Set MediaRecorder for Microphone
  public recordOption: 'Start' | 'Stop' = 'Start';
  private recorder: MediaRecorder;

  async ngOnInit() {

    //Set variables for Microphone
    //navigator.permissions.query({name: 'microphone'});
    //await navigator.permissions.query().
    const microphone = await navigator.mediaDevices.getUserMedia({audio: true});
    this.recorder = new MediaRecorder(microphone);
    this.recorder.addEventListener('dataavailable', data => {
      this.recordingBuffer.push(data);
    });
    console.log('recorder is finished');
  }
  async toggleRecording() {
    console.log('microphone', this.recorder);
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
