import { generateToken } from './token-helper';

describe('token-helper', () => {
  describe('generateToken', () => {
    test('Generates a token with standard size of 64 characters', async () => {
      const token = await generateToken();
      expect(token.length == 64);
    });

    test('Generates a token with a given length', async () => {
      const token = await generateToken(20);
      expect(token.length== 20);
    });
  });
});