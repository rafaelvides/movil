import { ILoginPayload } from "@/types/auth/auth.types";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { returnAddress } from "./templates/template_fe";

export const save_login_data_biometric = async (
  key: string,
  value: ILoginPayload
) => {
  await SecureStore.setItemAsync(key, JSON.stringify(value));
};
export const get_data_biometric = async (key: string) => {
  let data = await SecureStore.getItemAsync("authBiometric");
  if (data) {
    const date = data as unknown as ILoginPayload;
    return JSON.parse(data) as ILoginPayload;
  } else {
    return undefined;
  }
};
export const save_toke = async (token: string) => {
  await SecureStore.setItem("token", token);
};
export const return_token = async () => {
  const token = await SecureStore.getItem("token");
  if (token) {
    return token;
  }
};
export const save_token_mh = async (token: string) => {
  console.log("token a guardar", token);
  await SecureStore.setItem("token_mh", token)
};
export const return_token_mh = async () => {
  let toke_mh = await SecureStore.getItemAsync("token_mh");
  if (toke_mh) {
    return toke_mh;
  }
};
export const save_swith_biometric = (biometric: boolean) => {
  if (biometric) {
    SecureStore.setItemAsync("switchBiometric", "0");
  } else {
    SecureStore.setItemAsync("switchBiometric", "1");
  }
};
export const return_switch_biometric = async () => {
  const biometric = await SecureStore.getItemAsync("switchBiometric");
  if (biometric) {
    return Number(biometric) === 1;
  }
  return false;
};
export const handle_save_location = async (location: boolean) => {
  if (location) {
    await SecureStore.setItemAsync("location", "0");
  } else {
    await SecureStore.setItemAsync("location", "1");
  }
};
export const return_location = async () => {
  const location = await SecureStore.getItemAsync("location");
  if (location) {
    return Number(location) === 1;
  }
  return false;
};
//------------------token------------------------------
export const is_expired_token = (token: string) => {
  const decoded = jwtDecode(token);
  if (decoded && decoded.exp) {
    return Date.now() >= decoded.exp * 1000;
  }
  return true;
};
export const is_auth = async () => {
  const token = await return_token();
  return token && !is_expired_token(token);
};
//-----------------------------------------------------
export const delete_secure = () => {
  SecureStore.deleteItemAsync("token");
  SecureStore.deleteItemAsync("token_mh");
};
