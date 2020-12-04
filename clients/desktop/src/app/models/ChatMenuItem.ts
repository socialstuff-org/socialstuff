import {Contact} from './Contact';

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

export function fromContact(c: Contact): ChatMenuItem {
  return {
    id: 0,
    username: c.username,
    realName: c.displayName,
    acronym: '',
  };
}
