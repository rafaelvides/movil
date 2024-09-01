import { IBox } from "@/types/box/box.types";
import { UserLogin } from "@/types/user/user.types";

export interface IUserAndTransmitter {
  box: IBox;
  user: UserLogin;
  token: string;
}
