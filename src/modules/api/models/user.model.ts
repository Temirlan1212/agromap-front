export interface IUser {
  user_id: number;
  token: string;
  username: string;
  password: string;
  is_superuser: boolean;
  is_active: boolean;
}

export interface IProfile {
  full_name: string;
  phone_number: string;
}

export interface IPassword {
  old_password: string;
  password: string;
  password_confirm: string;
}
