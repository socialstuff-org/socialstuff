import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.scss']
})
export class MessageBoxComponent implements OnInit {

  public message: string;

  @Input()

  constructor() { }

  ngOnInit(): void {
  }

  public sendMessage() {
    console.log('Sending message: ' + this.message);
    // TODO send message to server
    this.message = "";
    console.log('textarea cleared!');
  }

}
