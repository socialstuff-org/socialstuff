export interface SecuritySettings {
  two_factor_auth: {
    on: boolean,
    phone: boolean,
    email: boolean
  },
  confirmed_emails_only: boolean,
  individual_pwd_req: {
    on: boolean,
    upper_case: boolean,
    number: boolean,
    special_char: boolean,
    reg_ex: boolean,
    reg_ex_string: string
  },
  inv_only: {
    on: boolean,
    inv_only_by_admin: boolean
  }
}

export const defaultSettings = (): SecuritySettings => ({
  two_factor_auth: {
    on: false,
    phone: false,
    email: false
  },
  confirmed_emails_only: false,
  individual_pwd_req: {
    on: false,
    upper_case: false,
    number: false,
    special_char: false,
    reg_ex: false,
    reg_ex_string: '[]'
  },
  inv_only: {
    on: false,
    inv_only_by_admin: false
  }
});
