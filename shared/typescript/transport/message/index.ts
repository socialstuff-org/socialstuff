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

import {KeyObject, randomBytes}                                              from 'crypto';
import {decryptAes384, decryptRsa, encryptAes384, encryptRsa}                from '../crypto';
import {deserialize, objectToDeserializationSchema, serialize, uIntToBuffer} from '../serial';

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

export const MessageDeserializationSchema = {
  'sentAt':      {
    'type': 'Date',
  },
  'type':        {
    'type': 'number',
  },
  'content':     {
    'type': 'Buffer',
  },
  'attachments': {
    'type':    {
      'content': {
        'type': 'Buffer',
      },
      'name':    {
        'type': 'string',
      },
    },
    'isArray': true,
  },
};

export const MessageEnvelopDeserializationSchema = {
  'recipients':        {
    'type':    'string',
    'isArray': true,
  },
  'foreignRecipients': {
    'type':    {
      'address':    {
        'type': 'string',
      },
      'recipients': {
        'type': 'Buffer',
      },
    },
    'isArray': true,
  },
  'content':           {
    'type': 'Buffer',
  },
};

interface SerializedMessageContent {
  sentAt: Date;
  type: MessageContentType;
  content: Buffer;
  attachments: MessageAttachment[];
}

export class MessageEnvelop {
  constructor(private _content: Buffer, private _recipients: string[], private _foreignRecipients: { address: string, recipients: Buffer }[] = []) {
  }

  public content() {
    return this._content;
  }

  public recipients() {
    return this._recipients;
  }

  public foreignRecipients() {
    return this._foreignRecipients;
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
      attachments.push({name, content: attachmentContent});
    }
    return new Message(type, senderName, sentAt, [], messageContent, attachments);
  }

  public serialize(): Buffer {
    const serializedEnvelop = {
      recipients:        this._recipients,
      foreignRecipients: this._foreignRecipients,
      content:           this._content,
    };
    console.log('schema', JSON.stringify(objectToDeserializationSchema(serializedEnvelop), undefined, 2));
    return serialize(serializedEnvelop);
  }

  public static deserialize(message: Buffer): MessageEnvelop {
    const {recipients, foreignRecipients, content} = deserialize(MessageEnvelopDeserializationSchema as any, message);
    // recipients
    return new MessageEnvelop(content, recipients, foreignRecipients);
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

  /**
   * Encrypts the message and prepares it for the transmission to the server.
   * @param key 384 bit aes key.
   * @param rsaPublicKeyRecipient
   * @param iv
   */
  public seal(key: Buffer, rsaPublicKeyRecipient: KeyObject, iv: Buffer = randomBytes(32)): MessageEnvelop {
    const s: SerializedMessageContent = {
      sentAt:      this._sentAt,
      type:        this._type,
      content:     this._content,
      attachments: this._attachments,
    };

    const serializedMessage = serialize(s as any);
    const sealedMessage = encryptAes384(serializedMessage, key, {iv});
    const asyncSenderName = encryptRsa(this._sender, rsaPublicKeyRecipient);
    const senderNameLength = uIntToBuffer(asyncSenderName.length);

    const serverDistribution: { address: string, recipients: Buffer }[] = [];
    const [senderUsername, senderServerStr] = this._sender.split('@');
    if (!senderServerStr) {
      throw new Error(`Missing server address in sender name '${this._sender}'!`);
    }
    const [senderHostname, senderPort] = [...senderServerStr.split(':'), '8086'];
    const senderEndpoint = senderHostname + ':' + senderPort;
    const sender = senderUsername + '@' + senderEndpoint;

    const foreignReceivers: { address: string, recipients: Buffer }[] = [];

    const foo: { [key: string]: string[] } = {};
    {
      for (const r of this._recipients) {
        const [username, server] = [...r.toLowerCase().split('@'), 'default-server.com'];
        const [hostname, portStr] = [...server.split(':'), '8086'];
        const port = parseInt(portStr);
        const endpoint = hostname + ':' + port;
        if (!foo[endpoint]) {
          foo[endpoint] = [];
        }
        foo[endpoint].push(username);
      }

      for (const name in foo) {
        if (name === senderEndpoint) {
          continue;
        }
        const recipientBuffers = foo[name].map(x => Buffer.from(x, 'utf-8'));
        const recipients = [];
        for (const b of recipientBuffers) {
          const length = uIntToBuffer(b.length);
          recipients.push(length, b);
        }
        foreignReceivers.push({address: name, recipients: Buffer.concat(recipients)});
      }
    }
    const recipients = foo[senderEndpoint] || [];
    return new MessageEnvelop(
      Buffer.concat([senderNameLength, asyncSenderName, sealedMessage]),
      recipients,
      foreignReceivers,
    );
  }
}
