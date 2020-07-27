import {decrypt2, encrypt, hashUnique, passwordIssues, verifyHashUnique} from './security-helper';

describe('security-helper', () => {
  describe('hashUnique', () => {
    test('Hashing the same value should result in different hashes.', async () => {
      const hash1 = await hashUnique('foobar');
      const hash2 = await hashUnique('foobar');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyHashUnique', () => {
    test('The given data should result in a correct verification of a unique hash.', async () => {
      const hash = await hashUnique('foobar');
      const hashVerified = await verifyHashUnique(hash, 'foobar');
      expect(hashVerified).toBe(true);
    });
  });

  describe('encrypt', () => {
    test('The same input should result in different outputs.', async () => {
      const crypt1 = await encrypt('foobar');
      const crypt2 = await encrypt('foobar');
      expect(crypt1).not.toBe(crypt2);
    });
  });

  describe('decrypt2', () => {
    test('The encrypted data should result in correctly decrypted data.', async () => {
      const crypt = await encrypt('foobar');
      const decrypt = await decrypt2(crypt);
      expect(decrypt).toBe('foobar');
    });
  });

  describe('passwordIssues', () => {
    test('An input that meets all requirements should result in an empty output.', () => {
      expect(passwordIssues('Hello123!$')).toEqual({});
    });

    test('An input that is too short should result in complaining about the length.', () => {
      const issues = passwordIssues('Hello123!');
      expect(Object.keys(issues)).toEqual(['short']);
    });

    test('An input that is too long should result in complaining about the length.', () => {
      const issues = passwordIssues('Hello123!$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
      expect(Object.keys(issues)).toEqual(['long']);
    });

    test('An input that misses an uppercase character should result in complaining about a missing uppercase character.', () => {
      const issues = passwordIssues('33ello123!');
      expect(Object.keys(issues)).toEqual(['upper']);
    });

    test('An input that misses a lowercase character should result in complaining about a missing lowercase character.', () => {
      const issues = passwordIssues('HHHHHHHHHH123!');
      expect(Object.keys(issues)).toEqual(['lower']);
    });

    test('An input that misses a numeric character should result in complaining about a missing numeric character.', () => {
      const issues = passwordIssues('HHHHHHHHHHa!');
      expect(Object.keys(issues)).toEqual(['numeric']);
    });

    test('An input that misses a special character should result in complaining about a missing special character.', () => {
      const issues = passwordIssues('HHHHHHHHHHa12');
      expect(Object.keys(issues)).toEqual(['special']);
    });
  });
});