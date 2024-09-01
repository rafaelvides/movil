import { create } from "zustand";
import { IUserAndTransmitterOfflineStore } from "../types/store/user_and_transmitter_offline_store.types";
import { Transmitter } from "@/offline/entity/transmitter.entity";
import { get_user } from "@/plugins/async_storage";
import {
  getEmisorLocal,
  getUserLocaL,
} from "../service/users_and_transmitter.service";
import { ToastAndroid } from "react-native";

export const useUserAndTransmitterOfflineStore = create<IUserAndTransmitterOfflineStore>(
  (set) => ({
    transmitter: {} as Transmitter,

    async OnGetTransmitter() {
      await get_user()
        .then(async (data) => {
          await getUserLocaL(data?.userName!)
            .then(async (data) => {
              await getEmisorLocal(data?.transmitterId!)
                .then((data) => {
                  set({ transmitter: data });
                })
                .catch((error) => {
                  ToastAndroid.show(
                    "No se encontró el emisor",
                    ToastAndroid.SHORT
                  );
                });
            })
            .catch(() => {
              ToastAndroid.show(
                "No se encontró el usuario",
                ToastAndroid.SHORT
              );
            });
        })
        .catch(() => {
          ToastAndroid.show("No se hay usuario guardado", ToastAndroid.SHORT);
        });
    },
  })
);
