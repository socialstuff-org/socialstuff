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

import {createSign, createVerify, KeyObject, sign} from 'crypto';
import {decryptRsa, encrypt, encryptRsa}           from '../crypto';
import { prefix } from '../log';

const log = prefix('@trale/transport/message');

export enum ChatMessageType {
  text,
  voice,
  handshakeInitialization,
  handshakeReply,
}

export interface MessageAttachment {
  name: string;
  content: Buffer;
}

export interface ChatMessage {
  type: ChatMessageType;
  senderName: string;
  groupId?: string;
  content: Buffer;
  attachments: MessageAttachment[];
  sentAt: Date;
}

export enum ServerMessageType {
  chatMessage,
  initialHandshake
}

export function serializeChatMessage(message: ChatMessage): Buffer {
  return Buffer.from(JSON.stringify(message), 'utf-8');
}

export function serializeServerMessage(message: ServerMessage): Buffer {
  return Buffer.from(JSON.stringify(message), 'utf-8');
}

export function deserializeChatMessage(serialized: Buffer): ChatMessage {
  const foo: any = JSON.parse(serialized.toString('utf-8'));
  foo.content = Buffer.from(foo.content.data);
  foo.sentAt = new Date(foo.sentAt);
  foo.attachments = foo.attachments.map((x: any) => ({...x, content: Buffer.from(x.content.data)}));
  return foo;
}

export function deserializeServerMessage(serialized: Buffer): ServerMessage {
  const foo: any = JSON.parse(serialized.toString('utf-8'));
  for (const name in foo.recipients) {
    foo.recipients[name] = foo.recipients[name].map((x: { data: number[] }) => Buffer.from(x.data));
  }
  // console.log(foo);
  for (const name in foo.localRecipients) {
    foo.localRecipients[name] = Buffer.from(foo.localRecipients[name].data);
  }
  foo.content = Buffer.from(foo.content.data);
  return foo;
}

export interface ServerMessage {
  type: ServerMessageType;
  content: Buffer;
  recipients: { [server: string]: Buffer };
  localRecipients: { [name: string]: Buffer }
}

function arrayUnique<T>(accu: T[], current: T) {
  if (!accu.includes(current)) {
    accu.push(current);
  }
  return accu;
}

export function buildServerMessage(
  message: ChatMessage,
  senderPrivateKey: KeyObject,
  key: Buffer,
  recipients: { name: string, publicKey: KeyObject }[],
  messageType: ServerMessageType = ServerMessageType.chatMessage,
  _encrypt: (data: Buffer, key: Buffer) => Buffer = encrypt,
): ServerMessage {
  // TODO encode participants
  const senderServer = '@' + message.senderName.split('@')[1];
  const localRecipients: { [name: string]: Buffer } = {};
  const remoteRecipients: { [server: string]: Buffer } = {};
  for (const r of recipients) {
    if (r.name.endsWith(senderServer)) {
      localRecipients[r.name] =
        makeSenderNameSignature(message.senderName, senderPrivateKey, r.publicKey);
    } else {
      // TODO populate remoteRecipients
    }
  }
  const serverMessage = {
    type:       messageType,
    content:    _encrypt(serializeChatMessage(message), key),
    recipients: remoteRecipients,
    localRecipients,
  };
  log('built following server message:', serverMessage);
  log('the message was built from the following parameters:', arguments);
  return serverMessage;
}

export function makeSenderNameSignature(senderName: string, senderPrivateKey: KeyObject, recipientPublicKey: KeyObject) {
  const senderNameLength = Buffer.alloc(2, 0);
  const senderNameBytes = Buffer.from(senderName, 'utf-8');
  senderNameLength.writeInt16BE(senderNameBytes.length, 0);
  const signer = createSign('RSA-SHA512');
  signer.update(senderNameBytes);
  const senderNameSignature = signer.sign(senderPrivateKey);
  const data = Buffer.concat([senderNameLength, senderNameBytes, senderNameSignature]);
  return encryptRsa(data, recipientPublicKey);
}

export function verifySenderNameSignature(signature: Buffer, senderPublicKey: KeyObject, recipientPrivateKey: KeyObject) {
  const data = decryptRsa(signature, recipientPrivateKey);
  const senderNameLength = data.readInt16BE(0);
  const senderName = data.slice(2, 2 + senderNameLength);
  const senderNameSignature = data.slice(2 + senderNameLength);
  const verifier = createVerify('RSA-SHA512');
  verifier.update(senderName);
  return verifier.verify(senderPublicKey, senderNameSignature) && senderName;
}
