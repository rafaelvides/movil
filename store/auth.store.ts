import { create } from "zustand";
import { IAuthStore } from "../types/auth/auth_store.types";
import { UserLogin } from "@/types/user/user.types";
import { make_login } from "../services/auth.service";
import { AxiosError } from "axios";
import { ToastAndroid } from "react-native";
import {
  save_login_data_biometric,
  save_toke,
  delete_secure,
  save_token_mh,
  return_token,
  is_auth,
} from "@/plugins/secure_store";
import {
  box_data,
  get_box_data,
  get_user,
  save_branch_id,
  save_configuration,
  save_point_sale_Id,
  save_user,
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

export const useAuthStore = create<IAuthStore>((set, get) => ({
  user: {} as UserLogin,
  token: "",
  is_authenticated: false,
  is_authenticated_offline: false,
  box: {} as IBox,
  OnMakeLogin: async (payload) => {
    console.log("SE EJECUTA LA PETICION EN EL STOREEEEEEEEEEEEEEEEEEWEEEE", payload)
    return await make_login(payload)
      .then(async ({ data }) => {
        console.log("ESTAAAAAAAAA RETORNAAAAAANDOOOOOOOOOOOOOOOOOO",data)
        console.log("toooo")
        console.log("auth store");
        get().GetConfigurationByTransmitter(data.user.transmitterId);
        console.log("auth 2");
        if (data.ok) {
          console.log("auth 3");
         save_toke(data.token)
          console.log("auth 4", data.token);
          console.log("auth 5");
          await save_user(data.user);
          console.log("auth 6");
          await save_point_sale_Id(String(data.user.pointOfSaleId));
          console.log("auth 7");
          if (data.box) {
            console.log("LOS DATOOOOOOOOOOS QUE VIENE DEL LOGIN", data.box)
            box_data(data.box);
          }
         save_login_data_biometric("authBiometric", {
            userName: payload.userName,
            password: payload.password,
          });
          console.log("auth 8");
          if (data.user) {
            console.log("auth 9");
            set({
              user: data.user,
              token: data.token,
              box: data.box,
              is_authenticated: true,
            });
          }
          get()
            .OnSaveUserLocal(data, data.token, payload.password)
            .catch(() => {
              ToastAndroid.show(
                "Ocurrió un error al registrar",
                ToastAndroid.LONG
              );
            });
          console.log("auth 10", data.user.transmitterId);
          await get().OnLoginMH(data.user.transmitterId, data.token)
          await save_branch_id(String(data.user.branchId));
          console.log("auth 11");
          
        }
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
    console.log(token)
    get_transmitter(id, token)
      .then(({ data }) => {
        console.log(data, "data")
        login_mh(data.transmitter.nit, data.transmitter.claveApi)
          .then(async (login_mh) => {
            if (login_mh.data.status === "OK") {
              console.log("MH", login_mh.data.body.token)
              await save_token_mh(login_mh.data.body.token).catch((er) => {
                console.log(er)
              })
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
            console.log(error.response?.data.body, "1")
            ToastAndroid.show(
              `Error ${error.response?.data.body.descripcionMsg}`,
              ToastAndroid.SHORT
            );
            return;
          });
      })
      .catch((error) => {
        console.log(error, "2")
        console.log("error", error);
        ToastAndroid.show(`Aun no tienes datos asignados`, ToastAndroid.SHORT);
        return;
      });
  },
  OnMakeLogout: async () => {
    set({
      token: "",
      is_authenticated: false,
    });
    await AsyncStorage.clear();
    await delete_secure();
    console.log("DATOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOS ELIMINADOS")
    
    return true;
  },
  OnSetInfo: async () => {
    const token = await return_token();
    const auth = await is_auth();
    const user = await get_user();
    const box = await get_box_data();
    console.log("el onsetInfo", token, auth)
    if (token && auth) {
      set({
        token,
        is_authenticated: true,
        user,
        box,
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
            emisorId: data.transmitter.id,
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
        const personalizationArray = Array.isArray(data.personalization)
          ? data.personalization
          : [data.personalization];
        // set({
        //   personalization: personalizationArray,
        // });
        await save_configuration(data.personalization);
      }
    } catch (error) {
      set((state) => ({ ...state, config: {} as IConfiguration }));
    }
  },
}));
