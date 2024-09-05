import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Switch,
  PermissionsAndroid,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocationStore } from "@/store/locations.store";
import { useLocation } from "@/hooks/useLocation";
import { Alert, ToastAndroid } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "@/store/auth.store";
import { useFocusEffect } from "expo-router";
import {
  return_switch_biometric,
  save_swith_biometric,
} from "../plugins/secure_store";
import { Camera } from "expo-camera";
import SpinnerInitPage from "@/components/Global/SpinnerInitPage";
import { Divider } from "react-native-paper";
import { ThemeContext } from "@/hooks/useTheme";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";

const Settings = () => {
  const { has_enabled, OnGetLocationDisponible, OnSetLocationDisponible } =
    useLocationStore();
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isBiometric, setIsBiometric] = useState(false);
  const [isReloadind, setIsReloading] = useState(false);

  const { stopAllProcess } = useLocation();

  const { OnMakeLogout } = useAuthStore();
  const { theme } = useContext(ThemeContext);

  useFocusEffect(
    React.useCallback(() => {
      setIsReloading(true);
      setTimeout(() => {
        setIsReloading(false);
      }, 1000);
    }, [])
  );

  const toggleBiometric = () =>
    setIsBiometric((previousState) => !previousState);

  useEffect(() => {
    (async () => {
      return_switch_biometric().then((value) => {
        setIsBiometric(value);
      });
      OnGetLocationDisponible();
    })();

    const getBarCodeScannerPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
    requestStoragePermission();
  }, []);
  const saveBiometric = () => {
    save_swith_biometric(isBiometric);
  };

  const requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // El permiso se ha otorgado, puedes realizar la operación de almacenamiento externo
      } else {
        // El permiso se ha denegado, debes manejarlo de acuerdo a tus necesidades
      }
    } catch (err) {
      console.error(err);
    }
  };
  const toggleUbication = () => {
    if (has_enabled) {
      stopAllProcess();
    }
    OnSetLocationDisponible(has_enabled);
  };
  const handleClear = async () => {
    try {
      await Alert.alert(
        "Eliminar datos locales",
        "¿Estás seguro de que deseas eliminar tus datos locales? Esta acción eliminará tus configuraciones guardadas en el dispositivo, pero no afectará los registros en la base de datos. Después de esto, se cerrará tu sesión.",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Continuar",
            onPress: async () => {
              await AsyncStorage.clear();
              await SecureStore.deleteItemAsync("mh_token");
              await SecureStore.deleteItemAsync("numeroControl");
              await SecureStore.deleteItemAsync("auth_payload");
              ToastAndroid.show("Cerraste la sesión", ToastAndroid.SHORT);
              await OnMakeLogout();
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      ToastAndroid.show("Error al cerrar la sesión", ToastAndroid.SHORT);
    }
  };

  return (
    <>
      {isReloadind ? (
        <>
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
            }}
          >
            <SpinnerInitPage />
          </View>
        </>
      ) : (
        <SafeAreaView
          style={{ ...stylesGlobals.safeAreaForm, paddingHorizontal: 10 }}
        >
          <ScrollView
            style={{
              marginBottom: 30,
            }}
          >
            <Text style={stylesGlobals.textSettings}>Permisos</Text>
            <Divider style={stylesGlobals.dividerStyle} />
            <View style={stylesGlobals.viewMain}>
              <View
                style={{
                  ...stylesGlobals.styleView,
                  backgroundColor: isBiometric ? "transparent" : "#ccc",
                  borderColor: isBiometric ? "#00c598" : "#fff",
                }}
              >
                <MaterialCommunityIcons
                  size={35}
                  color={isBiometric ? "#00c598" : "#fff"}
                  name="fingerprint"
                />
              </View>
              <Text style={stylesGlobals.textComponent}>
                Inicia sesión de forma rápida y segura con tu huella dactilar.
              </Text>
              <Switch
                style={stylesGlobals.styleSwitch}
                trackColor={{ false: "#767577", true: "#3D69B4" }}
                thumbColor={isBiometric ? "#f4f3f4" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => {
                  toggleBiometric();
                  saveBiometric();
                }}
                value={isBiometric}
              />
            </View>
            <View style={{ ...stylesGlobals.viewMain, marginTop: 50 }}>
              <View
                style={{
                  ...stylesGlobals.styleView,
                  backgroundColor: hasCameraPermission ? "transparent" : "#ccc",
                  borderColor: hasCameraPermission ? "#2be0b7" : "transparent",
                }}
              >
                <MaterialCommunityIcons
                  size={34}
                  color={hasCameraPermission ? "#2be0b7" : "#fff"}
                  name={hasCameraPermission ? "camera" : "camera-off"}
                />
              </View>
              <Text style={stylesGlobals.textComponent}>
                Permite el acceso a la cámara para escanear códigos de barras de
                productos.
              </Text>
              <Switch
                style={stylesGlobals.styleSwitch}
                trackColor={{
                  false: "#767577",
                  true: "#3D69B4",
                }}
                thumbColor={hasCameraPermission ? "#f4f3f4" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={(camera) => setHasCameraPermission(camera)}
                value={hasCameraPermission}
              />
            </View>

            <View style={{ ...stylesGlobals.viewMain, marginTop: 50 }}>
              <View
                style={{
                  ...stylesGlobals.styleView,
                  backgroundColor: has_enabled ? "transparent" : "#ccc",
                  borderColor: has_enabled ? "#0da9d9" : "transparent",
                }}
              >
                <MaterialCommunityIcons
                  size={42}
                  color={has_enabled ? "#0da9d9" : "#fff"}
                  name={"map-marker-account"}
                />
              </View>
              <Text style={stylesGlobals.textComponent}>
                Permite a la ubicación para marcar la ruta recorrida por unidad
              </Text>
              <Switch
                style={stylesGlobals.styleSwitch}
                trackColor={{
                  false: "#767577",
                  true: "#3D69B4",
                }}
                thumbColor={has_enabled ? "#f4f3f4" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={(ubicación) => toggleUbication()}
                value={has_enabled}
              />
            </View>
            <View style={{ ...stylesGlobals.viewMain, marginTop: 50 }}>
              <View
                style={{
                  ...stylesGlobals.styleView,
                  backgroundColor: "transparent",
                  borderColor: "#009eff",
                }}
              >
                <MaterialCommunityIcons
                  size={24}
                  color={"#009eff"}
                  name={"folder"}
                />
              </View>
              <Text style={stylesGlobals.textComponent}>
                Permite el acceso a la los documentos, podrás seleccionar
                archivos JSON de DTE para cargar los productos
              </Text>
            </View>
            <View style={{ ...stylesGlobals.viewMain, marginTop: 40 }}>
              <View
                style={{
                  ...stylesGlobals.styleView,
                  backgroundColor: "transparent",
                  borderColor: theme.colors.danger,
                }}
              >
                <MaterialCommunityIcons
                  size={24}
                  color={theme.colors.danger}
                  name={"delete"}
                  onPress={() => handleClear()}
                />
              </View>
              <Text style={{ ...stylesGlobals.textComponent, marginTop: 18 }}>
                Restaurar datos
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      )}
    </>
  );
};

export default Settings;
