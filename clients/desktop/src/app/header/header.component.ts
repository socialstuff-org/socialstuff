import {Component, Input, OnInit}     from '@angular/core';
import {Router}                                             from '@angular/router';
import {ChatPartner}                                        from '../models/ChatPartner';
import {MatDialog}                                          from '@angular/material/dialog';
import {ContactInfoComponent}                               from '../contact-info/contact-info.component';
import {TitpServiceService}                                 from '../services/titp-service.service';
import Swal                                                 from 'sweetalert2';
import {ContactService}                                     from '../services/contact.service';
import {Contact}                                            from '../models/Contact';
import {hashUsername, hashUsernameHmac}                     from '../../lib/helpers';
import {KeyRegistryService}                                 from '../services/key-registry.service';
import {ChatMessage, ChatMessageType, serializeChatMessage} from '@trale/transport/message';
import {CryptoStorageService}                               from '../services/crypto-storage.service';
import { prefix } from '@trale/transport/log';
import { ApiService } from 'app/services/api.service';

const log = prefix('clients/desktop/components/header-component');

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input() chatPartner: Contact;
  @Input() username: string;
  private contactInfoIsOpen = false;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    public titp: TitpServiceService,
    private contacts: ContactService,
    private keys: KeyRegistryService,
    private storage: CryptoStorageService,
    private api: ApiService,
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

  public async addNewContact() {
    const swalResult = await Swal.fire({
      title: 'Add contact',
      text: 'Enter the username you want to connect with (e.g. sampleuser@myserver.com)',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Connect',
      showLoaderOnConfirm: true,
      preConfirm: async (username: string) => {
        if (!username.includes('@')) {
          username += '@' + this.titp.host;
        }
        try {
          await this.titp.client.negotiateKeyWith(username);
        } catch {
          Swal.showValidationMessage('Could not start key negotiation. Perhaps the username is invalid.');
          return;
        }
        const contact: Contact = {
          username,
          usernameHash: hashUsernameHmac(username, this.storage.masterKey),
          rsaPublicKey: await this.keys.fetchRsa(username),
          conversationKey: Buffer.alloc(0)
        };
        log('adding contact', contact);
        await this.contacts.addContact(contact);
        log('done adding contact', contact);
        const chat = await this.contacts.openChat(contact);
        log('opened chat with contact', contact)
        const initialMessage: ChatMessage = {
          senderName: this.titp.client.username() + this.api.hostname,
          content: Buffer.alloc(0),
          type: ChatMessageType.handshakeInitialization,
          sentAt: new Date(),
          attachments: []
        };
        log('initial message', initialMessage);
        log('adding inital record for contact', contact);
        await chat.addRecord(serializeChatMessage(initialMessage));
        log('closing chat for contact', contact);
        await chat.close();
        log('done closing chat for contact', contact);
        return contact;
      },
      allowOutsideClick: () => !Swal.isLoading()
    });
    if (swalResult.isConfirmed) {
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Your handshake with ${swalResult.value.username} has been initiated. Please wait for handshake to be finalized!`,
      });
    }
  }


}
