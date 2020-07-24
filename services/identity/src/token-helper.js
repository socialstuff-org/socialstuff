import {randomBytes} from './security-helper';

/**
 *
 * @param {number} length
 */
export async function generateToken(length = 64) {
  /**  @type {Buffer} */
  const bytes = await randomBytes(length);
  return Buffer.from(bytes).toString('base64');
}