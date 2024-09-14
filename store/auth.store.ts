import { create } from "zustand";
import { IAuthStore } from "../types/auth/auth_store.types";
import { UserLogin } from "@/types/user/user.types";
import { make_login } from "../services/auth.service";
import { AxiosError } from "axios";
import { ToastAndroid } from "react-native";
import {
  save_login_data_biometric,
  // save_toke,
  delete_secure,
  save_token_mh,
  // return_token,
} from "@/plugins/secure_store";
import {
  box_data,
  get_box_data,
  get_configuration,
  get_user,
  save_branch_id,
  save_configuration,
  save_point_sale_Id,
  save_user,
  save_token,
  return_token,
  remove_token,
  is_auth,
} from "@/plugins/async_storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { get_transmitter } from "@/services/transmitter.service";
import { login_mh } from "@/services/ministry_of_finance.service";
import { ILoginMHFailed } from "@/types/svf_dte/responseMH/responseMH.types";
import { IBox } from "@/types/box/box.types";
import {
  login_offline,
  saveUserAndTransmitter,
} from "@/offline/service/users_and_transmitter.service";
import { router } from "expo-router";
import { get_by_transmitter } from "@/services/personalization.service";
import { IConfiguration } from "@/types/configuration/configuration.types";
import * as SecureStore from "expo-secure-store";

export const useAuthStore = create<IAuthStore>((set, get) => ({
  user: {} as UserLogin,
  token: "",
  is_authenticated: false,
  is_authenticated_offline: false,
  box: {} as IBox,
  personalization: {} as IConfiguration,
  OnMakeLogin: async (payload) => {
    return await make_login(payload)
      .then(async ({ data }) => {
        if (data.ok) {
          await get().OnLoginMH(data.user.transmitterId, data.token);
          save_token(data.token);
          await save_user(data.user);
          get().GetConfigurationByTransmitter(data.user.transmitterId);
          await save_point_sale_Id(String(data.user.pointOfSaleId));
          if (data.box) {
            box_data(data.box);
          }
          save_login_data_biometric("authBiometric", {
            userName: payload.userName,
            password: payload.password,
          });
          if (data.user) {
            set({
              user: data.user,
              token: data.token,
              box: data.box,
              is_authenticated: true,
            });
          }
          await get()
            .OnSaveUserLocal(data, data.token, payload.password)
            .catch(() => {
              ToastAndroid.show(
                "Ocurrió un error al registrar",
                ToastAndroid.LONG
              );
            });
          await save_branch_id(String(data.user.branchId));
          console.log("auth 11");
        }
        router.navigate("/validationBox")
        return true;
      })
      .catch(() => {
        ToastAndroid.show(
          "Usuario o contraseña incorrectos",
          ToastAndroid.SHORT
        );
        return false;
      });
  },
  async OnLoginMH(id, token) {
    get_transmitter(id, token)
      .then(({ data }) => {
        login_mh(data.transmitter.nit, data.transmitter.claveApi)
          .then(async (login_mh) => {
            console.log("MH", login_mh.data.body.token)
            if (login_mh.data.status === "OK") {
              await save_token_mh(login_mh.data.body.token).catch((er) => {});
            } else {
              const data = login_mh as unknown as ILoginMHFailed;
              ToastAndroid.show(
                `Error: ${data.body.descripcionMsg}`,
                ToastAndroid.SHORT
              );
              return;
            }
          })
          .catch((error: AxiosError<ILoginMHFailed>) => {
            ToastAndroid.show(
              `Error ${error.response?.data.body.descripcionMsg}`,
              ToastAndroid.SHORT
            );
            return;
          });
      })
      .catch((error) => {
        ToastAndroid.show(`Aun no tienes datos asignados`, ToastAndroid.SHORT);
        return;
      });
  },
  OnMakeLogout: async () => {
    set({
      token: "",
      is_authenticated: false,
    });
    AsyncStorage.clear();
    await remove_token();
    //  SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("token_mh");
    return true;
  },
  OnSetInfo: async () => {
    const token = await return_token();
    const auth = await is_auth();
    const user = await get_user();
    const box = await get_box_data();
    const personalization = await get_configuration();
    if (token && auth) {
      set({
        token,
        is_authenticated: true,
        user,
        box,
        personalization,
      });
      return true;
    } else {
      set({
        token: "",
        is_authenticated: false,
      });
      return false;
    }
  },
  async OnMakeLoginOffline(payload) {
    login_offline(payload.userName, payload.password)
      .then((data) => {
        if (data.token !== "") {
          set({
            token: data.token,
            is_authenticated_offline: true,
          });
          ToastAndroid.show(
            `Bienvenido ${data.user?.username}`,
            ToastAndroid.SHORT
          );
          router.push("/offline_clients");
        } else {
          ToastAndroid.show(
            "Usuario o contraseña incorrectos",
            ToastAndroid.LONG
          );
          set({
            token: "",
            is_authenticated_offline: false,
          });
          return;
        }
      })
      .catch(() => {
        ToastAndroid.show("Error al iniciar sesión", ToastAndroid.LONG);
        set({
          token: "",
          is_authenticated_offline: false,
        });
        return;
      });
    return true;
  },
  async OnSaveUserLocal(Auth, token, password) {
    await get_transmitter(Auth.user.transmitterId, token)
      .then(async ({ data }) => {
        await saveUserAndTransmitter(
          { box: Auth.box, user: Auth.user, token: Auth.token },
          {
            ...data.transmitter,
            departamento: data.transmitter.direccion.departamento,
            municipio: data.transmitter.direccion.municipio,
            complemento: data.transmitter.direccion.complemento,
            transmitterId: data.transmitter.id,
          },
          password
        );
      })
      .catch(() => {
        ToastAndroid.show(`Necesitas tener un emisor`, ToastAndroid.SHORT);
        return;
      });
  },
  GetConfigurationByTransmitter: async (id) => {
    try {
      const { data } = await get_by_transmitter(id);
      if (data.personalization) {
        await save_configuration(data.personalization);
      }
    } catch (error) {
      set((state) => ({ ...state, config: {} as IConfiguration }));
    }
  },
}));
