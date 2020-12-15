import {Component, Inject, OnInit}     from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Contact}                       from '../models/Contact';

@Component({
  selector: 'app-contact-info',
  templateUrl: './contact-info.component.html',
  styleUrls: ['./contact-info.component.scss']
})
export class ContactInfoComponent implements OnInit {

  public chatPartner: Contact;

  constructor(
    public dialogRef: MatDialogRef<ContactInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {chatPartner: Contact}) {
  }

  ngOnInit(): void {
    this.chatPartner = this.data.chatPartner;
    console.log(this.chatPartner);
  }

  public closeContactInfo() {
    this.dialogRef.close();
  }



}
