import {randomBytes} from './security-helper';

/**
 *
 * @param {number} length
 */
export async function generateToken(length = 128) {
  const bytes = await randomBytes(length);
  return Buffer.from(bytes).toString('base64');
}
