export default {

  /**
   * This function is for generating a random string containing numbers and upper-case letters. The size is determined by the input parameter.
   * @param length of the generated string
   * @return string of chosen size containing numbers and upper-case letters.
   */

  generateRandomCode(length: number): string {
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
};
