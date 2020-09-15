export interface Message {
  id: number;
  message: string;
  time: string;
  sent: boolean;
  delivered: boolean;
  seen: boolean;
  isSender: boolean;
}

export const createEmptyMessage = (): Message => ({
  id: null,
  message: '',
  time: '',
  sent: false,
  delivered: false,
  seen: false,
  isSender: false,
});
