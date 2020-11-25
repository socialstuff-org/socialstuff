import {createHash} from 'crypto';


export function hashUsername(username: string) {
  return createHash('sha512')
    .update(username)
    .digest()
    .toString('hex');
}
