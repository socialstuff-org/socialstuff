import {Component, Inject, OnInit}                from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Contact}                                  from '../models/Contact';
import {UpdateDisplayNameComponent}    from "../dialogs/update-display-name/update-display-name.component";

@Component({
  selector:    'app-contact-info',
  templateUrl: './contact-info.component.html',
  styleUrls:   ['./contact-info.component.scss']
})
export class ContactInfoComponent implements OnInit {

  public chatPartner: Contact;

  constructor(
    public dialogRef: MatDialogRef<ContactInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { chatPartner: Contact },
    public dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    this.chatPartner = this.data.chatPartner;
    console.log(this.chatPartner);
  }

  public closeContactInfo() {
    this.dialogRef.close();
  }

  public changeDisplayName(chatPartner: Contact) {
    const dialogRef = this.dialog.open(UpdateDisplayNameComponent, {
      data: {chatPartner: chatPartner}
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }


}
