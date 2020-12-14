/**
 * Message interface for Trale communication
 */
export interface Message {
  id: number;
  message: string;
  time: string;
  sent: boolean;
  delivered: boolean;
  seen: boolean;
  isSender: boolean;
}

/**
 * Function declaration returns an object of type message with empty default values
 */
export const createEmptyMessage = (): Message => ({
  id: null,
  message: '',
  time: '',
  sent: false,
  delivered: false,
  seen: false,
  isSender: false,
});
