import {createHash, createHmac} from 'crypto';

/**
 * A shortcut to generate the SHA512 hex representation of the provided username.
 * @param username The username to be hashed.
 */
export function hashUsername(username: string) {
  return createHash('sha512')
    .update(username)
    .digest()
    .toString('hex');
}

/**
 * A shortcut to generate the (HMAC) SHA512 hex representation of the provided username.
 * @param username The username to be hashed.
 */
export function hashUsernameHmac(username: string, hmac: Buffer) {
  return createHmac('sha512', hmac)
    .update(username)
    .digest()
    .toString('hex');
}

/**
 * Determines whether the needle sequence is contained inside the haystack.
 * The needle sequence does not have to be contained as a consecutive sequence!
 * @param needle The search sequence/term.
 * @param haystack The text to be searched.
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

/**
 * Generates the acronym of a name (e.g. John Smith -> JS).
 * @param name The name from which the acronym shall be generated.
 */
export function acronymOfName(name: string) {
  return name.split(' ').map(x => x[0]).join('');
}

/**
 * Queries the length of a webm media Blob.
 * @param b The media Blob to be queried.
 * @returns The length of the Blob media in seconds.
 */
export function webmBlobDuration(b: Blob | string) {
  const vid: HTMLVideoElement = document.createElement('video');
  const duration = new Promise((res, rej) => {
    const listener = () => {
      if (vid.duration === Infinity) {
        vid.currentTime = Number.MAX_SAFE_INTEGER;
        vid.ontimeupdate = () => {
          vid.ontimeupdate = undefined;
          res(vid.duration);
          vid.removeEventListener('loadedmetadata', listener);
        };
      } else {
        res(vid.duration);
        vid.removeEventListener('loadedmetadata', listener);
      }
    };
    vid.addEventListener('loadedmetadata', listener);
  });
  vid.src = typeof b === 'string' ? b : window.URL.createObjectURL(b);
  return duration;
}
