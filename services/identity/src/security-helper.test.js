import {hashUnique, verifyHashUnique} from './security-helper';

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
});
