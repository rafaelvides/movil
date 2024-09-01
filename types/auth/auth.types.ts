import { IBox } from "../box/box.types";
import { IUser, UserLogin } from "../user/user.types";
export interface IMaeLogin {
  ok: boolean;
  token: string;
  user: IUser;
  box: IBox | null,
  status: number;
}
export interface ILoginPayload {
  userName: string;
  password: string;
}
export interface IAuthResponse {
  ok: boolean;
  token: string;
  box: IBox;
  user: UserLogin;
  status: number;
}
