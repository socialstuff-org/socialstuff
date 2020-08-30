// This file is part of SocialStuff Identity.
//
// SocialStuff Identity is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// SocialStuff Identity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with SocialStuff Identity.  If not, see <https://www.gnu.org/licenses/>.

import {decrypt, encrypt, hashUnique, passwordIssues, verifyHashUnique} from './security';

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
    test('same data results in different crypt texts', async () => {
      const crypt1 = await encrypt('foobar');
      const crypt2 = await encrypt('foobar');
      expect(crypt1).not.toBe(crypt2);
    });
  });

  describe('decrypt', () => {
    test('properly decrypts encrypted data', async () => {
      const crypt = await encrypt('foobar');
      const d = await decrypt(crypt);
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
});
