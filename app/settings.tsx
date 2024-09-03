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
          style={{
            width: "100%",
            height: "100%",
            paddingHorizontal: 20,
            backgroundColor: "white",
          }}
        >
          <ScrollView
            style={{
              width: "100%",
              height: "100%",
              marginBottom: 34,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                marginTop: 35,
                color: "#ccc",
                fontWeight: "bold",
              }}
            >
              Permisos
            </Text>
            <Divider style={{ width: "80%" }} />
            <View
              style={{
                marginTop: 10,
                flexDirection: "row",
              }}
            >
              <View
                style={{
                  backgroundColor: isBiometric ? "transparent" : "#ccc",
                  width: 50,
                  height: 50,
                  borderRadius: 50,
                  alignItems: "center",
                  justifyContent: "center",
                  borderColor: isBiometric ? "#00c598" : "#fff",
                  borderWidth: 1,
                  marginTop: 35,
                }}
              >
                <MaterialCommunityIcons
                  size={35}
                  color={isBiometric ? "#00c598" : "#fff"}
                  name="fingerprint"
                />
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  textAlign: "left",
                  width: "50%",
                  marginLeft: 70,
                  color: "#000",
                }}
              >
                Inicia sesión de forma rápida y segura con tu huella dactilar.
              </Text>
              <Switch
                style={{
                  transform: [{ scaleX: 1.0 }, { scaleY: 1.0 }],
                  marginLeft: 10,
                }}
                trackColor={{
                  false: "#767577",
                  true: "#3D69B4",
                }}
                thumbColor={isBiometric ? "#f4f3f4" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => {
                  toggleBiometric();
                  saveBiometric();
                }}
                value={isBiometric}
              />
            </View>

            <View
              style={{
                width: "100%",
                height: "100%",
              }}
            >
              <View
                style={{
                  marginTop: 40,
                  flexDirection: "row",
                }}
              >
                <View
                  style={{
                    backgroundColor: hasCameraPermission
                      ? "transparent"
                      : "#ccc",
                    alignItems: "center",
                    justifyContent: "center",
                    borderColor: hasCameraPermission
                      ? "#2be0b7"
                      : "transparent",
                    borderWidth: 1,
                    borderRadius: 50,
                    width: 50,
                    height: 50,
                  }}
                >
                  <MaterialCommunityIcons
                    size={34}
                    color={hasCameraPermission ? "#2be0b7" : "#fff"}
                    name={hasCameraPermission ? "camera" : "camera-off"}
                  />
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    textAlign: "left",
                    width: "50%",
                    marginLeft: 70,
                    color: "#000",
                  }}
                >
                  Permite el acceso a la cámara para escanear códigos de barras
                  de productos.
                </Text>
                <Switch
                  style={{
                    transform: [{ scaleX: 1.0 }, { scaleY: 1.0 }],
                    marginLeft: 10,
                  }}
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
              <View
                style={{
                  marginTop: 23,
                  flexDirection: "row",
                }}
              >
                <View
                  style={{
                    backgroundColor: has_enabled ? "transparent" : "#ccc",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 50,
                    borderColor: has_enabled ? "#0da9d9" : "transparent",
                    borderWidth: 1,
                    marginTop: 16,
                    width: 50,
                    height: 50,
                  }}
                >
                  <MaterialCommunityIcons
                    size={42}
                    color={has_enabled ? "#0da9d9" : "#fff"}
                    name={"map-marker-account"}
                  />
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    textAlign: "left",
                    width: "46%",
                    marginLeft: 70,
                    color: "#000",
                  }}
                >
                  Permite a la ubicación para marcar la ruta recorrida por
                  unidad
                </Text>
                <Switch
                  style={{
                    transform: [{ scaleX: 1.0 }, { scaleY: 1.0 }],
                    marginLeft: 20,
                  }}
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

              <View
                style={{
                  marginTop: 35,
                  flexDirection: "row",
                }}
              >
                <View
                  style={{
                    backgroundColor: "transparent",
                    alignItems: "center",
                    borderColor: "#009eff",
                    justifyContent: "center",
                    borderRadius: 50,
                    borderWidth: 1,
                    width: 50,
                    height: 50,
                  }}
                >
                  <MaterialCommunityIcons
                    size={24}
                    color={"#009eff"}
                    name={"folder"}
                  />
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: "#000",
                    width: "60%",
                    marginLeft: 67,
                  }}
                >
                  Permite el acceso a la los documentos, podrás seleccionar
                  archivos JSON de DTE para cargar los productos
                </Text>
              </View>

              <View
                style={{
                  marginTop: 35,
                  flexDirection: "row",
                }}
              >
                <View
                  style={{
                    backgroundColor: "transparent",
                    alignItems: "center",
                    borderColor: theme.colors.danger,
                    justifyContent: "center",
                    borderRadius: 50,
                    borderWidth: 1,
                    width: 50,
                    height: 50,
                  }}
                >
                  <MaterialCommunityIcons
                    size={24}
                    color={theme.colors.danger}
                    name={"delete"}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
          {/* <View
            style={{
              bottom: 0,
              position: "absolute",
              width: "50%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              style={{
                
                width: "100%",
                height: 50,
                borderRadius: 30,
                justifyContent: "center",
                borderColor:theme.colors.danger,
                borderWidth:1,
                alignItems: "center",
                marginBottom: 14,
                marginLeft: "120%",
                flexDirection: "row",
              }}
              onPress={() => handleClear()}
            >
              <MaterialCommunityIcons name="delete" size={24} color={theme.colors.danger}/>
              <Text style={{ color: "#000", fontSize: 12 }}>
                Restaurar configuración
              </Text>
            </Button>
          </View> */}
        </SafeAreaView>
      )}
    </>
  );
};

export default Settings;
