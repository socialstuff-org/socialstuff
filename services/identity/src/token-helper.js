import {encodeStringToBase64, randomBytes} from './security-helper';

/**
 *
 * @param {number} length
 */
export async function generateToken(length = 64) {
  /**  @type {Buffer} */
  const bytes = await randomBytes(length);
  return encodeStringToBase64(bytes);
}