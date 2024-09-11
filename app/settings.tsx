import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Switch,
  PermissionsAndroid,
  StatusBar,
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
import { ThemeContext } from "@/hooks/useTheme";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import Card from "@/components/Global/components_app/Card";

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
      <StatusBar barStyle="dark-content" />
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
        <ScrollView>
          <SafeAreaView
            style={{
              backgroundColor: "white",
              height: "100%",
              marginBottom: 55,
            }}
          >
            {/* <ScrollView style={{
           
          }}> */}
            <Card
              style={{
                top: 10,
                height: "20%",
                width: "96%",
                borderRadius: 15,
                margin: 5,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialCommunityIcons
                  name="cog-outline"
                  size={30}
                  color={"#00c598"}
                />
                <Text
                  style={{
                    textAlign: "right",
                    fontWeight: "bold",
                    fontSize: 20,
                  }}
                >
                  Permisos generales
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color: "black",
                  margin: 5,
                  textAlign: "left",
                }}
              >
                Estos permisos son requeridos para el buen funcionamiento de la
                aplicación.Para mayor información contactarse con los
                desarrolladores.
              </Text>
            </Card>

            <Card
              style={{
                top: 5,
                height: "auto",
                width: "96%",
                borderRadius: 15,
                margin: 5,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  size={40}
                  color={isBiometric ? "#00c598" : "#ccc"}
                  name={isBiometric ?"fingerprint": "fingerprint-off"}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "black",
                    left: 10,
                  }}
                >
                  Inicio biométrico
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  width: "100%",
                }}
              >
                <Text
                  style={{
                    textAlign: "left",
                    margin: 5,
                    fontSize: 14,
                    width: "80%",
                  }}
                >
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
            </Card>

            <Card
              style={{
                top: 5,
                height: "auto",
                width: "96%",
                borderRadius: 15,
                margin: 5,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  size={40}
                  color={hasCameraPermission ? "#0da9d9" : "#ccc"}
                  name={hasCameraPermission ? "camera" : "camera-off"}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "black",
                    left: 10,
                  }}
                >
                  Acceso a cámara
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  width: "100%",
                }}
              >
                <Text
                  style={{
                    textAlign: "left",
                    margin: 5,
                    fontSize: 14,
                    width: "80%",
                  }}
                >
                  Permite el acceso a la cámara para escanear códigos de barras
                  de productos.
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
            </Card>

            <Card
              style={{
                top: 5,
                height: "auto",
                width: "96%",
                borderRadius: 15,
                margin: 5,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  size={40}
                  color={has_enabled ? "#09ae50" : "#ccc"}
                  name={"map-marker-account"}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "black",
                    left: 10,
                  }}
                >
                  Acceso a ubicación
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  width: "100%",
                }}
              >
                <Text
                  style={{
                    textAlign: "left",
                    margin: 5,
                    fontSize: 14,
                    width: "80%",
                  }}
                >
                  Permite a la ubicación para marcar la ruta recorrida por
                  unidad
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
            </Card>
            <Card
              style={{
                top: 5,
                height: "auto",
                width: "96%",
                borderRadius: 15,
                margin: 5,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  size={40}
                  color={"#00a08f"}
                  name={"folder"}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "black",
                    left: 10,
                  }}
                >
                  Acceso de almacenamiento
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  width: "100%",
                }}
              >
                <Text
                  style={{
                    textAlign: "left",
                    margin: 5,
                    fontSize: 14,
                    width: "100%",
                  }}
                >
                  Permite el acceso a la los documentos, podrás seleccionar
                  archivos JSON de DTE para cargar los productos
                </Text>
              </View>
            </Card>
            <Card
              style={{
                top: 5,
                height: "auto",
                width: "96%",
                borderRadius: 15,
                margin: 5,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  size={40}
                  color={"red"}
                  name={"delete"}
                  onPress={() => handleClear()}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "black",
                    left: 10,
                  }}
                >
                  Restaurar configuración
                </Text>
              </View>
              {/* <View style={{ ...stylesGlobals.viewMain, marginTop: 40 }}> */}
              {/* <View
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
            </View> */}
            </Card>
          </SafeAreaView>
        </ScrollView>
      )}
    </>
  );
};

export default Settings;
