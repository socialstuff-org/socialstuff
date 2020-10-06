import {Socket, SocketConnectOpts, SocketConstructorOpts} from 'net';
import {fromEvent, Observable}                   from 'rxjs';

export class RxSocket {
  private readonly _socket: Socket;

  constructor(options?: SocketConstructorOpts) {
    this._socket = new Socket(options);
  }

  public write(data: Buffer) {
    return new Promise((res, rej) => {
      this._socket.write(data, e => {
        if (e) {
          rej(e);
        } else {
          res();
        }
      });
    })
  }

  public on(event: 'data'): Observable<Buffer>;
  public on(event: 'close'): Observable<boolean>;
  public on(event: 'connect'): Observable<void>;
  public on(event: 'drain'): Observable<void>;
  public on(event: 'end'): Observable<void>;
  public on(event: 'error'): Observable<Error>;
  public on(event: 'timeout'): Observable<void>;
  public on(event: string) {
    return fromEvent(this._socket, event);
  }

  public once(event: 'data'): Observable<Buffer>;
  public once(event: 'close'): Observable<boolean>;
  public once(event: 'connect'): Observable<void>;
  public once(event: 'drain'): Observable<void>;
  public once(event: 'end'): Observable<void>;
  public once(event: 'error'): Observable<Error>;
  public once(event: 'timeout'): Observable<void>;
  public once(event: string) {
    return new Observable(x => {
      this._socket.once(event, payload => {
        x.next(payload);
        x.complete();
      });
    });
  }

  public connect(options: SocketConnectOpts) {
    return new Promise((res, rej) => {
      this._socket.on('error', rej);
      this._socket.connect(options, () => {
        this._socket.removeListener('error', rej);
        res();
      });
    });
  }

  public end() {
    return new Promise(res => {
      this._socket.end(res);
    });
  }
}
