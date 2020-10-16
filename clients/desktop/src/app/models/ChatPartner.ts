export interface ChatPartner {
  id: number;
  username: string;
  customName: string;
  imageUrl: string;
}

export const createEmptyChatPartner = (): ChatPartner => ({
  id: 0,
  username: '',
  customName: '',
  imageUrl: '',
});
