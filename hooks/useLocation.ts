import { get_branch_id } from "@/plugins/async_storage";
import { useAuthStore } from "@/store/auth.store";
import { useLocationStore } from "@/store/locations.store";
import { IGetLocationsResponse } from "@/types/location/locations.types";
import { formatDate } from "@/utils/date";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { useEffect, useState } from "react";
import { ToastAndroid } from "react-native";
import { useIsConnected } from "react-native-offline";
import { createSocket } from "./useSocket";
import axios, { AxiosError } from "axios";
import { API_URL } from "@/utils/constants";

const LOCATION_TASK_NAME = "LOCATION_TASK_BACKGROUND";
const socket = createSocket();

TaskManager.defineTask<IGetLocationsResponse>(
  LOCATION_TASK_NAME,
  async ({ data, error }) => {
    if (error) {
      ToastAndroid.show("Error: " + error.message, ToastAndroid.SHORT);
    } else if (data) {
      const branchId = await get_branch_id();
      if (data.locations && data.locations.length > 0) {
        const location = data.locations[0];
        if (location.coords.speed > 0 && location.coords.accuracy <= 20) {
          axios
            .post(`${API_URL}/coordinate`, {
              branchId: Number(branchId),
              date: formatDate(),
              latitude: data.locations[0].coords.latitude,
              longitude: data.locations[0].coords.longitude,
              timestamp: data.locations[0].timestamp,
              currently: data.locations[0].coords.accuracy,
            })
            .then(() => {
              socket.emit("new", "world");
              ToastAndroid.show(
                "Ubicación registrada correctamente",
                ToastAndroid.LONG
              );
            })
            .catch((error: AxiosError) => {
              ToastAndroid.show(
                `Error al registrar la ubicación: ${error.message}`,
                ToastAndroid.LONG
              );
              ToastAndroid.show(
                `Error al registrar la ubicación: ${error.response?.data}`,
                ToastAndroid.LONG
              );
            });
        }
      }
    }
  }
);

export const useLocation = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const isConnected = useIsConnected();
  const { OnSetInfo, is_authenticated } = useAuthStore();
  const { has_enabled, OnGetLocationDisponible } = useLocationStore();

  useEffect(() => {
    OnGetLocationDisponible();
    (async () => {
      OnSetInfo();
    })();
  }, []);

  useEffect(() => {
    (async () => {
      //Comprueba si el usuario ha habilitado los servicios de ubicación.
      const hasEnabled = await Location.hasServicesEnabledAsync();
      if (!has_enabled && !hasEnabled && !is_authenticated) {
        stopAllProcess();
        return;
      }

      if (is_authenticated) {
        if ((isConnected && has_enabled) || hasEnabled === false) {
          //Pide al usuario que conceda permisos para la ubicación mientras la aplicación está en primer plano.
          const { status, expires } =
            await Location.requestForegroundPermissionsAsync();
          //Pide al usuario que active el modo de ubicación de alta precisión que permite al proveedor de red que utiliza Servicios de Google Play para mejorar la precisión de la ubicación y los servicios basados en la ubicación.
          Location.enableNetworkProviderAsync()
            .then(async () => {
              if (status === "granted") {
                //Pide al usuario que conceda permisos para la ubicación mientras la aplicación está en segundo plano.
                const background =
                  await Location.requestBackgroundPermissionsAsync();
                const foreground =
                  await Location.requestForegroundPermissionsAsync();
                if (
                  foreground.status === "granted" &&
                  background.status === "granted"
                ) {
                  Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                    accuracy: Location.Accuracy.BestForNavigation,
                    activityType: Location.ActivityType.AutomotiveNavigation,
                    showsBackgroundLocationIndicator: true,
                    distanceInterval: 5,
                    timeInterval: 5000,
                    // deferredUpdatesDistance: 1,
                    // deferredUpdatesInterval: 1000,
                    foregroundService: {
                      killServiceOnDestroy: true,
                      notificationTitle: "Facturación App",
                      notificationBody: "Ubicación activada",
                      notificationColor: "#fff",
                    },
                  });
                  setIsAvailable(true);
                } else {
                  ToastAndroid.show(
                    "Permisos de ubicación necesarios. Otorga permisos en primer y segundo plano",
                    ToastAndroid.LONG
                  );
                  setIsAvailable(false);
                }
              } else {
                ToastAndroid.show(
                  "No se han otorgado permisos de ubicación",
                  ToastAndroid.LONG
                );
                setIsAvailable(false);
              }
            })
            .catch(() => {
              ToastAndroid.show(
                "Error al solicitar permisos de ubicación",
                ToastAndroid.LONG
              );
              setIsAvailable(false);
            });
        }
      }
    })();
  }, [isConnected, has_enabled]);

  const stopAllProcess = () => {
    TaskManager.getRegisteredTasksAsync().then(async (tasks) => {
      if (tasks.map((task) => task.taskName).includes(LOCATION_TASK_NAME)) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        await TaskManager.unregisterTaskAsync(LOCATION_TASK_NAME);
        setIsAvailable(false);
      }
    });
  };

  return {
    isAvailable,
    stopAllProcess,
  };
};
