/**
 * Chat properties interface. Used for storing all chat related data fields in a chat.properties file.
 */
export interface ChatProperties {
  /**
   * A textual representation of the RSA public key of a contact.
   */
  rsaPublicKey: string;
  /**
   * The base64 textual representation of the synchronous conversation key.
   */
  conversationKey: string;
  /**
   * The custom display name of a user which shall be used instead of the username.
   */
  customDisplayName?: string;
  /**
   * A contact's user handle (e.g. username@server.com).
   */
  username: string;
}
