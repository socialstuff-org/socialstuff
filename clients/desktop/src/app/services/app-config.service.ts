import {IDBPDatabase, openDB} from 'idb';
import {Injectable}           from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private db: IDBPDatabase;

  constructor() {

  }

  public async boot() {
    const db = await openDB('socialstuff');
    const store = db.createObjectStore('config', { autoIncrement: true });

  }
}
