import {decrypt, encrypt, hashUnique, passwordIssues, verifyHashUnique} from './security-helper';

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
