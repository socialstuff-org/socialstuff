export interface ChatMenuItem {
  id: number;
  username: string;
  realName: string;
  acronym: string;
}

export const createEmptyChatMenuItem = (): ChatMenuItem => ({
  id: null,
  username: '',
  realName: '',
  acronym: '',
});
