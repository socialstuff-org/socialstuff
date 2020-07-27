import { generateToken } from './token-helper';

describe('token-helper', () => {
  describe('generateToken', () => {
    test('Generating a token without passing a custom length should result in a token with a length of 64.', async () => {
      const token = await generateToken();
      expect(token.length == 64);
    });

    test('Generating a token with passing a custom length should result in a token with a length of that length.', async () => {
      const token = await generateToken(20);
      expect(token.length == 20);
    });
  });
});