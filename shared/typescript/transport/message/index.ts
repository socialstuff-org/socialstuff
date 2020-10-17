import {randomBytes}      from 'crypto';
import {CommonTitpClient} from '../client/common';

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
    private _recipients: string[],
    private _content: Buffer,
    private _attachments: MessageAttachment[] = [],
  ) { }

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
      const fileSize = Buffer.alloc(4 ,0);
      fileSize.writeInt32BE(attachment.content.length);
      bufferParts.push(t, fileSize, attachment.content);
    }
    bufferParts.push(Buffer.alloc(4, 0));
    const serializedMessage = Buffer.concat(bufferParts);
    const sealedMessage = CommonTitpClient.encrypt(serializedMessage, key, { iv });
    return new MessageEnvelop(this._recipients, sealedMessage);
  }
}
