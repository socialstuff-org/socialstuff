import {Component, OnInit}    from '@angular/core';
import {Contact}              from '../models/Contact';
import {ActivatedRoute, Router}       from '@angular/router';
import {ContactService}       from '../services/contact.service';
import {TitpServiceService}   from '../services/titp-service.service';
import {CryptoStorageService} from '../services/crypto-storage.service';
import {DebugService}         from '../services/debug.service';
import { prefix } from '@trale/transport/log';

const log = prefix('clients/desktop/component/chat-app');

declare let particlesJS: any;

/**
 * Chat app component
 *
 * This is the main component of [Trale messenger]{@link https://trale.org}. It is responsible for handling the active chat view as well as current
 * header and sidenav data.
 */
@Component({
  selector:    'app-chat-app',
  templateUrl: './chat-app.component.html',
  styleUrls:   ['./chat-app.component.scss']
})
export class ChatAppComponent implements OnInit {

  public chatPartner: Contact;
  public username = '';

  constructor(
    private titp: TitpServiceService,
    private activatedRoute: ActivatedRoute,
    private contacts: ContactService,
    private storage: CryptoStorageService,
    private debug: DebugService,
    private router: Router,
  ) {
  }

  /**
   * Initialization of chat application
   *
   * Loading debug session, loading [local storage]{@link CryptoStorageService} and awaiting connection to Trale server.
   * If storage loaded and connection established ... TODO @joernneumeyer
   *
   * @return {Promise<void>}
   */
  async ngOnInit(): Promise<void> {
    particlesJS.load('particles-js', '../assets/particles.json', function() {
      console.log('callback - particles.js config loaded');
    });

    const debugSession = await this.debug.loadSession();
    if (debugSession === false && this.titp.connected === false) {
      this.router.navigate(['/', 'login']);
      return;
    }
    log('required chat app resources are loaded!');
    

    this.username = this.titp.client.username();
    this.activatedRoute.params.subscribe(async params => {
      const username = params.username;
      if (!username) {
        return;
      }
      const loadedContact = await this.contacts.load(username);
      if (!loadedContact) {
        return;
      }
      this.chatPartner = loadedContact;
    });

  }

}
