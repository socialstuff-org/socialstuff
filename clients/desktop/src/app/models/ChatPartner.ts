/**
 * Chat partner interface.
 */
export interface ChatPartner {
  id: number;
  username: string;
  realName: string;
  acronym: string;
  imageUrl: string;
}

/**
 * Function declaration returns an object of type ChatPartner with empty default values
 */
export const createEmptyChatPartner = (): ChatPartner => ({
  id: 0,
  username: '',
  realName: '',
  acronym: '',
  imageUrl: '',
});
