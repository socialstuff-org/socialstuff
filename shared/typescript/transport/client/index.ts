// This file is part of the TITP.
//
// TITP is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// TITP is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with TITP.  If not, see <https://www.gnu.org/licenses/>.

import {Socket}                                                           from 'net';
import {promisify}                                                        from 'util';
import {createPrivateKey, createPublicKey, createVerify, ECDH, KeyObject} from 'crypto';
import {CommonTitpClient}                                                 from './common';
import {Handshake}                                                        from './handshake';
import {decryptAes384, decryptRsa}                                        from '../crypto';
import {
  buildServerMessage,
  ChatMessage,
  deserializeChatMessage, serializeChatMessage,
  serializeServerMessage,
  ServerMessageType,
}                                                                         from '../message';
import {UserKeyRegistry}                                                  from '../user-key-registry';
import {ConversationKeyRegistry}                                          from '../conversation-key-registry';
import {Observable, Subject}                                              from 'rxjs';

export class TitpClient extends CommonTitpClient {
  private _rsa: { priv: KeyObject, pub: KeyObject };
  private _ecdh: ECDH;
  protected _key: Buffer = Buffer.alloc(0, 0);
  protected _onIncomingMessage = new Subject<ChatMessage>();

  /**
   *
   * @param username
   * @param rsa The RSA key-pair of the user. If only a string is provided, it is assumed to be the private key, as the the key-pair will be generated from that string.
   * @param ecdh
   * @param _keyRegistry
   */
  constructor(
    username: string,
    rsa: { priv: KeyObject, pub: KeyObject } | string,
    ecdh: ECDH,
    private _keyRegistry: UserKeyRegistry & ConversationKeyRegistry,
  ) {
    super(username, new Socket());
    if (typeof rsa === 'string') {
      this._rsa = {
        pub:  createPublicKey(rsa),
        priv: createPrivateKey(rsa),
      };
    } else {
      this._rsa = rsa;
    }
    this._ecdh = ecdh;

    this._onData.subscribe(this._interpretIncomingData.bind(this));
  }

  /**
   * Returns the RSA public key of the user.
   */
  public rsaPublicKey() {
    return this._rsa.pub;
  }

  /**
   *
   * @param hostRsaPub
   * @param host
   * @param port
   */
  public async connect(hostRsaPub: KeyObject, host: string, port: number = 8086) {
    await promisify<number, string>(this._socket.connect.bind(this._socket))(port, host);
    const handshake = new Handshake(this._username, this._socket, this._ecdh, this._rsa, hostRsaPub);
    await handshake._handshakeResult.toPromise();
    this._key = handshake._syncKey;
    this._init();
  }

  /**
   * Terminates the server connection.
   */
  public end() {
    return new Promise(res => {
      this._socket.end(() => {
        this._socket.destroy();
        res();
      });
    });
  }

  /**
   * Instruct the server to forward a message to its respective recipients.
   * @param message The message to be sent.
   * @param recipients A list of recipients. Each name must follow the schema <name>[@<server>[:<port>]].
   * @param groupId Optional: An identifier, which indicates the association of a message to a group chat.
   */
  public async sendChatMessageTo(message: ChatMessage, recipients: string[], groupId?: string) {
    if (recipients.length < 1) {
      throw new Error('Please provide at least one recipient for the message!');
    }
    let conversationKey: Buffer;
    if (groupId) {
      conversationKey = await this._keyRegistry.fetchConversationKey('~' + groupId);
    } else {
      if (recipients.length !== 1) {
        throw new Error('Please provide at exactly one recipient for the message, if it is not intended for a group chat!');
      }
      conversationKey = await this._keyRegistry.fetchConversationKey(recipients[0]);
    }
    const recipientsWithPublicKeys = await Promise.all(recipients.map(async name => ({
      name, publicKey: await this._keyRegistry.fetchRsa(name),
    })));
    const serverMessage = buildServerMessage(message, this._rsa.priv, conversationKey, recipientsWithPublicKeys);
    return this.write(serializeServerMessage(serverMessage));
  }

  /**
   * Returns an Observable, which emits successfully parsed messages, which have been forwarded to the client.
   */
  public incomingMessage(): Observable<ChatMessage> {
    return this._onIncomingMessage;
  }

  /**
   * Converts incoming raw data into a ChatMessage.
   * @param data The incoming data to be converted/parsed.
   * @private
   */
  private async _parseChatMessage(data: Buffer) {
    const signatureLength = data.readInt16BE();
    const signature = decryptRsa(data.slice(2, signatureLength + 2), this._rsa.priv);
    const senderNameLength = signature.readInt16BE();
    const senderName = signature.slice(2, 2 + senderNameLength).toString('utf-8');
    const senderNameSignature = signature.slice(2 + senderNameLength);
    const senderRsa = await this._keyRegistry.fetchRsa(senderName);
    {
      const verifier = createVerify('RSA-SHA512');
      verifier.update(senderName);
      if (!verifier.verify(senderRsa, senderNameSignature)) {
        throw new Error('Sender verification failed!');
      }
    }
    const messageBuffer = data.slice(signatureLength + 2);
    const decryptedSerializedChatMessage = decryptAes384(messageBuffer, await this._keyRegistry.fetchConversationKey(senderName));
    return deserializeChatMessage(decryptedSerializedChatMessage);
  }

  /**
   *
   * @param data
   * @private
   */
  private async _interpretIncomingData(data: Buffer) {
    const messageType: ServerMessageType = data.readInt16BE();
    switch (messageType) {
      case ServerMessageType.chatMessage:
        const message = await this._parseChatMessage(data.slice(2));
        this._onIncomingMessage.next(message);
        break;

      default:
        throw new Error('Unknown server message type!');
    }
  }
}
