import {
  get_personalization,
  save_configuration,
} from "@/plugins/async_storage";
import {
  get_by_transmitter,
} from "@/services/personalization.service";
import { IConfiguration } from "@/types/configuration/configuration.types";
import { IConfigurationStore } from "@/types/configuration/personalization.store.types";
import { create } from "zustand";

export const useConfigurationStore = create<IConfigurationStore>(
  (set) => ({
    personalization: [],
    logo_name: get_personalization(),

    OnCreateConfiguration: () => {},
    // GetConfigurationByTransmitter: async (id: number) => {
    //   try {
    //     const { data } = await get_by_transmitter(id);
    //     if (data.personalization) {
    //       const personalizationArray = Array.isArray(data.personalization)
    //         ? data.personalization
    //         : [data.personalization];
    //       set({
    //         personalization: personalizationArray,
    //       });
    //       await save_configuration(data.personalization);
    //     }
    //   } catch (error) {
    //     set((state) => ({ ...state, config: {} as IConfiguration }));
    //   }
    // },
    GetConfiguration: async (id) => {
      console.log("SE EJECUTAAAAAA")
      console.log("Ver el id de configuracion en el store", id);
      await get_by_transmitter(id)
        .then(async ({ data }) => {
          console.log("ver los datos en que devuelve la configuracion", data);
          set((state) => ({ ...state, config: data.personalization }));
          await save_configuration(data.personalization);
        })

        .catch(() => {
          set((state) => ({ ...state, config: {} as IConfiguration }));
        });
    },
  })
);
