import {Component, Inject, OnInit}     from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Contact}                       from '../../models/Contact';
import {ContactService}                from '../../services/contact.service';

@Component({
  selector:    'app-update-display-name',
  templateUrl: './update-display-name.component.html',
  styleUrls:   ['./update-display-name.component.scss']
})
export class UpdateDisplayNameComponent implements OnInit {

  public chatPartner: Contact;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { chatPartner: Contact },
    private contact: ContactService,
    public dialogRef: MatDialogRef<UpdateDisplayNameComponent>,
  ) {
  }

  ngOnInit(): void {
    this.chatPartner = this.data.chatPartner;
  }

  public async updateDisplayName(): Promise<void> {
    await this.contact.update(this.chatPartner);
    this.dialogRef.close();
  }

}
