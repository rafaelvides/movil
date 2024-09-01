import { IBox } from "../box/box.types";
import { UserLogin } from "../user/user.types";
import { IAuthResponse, ILoginPayload } from "./auth.types";

export interface IAuthStore {
  token: string;
  is_authenticated: boolean;
  is_authenticated_offline: boolean;
  user: UserLogin;
  box: IBox;
  OnMakeLogin: (payload: ILoginPayload) => Promise<boolean>;
  OnMakeLoginOffline: (payload: ILoginPayload) => Promise<boolean>;
  OnMakeLogout: () => Promise<boolean>;
  OnLoginMH: (id: number, token: string) => Promise<void>;
  OnSetInfo: () => Promise<boolean>;
  OnSaveUserLocal: (Auth: IAuthResponse, token: string, password: string) => Promise<void>;
  GetConfigurationByTransmitter: (id: number) => void
}
