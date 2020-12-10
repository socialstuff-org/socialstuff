import {createHash, createHmac} from 'crypto';


export function hashUsername(username: string) {
  return createHash('sha512')
    .update(username)
    .digest()
    .toString('hex');
}

export function hashUsernameHmac(username: string, hmac: Buffer) {
  return createHmac('sha512', hmac)
    .update(username)
    .digest()
    .toString('hex');
}

/**
 * Determines whether the needle sequence is contained inside the haystack.
 * The needle sequence does not have to be contained as a consecutive sequence!
 * @param needle
 * @param haystack
 */
export function searchMatch(needle: string, haystack: string) {
  if (needle.length > haystack.length) {
    return false;
  } else if (needle.length === haystack.length) {
    return needle === haystack;
  } else {
    let needleIndex = 0;
    for (const c of haystack) {
      if (c === needle[needleIndex]) {
        ++needleIndex;
      }
      if (needleIndex === needle.length) {
        return true;
      }
    }
    return false;
  }
}

export function acronymOfName(name: string) {
  return name.split(' ').map(x => x[0]).join('');
}
