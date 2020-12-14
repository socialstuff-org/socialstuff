/**
 * Chat properties interface. Used for storing all chat related data fields in a chat.properties file.
 */
export interface ChatProperties {
  rsaPublicKey: string;
  conversationKey: string;
  customDisplayName?: string;
  username: string;
}
