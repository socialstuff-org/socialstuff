import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ChatPartner} from "../models/ChatPartner";

@Component({
  selector: 'app-contact-info',
  templateUrl: './contact-info.component.html',
  styleUrls: ['./contact-info.component.scss']
})
export class ContactInfoComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ContactInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChatPartner) {
  }

  ngOnInit(): void {
    console.log(this.data.customName);
    console.log(this.data.imageUrl);
  }

  public closeContactInfo() {
    this.dialogRef.close();
  }



}
