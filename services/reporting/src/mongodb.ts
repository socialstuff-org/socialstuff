import {NextFunction, Request, Response} from 'express';
import {MongoClient}                     from 'mongodb';

export function createConnection() {
  const mongoUri = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`;
  const client = new MongoClient(mongoUri, {
    useUnifiedTopology: true
  });
  return client.connect();
}

let _sharedConnection: Promise<MongoClient> | undefined;

export function sharedConnection() {
  if (!_sharedConnection) {
    _sharedConnection = createConnection();
  }
  return _sharedConnection;
}

export async function injectConnectionIntoRequest(req: Request, _: Response, next: NextFunction) {
  (req as any).mongo = await sharedConnection();
  next();
}
