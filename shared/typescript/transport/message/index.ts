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

import {KeyObject, randomBytes}                               from 'crypto';
import {decryptAes384, decryptRsa, encryptAes384, encryptRsa} from '../crypto';

export enum MessageContentType {
  textMessage,
  voiceMessage,
  initialHandshake,
  groupHandshake
}

export interface MessageAttachment {
  name: string;
  content: Buffer;
}

export class MessageEnvelop {
  constructor(private _recipients: string[], private _content: Buffer) {
  }

  public content() {
    return this._content;
  }

  public recipients() {
    return this._recipients;
  }

  public open(recipientRsaPrivateKey: KeyObject, conversationKeys: { [username: string]: Buffer }): Message {
    let content = this._content.slice();
    const senderNameLength = content.readUInt16BE();
    content = content.slice(2);
    const senderNameBytes = content.slice(0, senderNameLength);
    content = content.slice(senderNameLength);
    const senderName = decryptRsa(senderNameBytes, recipientRsaPrivateKey).toString('utf8');
    const key = conversationKeys[senderName];
    if (!key) {
      throw new Error(`Could not find conversation key for sender ${senderName}!`);
    }
    content = decryptAes384(content, key);
    const sentAt = new Date(content.slice(0, 24).toString('utf8'));
    content = content.slice(24);
    const type: MessageContentType = content.readUInt8();
    content = content.slice(1);
    const messageContentLength = content.readUInt32BE();
    content = content.slice(4);
    const messageContent = content.slice(0, messageContentLength);
    content = content.slice(messageContentLength);
    const attachments: MessageAttachment[] = [];
    while (content.length && content.readUInt32BE() !== 0) {
      const size = content.readInt32BE();
      content = content.slice(4);
      const attachmentContent = content.slice(0, size);
      content = content.slice(size);
      const nameLength = content.readUInt16BE();
      content = content.slice(2);
      const name = content.slice(0, nameLength).toString('utf8');
      content = content.slice(nameLength);
      attachments.push({ name, content: attachmentContent });
    }
    return new Message(type, senderName, sentAt, [], messageContent, attachments);
  }

  public serialize(): Buffer {
    const parts: Buffer[] = [];
    for (const recipient of this._recipients.map(x => Buffer.from(x, 'utf-8'))) {
      const length = Buffer.alloc(1);
      length.writeUInt8(recipient.length);
      parts.push(length, recipient);
    }
    const divider = Buffer.alloc(2);
    divider.writeUInt16BE(0);
    parts.push(divider, this._content);
    return Buffer.concat(parts);
  }

  public static deserialize(message: Buffer): MessageEnvelop {
    const recipients: string[] = [];
    let i = 0;
    do {
      const length = message.readUInt8(i);
      const name = message.slice(i + 1, i + 1 + length).toString('utf8');
      recipients.push(name);
      i += length + 1;
    } while(message.readUInt16BE(i) !== 0);
    return new MessageEnvelop(recipients, message.slice(i + 2));
  }
}

export class Message {
  constructor(
    private _type: MessageContentType,
    private _sender: string,
    private _sentAt: Date,
    private _recipients: string[],
    private _content: Buffer,
    private _attachments: MessageAttachment[] = [],
  ) {
  }

  public sender() {
    return this._sender;
  }

  public attachments() {
    return this._attachments;
  }

  public type() {
    return this._type;
  }

  public recipients() {
    return this._recipients;
  }

  public content() {
    return this._content;
  }

  public sentAt() {
    return this._sentAt;
  }

  public seal(key: Buffer, rsaPublicKeyRecipient: KeyObject, iv: Buffer = randomBytes(32)): MessageEnvelop {
    const bufferParts: Buffer[] = [
      Buffer.from(this._sentAt.toISOString()),
      Buffer.from([this._type])
    ];
    {
      const contentLength = Buffer.alloc(4, 0);
      contentLength.writeUInt32BE(this._content.length);
      bufferParts.push(contentLength, this._content);
    }

    for (const attachment of this._attachments) {
      const fileSize = Buffer.alloc(4, 0);
      fileSize.writeUInt32BE(attachment.content.length);
      const name = Buffer.from(attachment.name, 'utf8');
      const nameLength = Buffer.alloc(2, 0);
      nameLength.writeUInt16BE(name.length);
      bufferParts.push(fileSize, attachment.content, nameLength, name);
    }
    bufferParts.push(Buffer.alloc(4, 0));
    const serializedMessage = Buffer.concat(bufferParts);
    const sealedMessage = encryptAes384(serializedMessage, key, {iv});
    const asyncSenderName = encryptRsa(this._sender, rsaPublicKeyRecipient);
    const senderNameLength = Buffer.alloc(2);
    senderNameLength.writeUInt16BE(asyncSenderName.length);

    return new MessageEnvelop(this._recipients, Buffer.concat([senderNameLength, asyncSenderName, sealedMessage]));
  }
}
