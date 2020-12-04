import DateTimeFormat = Intl.DateTimeFormat;

export interface InviteCode {
  id: number,
  code: string,
  max_usage: number,
  times_used: number,
  expiration_date: string,
  active: boolean

}

export const defaultInviteCode = (): InviteCode => ({
  id: 0,
  code: '',
  max_usage: 0,
  times_used: 0,
  expiration_date: '',
  active: true
});
