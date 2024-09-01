import { return_location, handle_save_location } from "@/plugins/secure_store";
import {
  get_locations_real_time,
  get_locations_route_branch,
} from "@/services/locations.service";
import { ILocationStore } from "@/types/location/locations_store.types";
import { create } from "zustand";
import * as Location from "expo-location";
import { Coordenada, dividirArrayPorTiempo } from "@/utils/filters";
import { IAddressLocations } from "@/types/location/locations.types";
import { ToastAndroid } from "react-native";

export const useLocationStore = create<ILocationStore>((set) => ({
  has_enabled: false,
  coordinatesRealTime: {} as Coordenada,
  coordinatesRouter: [],
  address: {} as IAddressLocations,
  OnGetLocationDisponible() {
    return_location()
      .then((value) => {
        set((state) => ({ ...state, has_enabled: value }));
      })
      .catch(() => {
        set((state) => ({ ...state, has_enabled: false }));
      });
  },
  OnSetLocationDisponible(value) {
    set((state) => ({ ...state, has_enabled: !value }));
    handle_save_location(value);
  },
  OnGetLocation(id) {
    get_locations_real_time(id)
      .then(async ({ data }) => {
        const coordinates = {
          latitude: Number(data.data.latitude),
          longitude: Number(data.data.longitude),
          timestamp: Number(data.data.timestamp),
          accuracy: Number(data.data.currently),
          coordinateId: Number(data.data.coordinateId),
        };

        // const response = await Location.reverseGeocodeAsync({
        //   latitude: coordinates.latitude,
        //   longitude: coordinates.longitude,
        // });
        // const address = response[0].city || response[0].name;
        // const street = response[0].street
        //   ? response[0].street
        //   : "Nombre de calle no disponible";
        // const subregion = response[0].subregion;
        set({ coordinatesRealTime: coordinates });
      })
      .catch((error) => {
        set({ coordinatesRealTime: {} as Coordenada });
      });
  },
  OnGetLocationRouter: async (id, date) => {
    await get_locations_route_branch(id, date)
      .then(async (data) => {
        const coordinatesRoute = await dividirArrayPorTiempo(
          data.data.coordinates[0].coordinateDetails.map((item) => ({
            latitude: Number(item.latitude),
            longitude: Number(item.longitude),
            timestamp: Number(item.timestamp),
            accuracy: Number(item.currently),
          }))
        );
        set({ coordinatesRouter: coordinatesRoute });
      })
      .catch(() => {
        set({ coordinatesRouter: [] });
      });
  },
  OnVerifyActive(id) {},
}));
