export interface IUser {
  user_id: number;
  token: string;
  username: string;
  password: string;
  is_superuser: boolean;
  is_active: boolean;
}
