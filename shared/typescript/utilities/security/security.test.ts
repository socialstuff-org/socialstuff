// This file is part of SocialStuff.
//
// SocialStuff is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// SocialStuff is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with SocialStuff.  If not, see <https://www.gnu.org/licenses/>.

import crypto, {KeyObject} from 'crypto';
import {
  decrypt,
  encrypt,
  generateRsaKeyPair,
  hashHmac,
  hashUnique,
  openEnvelop,
  passwordIssues,
  verifyHashUnique,
  wrapEnvelop,
}                          from '.';

describe('security-helper', () => {
  describe('hashUnique', () => {
    test('hashing the same value results in different hashes', async () => {
      const hash1 = await hashUnique('foobar');
      const hash2 = await hashUnique('foobar');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyHashUnique', () => {
    test('properly verifies a unique hash', async () => {
      const hash = await hashUnique('foobar');
      const hashVerified = await verifyHashUnique(hash, 'foobar');
      expect(hashVerified).toBe(true);
    });
  });

  describe('encrypt', () => {
    test('same data results in different crypt texts', () => {
      const crypt1 = encrypt('foobar');
      const crypt2 = encrypt('foobar');
      expect(crypt1).not.toBe(crypt2);
    });
  });

  describe('decrypt', () => {
    test('properly decrypts encrypted data', () => {
      const crypt = encrypt('foobar');
      const d = decrypt(crypt).toString('utf8');
      expect(d).toBe('foobar');
    });
  });

  describe('passwordIssues', () => {
    test('worksWithGoodPasswords', () => {
      expect(passwordIssues('Hello123!$')).toEqual({});
    });

    test('complains about short passwords', () => {
      const issues = passwordIssues('Hello123!');
      expect(Object.keys(issues)).toEqual(['length']);
    });

    test('complains about long passwords', () => {
      const issues = passwordIssues('Hello123!$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
      expect(Object.keys(issues)).toEqual(['length']);
    });

    test('complains about missing uppercase', () => {
      const issues = passwordIssues('33ello123!');
      expect(Object.keys(issues)).toEqual(['upper']);
    });

    test('complains about missing lowercase', () => {
      const issues = passwordIssues('HHHHHHHHHH123!');
      expect(Object.keys(issues)).toEqual(['lower']);
    });

    test('complains about missing number', () => {
      const issues = passwordIssues('HHHHHHHHHHa!');
      expect(Object.keys(issues)).toEqual(['number']);
    });

    test('complains about missing special', () => {
      const issues = passwordIssues('HHHHHHHHHHa12');
      expect(Object.keys(issues)).toEqual(['special']);
    });
  });

  describe('hashHmac', () => {
    test('the same value results in the same hash', async () => {
      const value = 'Hello, World!';
      const hash1 = hashHmac(value);
      const hash2 = hashHmac(value);
      expect(hash1).not.toBeNull();
      expect(hash1).not.toBeUndefined();
      expect(typeof hash1).toBe('string');
      expect(hash1).toBe(hash2);
    });
  });

  describe('key exchange', () => {
    const aliceEcdh = crypto.createECDH('prime256v1');
    const bobEcdh = crypto.createECDH('prime256v1');
    aliceEcdh.generateKeys();
    bobEcdh.generateKeys();
    let aliceRsa: { pub: KeyObject, priv: KeyObject };
    let bobRsa: { pub: KeyObject, priv: KeyObject };

    beforeAll(async () => {
      aliceRsa = await generateRsaKeyPair(1024);
      bobRsa = await generateRsaKeyPair(1024);
    });

    test('ecdh key gets properly packed and unpacked', () => {
      const envelop = wrapEnvelop('alice', aliceEcdh.getPublicKey(), aliceRsa.priv, bobRsa.pub);
      const unwrapped = openEnvelop(envelop, aliceRsa.pub, bobRsa.priv);
      expect(unwrapped.ecdh).toEqual(aliceEcdh.getPublicKey().toString('base64'));
    });

    test('throws if wrong private key is provided while unwrapping', async () => {
      expect(() => {
        const envelop = wrapEnvelop('alice', aliceEcdh.getPublicKey(), aliceRsa.priv, bobRsa.pub);
        openEnvelop(envelop, aliceRsa.pub, aliceRsa.priv);
      }).toThrow('Sender verification failed!');
    });
  });
});
