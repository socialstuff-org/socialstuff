import {Component, Input, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {ChatPartner} from "../models/ChatPartner";
import {MatDialog} from "@angular/material/dialog";
import {ContactInfoComponent} from "../contact-info/contact-info.component";
import {TitpServiceService} from '../services/titp-service.service';
import Swal from "sweetalert2";

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
  ) {
  }

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

  public addNewContact() {
    Swal.fire({
      title: 'Add contact',
      text: 'Enter the username you want to connect with (e.g. sampleuser@myserver.com)',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Connect',
      showLoaderOnConfirm: true,
      preConfirm: (login) => {
        // TODO initiate handshake
        // TODO create chat partner directory with chat properties
        // TODO create "chat message" with content "Handshake initiated, please wait until the handshake is finalized!"
        return fetch(`//api.github.com/users/${login}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(response.statusText);
            }
            return response.json();
          })
          .catch(error => {
            Swal.showValidationMessage(
              `Request failed: ${error}`
            );
          });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Your handshake to $username has been initiated. Please wait for handshake to be finalized!',
        });
      }
    });
  }
}
