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

import {randomBytes}   from 'crypto';
import {encryptAes384} from '../crypto';

export enum MessageType {
  textMessage,
  voiceMessage,
  initialHandshake,
  groupHandshake
}

export enum MessageElementType {
  text,
  memo,
  file,
  recipient
}

export interface MessageAttachment {
  name: string,
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

  public open(key: Buffer): Message {
    return null as any;
  }

  public serialize(): Buffer {
    const parts: Buffer[] = [];
    for (const recipient of this._recipients.map(x => Buffer.from(x, 'utf-8'))) {
      const length = Buffer.alloc(1, 0);
      length.writeInt8(recipient.length);

    }

    return Buffer.concat(parts);
  }

  public static deserialize(message: Buffer): MessageEnvelop {
    return null as any;
  }
}

export class Message {
  constructor(
    private _type: MessageType,
    private _sender: string,
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

  public seal(key: Buffer, iv: Buffer = randomBytes(32)): MessageEnvelop {
    const bufferParts: Buffer[] = [];
    {
      const t = Buffer.alloc(1, 0);
      t.writeInt8(this._type.valueOf());
      bufferParts.push(t);
    }
    {
      const contentLength = Buffer.alloc(4, 0);
      contentLength.writeInt32BE(this._content.length);
      bufferParts.push(contentLength, this._content);
    }
    for (const attachment of this._attachments) {
      const t = Buffer.alloc(1, 0);
      t.writeInt32BE(MessageElementType.file);
      const fileSize = Buffer.alloc(4, 0);
      fileSize.writeInt32BE(attachment.content.length);
      bufferParts.push(t, fileSize, attachment.content);
    }
    bufferParts.push(Buffer.alloc(4, 0));
    const serializedMessage = Buffer.concat(bufferParts);
    const sealedMessage = encryptAes384(serializedMessage, key, {iv});
    return new MessageEnvelop(this._recipients, sealedMessage);
  }
}
