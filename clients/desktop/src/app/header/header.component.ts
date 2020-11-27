import {Component, Input, OnInit} from '@angular/core';
import {Router}                   from "@angular/router";
import {ChatPartner}              from "../models/ChatPartner";
import {MatDialog}                from "@angular/material/dialog";
import {ContactInfoComponent}     from "../contact-info/contact-info.component";
import {TitpServiceService}       from '../services/titp-service.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input() chatPartner: ChatPartner;
  private contactInfoIsOpen = false;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    public titp: TitpServiceService,
  ) { }

  ngOnInit(): void {
  }

  public logout() {
    // TODO connect with auth service, wipe all existent auth data
    this.router.navigateByUrl('/logout');
  }

  public openContactInfo(): void {

    if (this.contactInfoIsOpen) {
      return;
    }
    this.contactInfoIsOpen = true;
    const dialogRef = this.dialog.open(ContactInfoComponent, {
      data: {partner: this.chatPartner}
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.contactInfoIsOpen = false;
      // TODO handle when contact info has been closed
    });
  }


}
