import {Socket}                                       from 'net';
import {BinaryLike, createCipheriv, createDecipheriv} from 'crypto';
import {makeWriteP}                                   from '../socket';
import {Observable, Subject}                          from 'rxjs';


export class TitpClientConnection {
  private _socket: Socket;
  private _username: string;
  private readonly _write: (data: (Uint8Array | string)) => Promise<void>;
  private readonly _key: Buffer;
  private readonly _data: Subject<Buffer> = new Subject<Buffer>();
  private _dataBuffer = Buffer.alloc(0);

  constructor(socket: Socket, username: string, key: Buffer) {
    this._socket = socket;
    this._username = username;
    this._write = makeWriteP(socket);
    this._key = key;
    this._socket.on('data', data => {
      this._dataBuffer = Buffer.concat([this._dataBuffer, data]);
      if (socket.bufferSize) {
        return;
      }
      const decipher = createDecipheriv('aes-256-cbc', this._key.slice(0, 32), this._key.slice(32));
      const result = Buffer.concat([decipher.update(this._dataBuffer), decipher.final()]);
      this._data.next(result);
    });
  }

  public data(): Observable<Buffer> {
    return this._data;
  }

  public username() {
    return this._username;
  }

  public write(data: BinaryLike) {
    const cipher = createCipheriv('aes-256-cbc', this._key.slice(0, 32), this._key.slice(32));
    const enc = Buffer.concat([cipher.update(data), cipher.final()]);
    return this._write(enc);
  }
}
