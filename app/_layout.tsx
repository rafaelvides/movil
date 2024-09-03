import { useFonts } from "expo-font";
import { Href, Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useContext, useEffect, useState } from "react";
import "react-native-reanimated";
import { Drawer } from "expo-router/drawer";
import { LogBox, View, Text, ToastAndroid, BackHandler } from "react-native";
import { useAuthStore } from "../store/auth.store";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DrawerToggleButton } from "@react-navigation/drawer";
import CustomDrawer from "@/routes/CustomDrawer";
import { ToastProvider, useToast } from "react-native-toast-notifications";
import { PaperProvider } from "react-native-paper";
import { SheetProvider } from "react-native-actions-sheet";
import "@/plugins/sheets";
import { NetworkProvider, useIsConnected } from "react-native-offline";
import { es, registerTranslation } from "react-native-paper-dates";
import ThemeProvider, { ThemeContext } from "@/hooks/useTheme";
import { useDataBaseInitialize } from "@/hooks/useTypeOrm";
import { createSocket } from "@/hooks/useSocket";
registerTranslation("es", es);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const { ready } = useDataBaseInitialize();
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }
  LogBox.ignoreAllLogs();

  return (
    <ToastProvider>
      <NetworkProvider>
        <StatusBar style="light" />
        {ready ? (
          <ValidationNetwork />
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text>Cargando...</Text>
          </View>
        )}
      </NetworkProvider>
    </ToastProvider>
  );
}
const ValidationNetwork = () => {
  const isConnected = useIsConnected();
  const { theme } = useContext(ThemeContext);

  return (
    <PaperProvider theme={theme}>
      <ThemeProvider>
        <SheetProvider>
          {isConnected === null ? (
            <Text
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Esperando
            </Text>
          ) : (
            <RootLayoutNav isConnected={isConnected} />
          )}
        </SheetProvider>
      </ThemeProvider>
    </PaperProvider>
  );
};
function RootLayoutNav({ isConnected }: { isConnected: boolean }) {
  const socket = createSocket();
  const [backPressCount, setBackPressCount] = useState(0);
  const connect = useCallback(() => {
    socket.on("connect", () => console.log("se conecto"));
  }, [socket]);

  const disconnect = useCallback(() => {
    socket.on("disconnect", () => console.log("se desconecto"));
  }, [socket]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  const [loading, setLoading] = useState(true);

  const { is_authenticated, OnSetInfo, is_authenticated_offline } =
    useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isConnected !== null && !isConnected) {
      ToastAndroid.show(
        "No se encontró conexión a internet",
        ToastAndroid.LONG
      );
    }
  }, [isConnected]);

  useEffect(() => {
    OnSetInfo().then(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading && isConnected !== null) {
      if (isConnected) {
        if (!loading && is_authenticated) {
          router.navigate("/home");
        } else {
          router.navigate("/login");
        }
      } else {
        router.navigate("/(offline)/offline_make_sales" as Href);
      }
    }
    const backAction = () => {
      if (backPressCount === 0) {
        setBackPressCount(1);
        ToastAndroid.show("Presiona de nuevo para salir", ToastAndroid.SHORT);
        setTimeout(() => setBackPressCount(0), 2000);
        return true;
      } else {
        BackHandler.exitApp();
        return false;
      }
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [loading, isConnected, backPressCount]);

  return (
    <>
      <StatusBar style="light" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        {isConnected === true ? (
          <>
            {is_authenticated ? (
              <>
                <Drawer
                  screenOptions={{
                    headerShown: true,
                    headerStyle: { backgroundColor: "#fff", height: 75 },
                    headerTitleStyle: {
                      color: "#2c3377",
                      textAlign: "center",
                      fontWeight: "400",
                      fontSize: 16,
                    },
                    headerLeft: () => <DrawerToggleButton />,
                    headerTitleAlign: "center",
                    headerTintColor: "#2c3377",
                    drawerStyle: {
                      width: "65%",
                    },
                  }}
                  initialRouteName={is_authenticated ? "home" : "login"}
                  drawerContent={(props) => <CustomDrawer {...props} />}
                >
                  <Drawer.Screen
                    name="home"
                    options={{
                      drawerLabel: "Inicio",
                      title: "Inicio",
                    }}
                  />
                  <Drawer.Screen
                    name="customer"
                    options={{
                      drawerLabel: "Customer",
                      title: "Clientes",
                    }}
                  />
                  <Drawer.Screen
                    name="synchronize"
                    options={{
                      drawerLabel: "Ventas pendientes",
                      title: "Ventas pendientes",
                    }}
                  />
                  <Drawer.Screen
                    name="make_sale"
                    options={{
                      drawerLabel: "Realizar venta",
                      title: "Realizar venta",
                    }}
                  />
                  <Drawer.Screen
                    name="(sales)"
                    options={{
                      drawerLabel: "Reporte de ventas",
                      title: "Reporte de ventas",
                    }}
                  />
                  <Drawer.Screen
                    name="(inventory)"
                    options={{
                      drawerLabel: "Inventario",
                      title: `Inventario`,
                    }}
                  />
                  <Drawer.Screen
                    name="expenses"
                    options={{
                      drawerLabel: "Gastos",
                      title: `Gastos`,
                    }}
                  />
                  <Drawer.Screen
                    name="(maps)"
                    options={{
                      drawerLabel: "Ubicación",
                      title: `Ubicación`,
                    }}
                  />
                  <Drawer.Screen
                    name="settings"
                    options={{
                      drawerLabel: "Configuración",
                      title: "Configuración",
                    }}
                  />
                  <Drawer.Screen
                    name="(offline)"
                    options={{
                      drawerLabel: "Modo sin Conexión",
                      title: "Modo sin Conexión",
                    }}
                  />
                  <Drawer.Screen
                    name="Box_close"
                    options={{
                      drawerLabel: "Cerrar Caja",
                      title: "Cerrar Caja",
                    }}
                  />
                </Drawer>
              </>
            ) : (
              <>
                <Stack>
                  <Stack.Screen
                    name="login"
                    options={{ title: "Login", headerShown: false }}
                  />
                </Stack>
              </>
            )}
          </>
        ) : (
          <>
            <Drawer
              screenOptions={{
                headerShown: true,
                headerStyle: { backgroundColor: "#fff", height: 75 },
                headerTitleStyle: {
                  color: "#2C3377",
                  textAlign: "center",
                  fontWeight: "400",
                  fontSize: 16,
                },
                headerLeft: () => <DrawerToggleButton />,
                headerTitleAlign: "center",
                headerTintColor: "#2C3377",
                drawerStyle: {
                  width: "75%",
                },
              }}
              initialRouteName={
                is_authenticated_offline ? "offline_make_sales" : "login"
              }
              drawerContent={(props) => <CustomDrawer {...props} />}
            >
              <Drawer.Screen
                name="(offline)"
                options={{
                  drawerLabel: "Modo sin conexión",
                  title: "Modo sin conexión",
                }}
              />
            </Drawer>
          </>
        )}
      </GestureHandlerRootView>
    </>
  );
}
