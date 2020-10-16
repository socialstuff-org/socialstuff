export interface ChatPartner {
  id: number;
  username: string;
  realName: string;
  acronym: string;
  imageUrl: string;
}

export const createEmptyChatPartner = (): ChatPartner => ({
  id: 0,
  username: '',
  realName: '',
  acronym: '',
  imageUrl: '',
});
