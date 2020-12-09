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

import {Socket}                                                                       from 'net';
import {promisify}                                                                    from 'util';
import {createPrivateKey, createPublicKey, createSign, createVerify, ECDH, KeyObject} from 'crypto';
import {CommonTitpClient}                                                             from './common';
import {Handshake}                                                                    from './handshake';
import {decrypt, decryptRsa, encryptRsa}                                              from '../crypto';
import {
  buildServerMessage,
  ChatMessage,
  ChatMessageType,
  deserializeChatMessage,
  serializeServerMessage,
  ServerMessageType,
}                                                                                     from '../message';
import {UserKeyRegistry}                                                              from '../user-key-registry';
import {ConversationKeyRegistry}                                                      from '../conversation-key-registry';
import {Observable, Subject}                                                          from 'rxjs';

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
  public async connect(hostRsaPub: KeyObject, host: string, port: number = 8087) {
    await (promisify<number, string>(this._socket.connect.bind(this._socket)) as any)(port, host);
    const handshake = new Handshake(this._username, this._socket, this._ecdh, this._rsa, hostRsaPub);
    await handshake._handshakeResult.toPromise();
    this._key = handshake._syncKey;
    this._init();
  }

  /**
   * Terminates the server connection.
   */
  public end() {
    return new Promise<void>(res => {
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
    const signatureLength = data.readInt16BE(0);
    const signature = decryptRsa(data.slice(2, signatureLength + 2), this._rsa.priv);
    const senderNameLength = signature.readInt16BE(0);
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
    const decryptedSerializedChatMessage = decrypt(messageBuffer, await this._keyRegistry.fetchConversationKey(senderName));
    return deserializeChatMessage(decryptedSerializedChatMessage);
  }

  public async negotiateKeyWith(username: string, type: ChatMessageType = ChatMessageType.handshakeInitialization) {
    console.log(`client rsa of ${username}:`, this._rsa.pub.export({type: 'pkcs1', format: 'pem'}));
    const recipientRsaPublicKey = await this._keyRegistry.fetchRsa(username);
    const ecdhSig = createSign('RSA-SHA512')
      .update(this._ecdh.getPublicKey())
      .sign(this._rsa.priv);
    const e = Buffer.concat([this._ecdh.getPublicKey(), ecdhSig]);
    const message: ChatMessage = {
      senderName:  this._username,
      sentAt:      new Date(),
      attachments: [],
      type:        type,
      content:     e,
    };
    const recipient = [{name: username, publicKey: recipientRsaPublicKey}];
    const serverMessage = buildServerMessage(message, this._rsa.priv, Buffer.alloc(0), recipient, ServerMessageType.initialHandshake, x => encryptRsa(x, recipientRsaPublicKey));
    await this._keyRegistry.saveEcdhForHandshake(username, this._ecdh);
    await this.write(serializeServerMessage(serverMessage));
    return message;
  }

  private async _parseInitialHandshake(data: Buffer) {
    const signatureLength = data.readUInt16BE(0);
    const signature = data.slice(2, signatureLength + 2);
    // TODO verify signature
    const encryptedContent = data.slice(signatureLength + 2);
    const decryptedContent = decryptRsa(encryptedContent, this._rsa.priv);
    const message = deserializeChatMessage(decryptedContent);
    const senderRsaPublicKey = await this._keyRegistry.fetchRsa(message.senderName);
    console.log(`fetched rsa of ${message.senderName}:`, senderRsaPublicKey.export({format: 'pem', type: 'pkcs1'}));
    // const keys = decryptRsa(message.content, this._rsa.priv);
    if (message.content.length !== 609) {
      throw new Error('Data length mismatch!');
    }
    const ecdhPub = message.content.slice(0, 97);
    const ecdhPubSig = message.content.slice(97);
    const signatureMatches = createVerify('RSA-SHA512').update(ecdhPub).verify(senderRsaPublicKey, ecdhPubSig);
    if (!signatureMatches) {
      throw new Error('Signature mismatch!');
    }

    const savedEcdhKey = await this._keyRegistry.loadEcdhForHandshake(message.senderName);
    let conversationKey: Buffer;
    if (savedEcdhKey) {
      //! initiator of handshake
      conversationKey = savedEcdhKey.computeSecret(ecdhPub);
      await this._keyRegistry.removeEcdhForHandshake(message.senderName);
    } else {
      //! recipient of handshake
      await this.negotiateKeyWith(message.senderName, ChatMessageType.handshakeReply);
      conversationKey = this._ecdh.computeSecret(ecdhPub);
    }
    await this._keyRegistry.saveConversationKey(message.senderName, conversationKey);
    return message;
  }

  /**
   *
   * @param data
   * @private
   */
  private async _interpretIncomingData(data: Buffer) {
    const messageType: ServerMessageType = data.readInt16BE(0);
    switch (messageType) {
      case ServerMessageType.chatMessage: {
        const message = await this._parseChatMessage(data.slice(2));
        this._onIncomingMessage.next(message);
      }
        break;

      case ServerMessageType.initialHandshake: {
        const message = await this._parseInitialHandshake(data.slice(2));
        this._onIncomingMessage.next(message);
      }
        break;

      default:
        throw new Error('Unknown server message type!');
    }
  }
}
