import React, { useContext, useEffect, useState } from "react";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import {
  Alert,
  Pressable,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image
} from "react-native";
import { Href, Link } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "../store/auth.store";
import { get_configuration } from "@/plugins/async_storage";
import { IConfiguration } from "@/types/configuration/configuration.types";
import { ThemeContext } from "@/hooks/useTheme";
import { StatusBar } from "expo-status-bar";
import { useLocation } from "@/hooks/useLocation";
import { useIsConnected } from "react-native-offline";
import { Divider } from "react-native-paper";
const CustomDrawer = (props: DrawerContentComponentProps) => {
  const currentRoute = props.state.routes[props.state.index];
  const [config, setConfig] = useState<IConfiguration | undefined>(undefined);
  const [index, setIndex] = useState(0);
  const { OnMakeLogout } = useAuthStore();
  const { stopAllProcess } = useLocation();
  const isConnected = useIsConnected();
  const { theme } = useContext(ThemeContext);

  const handleLogout = async () => {
    Alert.alert(
      "¿Estás seguro de cerrar tu sesión?",
      "",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Continuar",
          onPress: async () => {
            await OnMakeLogout();
            await stopAllProcess();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const fetchConfig = async () => {
    const fetchedConfig = await get_configuration();
    setConfig(fetchedConfig);
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <View
        style={{
          width: "100%",
          height: 160,
          backgroundColor: theme.colors.dark,
        }}
      >
        <View
          style={{
            height: 80,
            borderRadius: 40,
            backgroundColor: "#fff",
            width: 80,
            marginTop: 30,
            justifyContent: "center",
            alignContent: "center",
            alignSelf: "center",
          }}
        >
          <Image
            style={{
              width: 70,
              height: 70,
              justifyContent: "center",
              alignSelf: "center",
            }}
            source={
              config && config.logo
                ? { uri: config.logo }
                : require("../assets/images/react-logo.png")
            }
            alt={config && config.name ? config.name : "Logo Default"}
          />
        </View>
        <Text
          style={{
            color: "white",
            fontSize: 24,
            justifyContent: "center",
            alignSelf: "center",
          }}
        >
          {config && config.name ? config.name : "ERP APP"}
        </Text>
      </View>
      <View
        style={{
          height: "75%",
          width: "100%",
          backgroundColor: "#fff",
        }}
      >
        <DrawerContentScrollView
          style={{
            backgroundColor: "#fff",
            width: "100%",
            height: "30%",
          }}
        >
          <ScrollView>
            {isConnected === true ? (
              <>
                <ScrollView
                  style={{
                    width: "100%",
                    height: "80%",
                  }}
                >
                  <View
                    style={{
                      width: "100%",
                    }}
                  >
                    <Link href="/home" style={{ width: "100%" }} asChild>
                      <Pressable
                        style={{
                          backgroundColor:
                            currentRoute.name === "home"
                              ? theme.colors.dark
                              : "#fff",
                          ...styles.drawer_item,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: "rgb(249 250 251)",
                            padding: 10,
                            borderRadius: 300,
                          }}
                        >
                          <MaterialCommunityIcons
                            name="home"
                            size={25}
                            color={
                              currentRoute.name === "home"
                                ? theme.colors.dark
                                : "#94a3b8"
                            }
                          />
                        </View>
                        <Text
                          style={{
                            fontWeight:
                              currentRoute.name === "home" ? "bold" : "normal",
                            color:
                              currentRoute.name === "home"
                                ? "white"
                                : "rgb(17,24,39)",
                          }}
                        >
                          Inicio
                        </Text>
                      </Pressable>
                    </Link>
                    <Link
                      href={"/customer"}
                      style={{
                        width: "100%",
                      }}
                      asChild
                    >
                      <Pressable
                        style={{
                          backgroundColor: currentRoute.name.includes(
                            "customer"
                          )
                            ? theme.colors.dark
                            : "#fff",
                          ...styles.drawer_item,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: "rgb(249 250 251)",
                            padding: 10,
                            borderRadius: 300,
                          }}
                        >
                          <MaterialCommunityIcons
                            name="account-group-outline"
                            size={25}
                            color={
                              currentRoute.name.includes("customer")
                                ? theme.colors.dark
                                : "#94a3b8"
                            }
                          />
                        </View>
                        <Text
                          style={{
                            fontWeight: currentRoute.name.includes("customer")
                              ? "bold"
                              : "normal",
                            color: currentRoute.name.includes("customer")
                              ? "white"
                              : "rgb(17,24,39)",
                          }}
                        >
                          Clientes
                        </Text>
                      </Pressable>
                    </Link>
                    <Link
                      href={"/synchronize"}
                      style={{ width: "100%" }}
                      asChild
                    >
                      <Pressable
                        style={{
                          backgroundColor: currentRoute.name.includes(
                            "synchronize"
                          )
                            ? theme.colors.dark
                            : "#fff",
                          ...styles.drawer_item,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: "rgb(249 250 251)",
                            padding: 10,
                            borderRadius: 300,
                          }}
                        >
                          <MaterialCommunityIcons
                            name="cloud-print-outline"
                            size={25}
                            color={
                              currentRoute.name.includes("synchronize")
                                ? theme.colors.dark
                                : "#94a3b8"
                            }
                          />
                        </View>
                        <Text
                          style={{
                            fontWeight: currentRoute.name.includes(
                              "synchronize"
                            )
                              ? "bold"
                              : "normal",
                            color: currentRoute.name.includes("synchronize")
                              ? "white"
                              : "rgb(17,24,39)",
                          }}
                        >
                          Ventas Pendientes
                        </Text>
                      </Pressable>
                    </Link>
                    <Divider
                      style={{
                        width: "88%",
                        backgroundColor: "#94a3b8",
                        height: 1,
                        marginLeft: 15,
                        marginTop: 10,
                      }}
                    />

                    <Link href={"/make_sale"} style={{ width: "100%" }} asChild>
                      <Pressable
                        style={{
                          backgroundColor: currentRoute.name.includes(
                            "make_sale"
                          )
                            ? theme.colors.dark
                            : "#fff",
                          ...styles.drawer_item,
                          marginTop: 20,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: "rgb(249 250 251)",
                            padding: 10,
                            borderRadius: 300,
                          }}
                        >
                          <MaterialCommunityIcons
                            name="cart-outline"
                            size={25}
                            color={
                              currentRoute.name.includes("make_sale")
                                ? theme.colors.dark
                                : "#94a3b8"
                            }
                          />
                        </View>
                        <Text
                          style={{
                            fontWeight: currentRoute.name.includes("make_sale")
                              ? "bold"
                              : "normal",
                            color: currentRoute.name.includes("make_sale")
                              ? "white"
                              : "rgb(17,24,39)",
                          }}
                        >
                          Nueva Venta
                        </Text>
                      </Pressable>
                    </Link>

                    <Link
                      href={"/(inventory)/of_customers"}
                      style={{ width: "100%" }}
                      asChild
                    >
                      <Pressable
                        style={{
                          backgroundColor: currentRoute.name.includes(
                            "inventory"
                          )
                            ? theme.colors.dark
                            : "#fff",
                          ...styles.drawer_item,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: "rgb(249 250 251)",
                            padding: 10,
                            borderRadius: 300,
                          }}
                        >
                          <MaterialCommunityIcons
                            name="book-arrow-down-outline"
                            size={25}
                            color={
                              currentRoute.name.includes("inventory")
                                ? theme.colors.dark
                                : "#94a3b8"
                            }
                          />
                        </View>
                        <Text
                          style={{
                            fontWeight: currentRoute.name.includes("inventory")
                              ? "bold"
                              : "normal",
                            color: currentRoute.name.includes("inventory")
                              ? "white"
                              : "rgb(17,24,39)",
                          }}
                        >
                          Inventario
                        </Text>
                      </Pressable>
                    </Link>

                    <Link href={"/expenses"} style={{ width: "100%" }} asChild>
                      <Pressable
                        style={{
                          backgroundColor: currentRoute.name.includes(
                            "expenses"
                          )
                            ? theme.colors.dark
                            : "#fff",
                          ...styles.drawer_item,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: "rgb(249 250 251)",
                            padding: 10,
                            borderRadius: 300,
                          }}
                        >
                          <MaterialCommunityIcons
                            name="deskphone"
                            size={25}
                            color={
                              currentRoute.name.includes("expenses")
                                ? theme.colors.dark
                                : "#94a3b8"
                            }
                          />
                        </View>
                        <Text
                          style={{
                            fontWeight: currentRoute.name.includes("expenses")
                              ? "bold"
                              : "normal",
                            color: currentRoute.name.includes("expenses")
                              ? "white"
                              : "rgb(17,24,39)",
                          }}
                        >
                          Gastos
                        </Text>
                      </Pressable>
                    </Link>

                    <Link
                      href={"/(sales)/processed_sales"}
                      style={{ width: "100%" }}
                      asChild
                    >
                      <Pressable
                        style={{
                          backgroundColor: currentRoute.name.includes("sales")
                            ? theme.colors.dark
                            : "#fff",
                          ...styles.drawer_item,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: "rgb(249 250 251)",
                            padding: 10,
                            borderRadius: 300,
                          }}
                        >
                          <MaterialCommunityIcons
                            name="book-open-variant"
                            size={25}
                            color={
                              currentRoute.name.includes("sales")
                                ? theme.colors.dark
                                : "#94a3b8"
                            }
                          />
                        </View>
                        <Text
                          style={{
                            fontWeight: currentRoute.name.includes("sales")
                              ? "bold"
                              : "normal",
                            color: currentRoute.name.includes("sales")
                              ? "white"
                              : "rgb(17,24,39)",
                          }}
                        >
                          Reporte de ventas
                        </Text>
                      </Pressable>
                    </Link>

                    <Link href={"/Box_close"} style={{ width: "100%" }} asChild>
                      <Pressable
                        style={{
                          backgroundColor: currentRoute.name.includes(
                            "Box_close"
                          )
                            ? theme.colors.dark
                            : "#fff",
                          ...styles.drawer_item,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: "rgb(249 250 251)",
                            padding: 10,
                            borderRadius: 300,
                          }}
                        >
                          <MaterialCommunityIcons
                            name="package-variant-closed"
                            size={25}
                            color={
                              currentRoute.name.includes("Box_close")
                                ? theme.colors.dark
                                : "#94a3b8"
                            }
                          />
                        </View>
                        <Text
                          style={{
                            fontWeight: currentRoute.name.includes("Box_close")
                              ? "bold"
                              : "normal",
                            color: currentRoute.name.includes("Box_close")
                              ? "white"
                              : "rgb(17,24,39)",
                          }}
                        >
                          Cerrar caja
                        </Text>
                      </Pressable>
                    </Link>
                    <Divider
                      style={{
                        width: "88%",
                        backgroundColor: "#94a3b8",
                        height: 1,
                        marginLeft: 15,
                        marginTop: 10,
                      }}
                    />

                    <Link href={"/settings"} style={{ width: "100%" }} asChild>
                      <Pressable
                        style={{
                          backgroundColor: currentRoute.name.includes(
                            "settings"
                          )
                            ? theme.colors.dark
                            : "#fff",
                          ...styles.drawer_item,
                          marginTop: 20,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: "rgb(249 250 251)",
                            padding: 10,
                            borderRadius: 300,
                          }}
                        >
                          <MaterialCommunityIcons
                            name="cog-outline"
                            size={25}
                            color={
                              currentRoute.name.includes("settings")
                                ? theme.colors.dark
                                : "#94a3b8"
                            }
                          />
                        </View>
                        <Text
                          style={{
                            fontWeight: currentRoute.name.includes("settings")
                              ? "bold"
                              : "normal",
                            color: currentRoute.name.includes("settings")
                              ? "white"
                              : "rgb(17,24,39)",
                          }}
                        >
                          Configuración
                        </Text>
                      </Pressable>
                    </Link>
                    <Link
                      href={"/(maps)/location_real_time"}
                      style={{ width: "100%" }}
                      asChild
                    >
                      <Pressable
                        style={{
                          backgroundColor: currentRoute.name.includes("maps")
                            ? theme.colors.dark
                            : "#fff",
                          ...styles.drawer_item,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: "rgb(249 250 251)",
                            padding: 10,
                            borderRadius: 300,
                          }}
                        >
                          <MaterialCommunityIcons
                            name="map-outline"
                            size={25}
                            color={
                              currentRoute.name.includes("maps")
                                ? theme.colors.dark
                                : "#94a3b8"
                            }
                          />
                        </View>
                        <Text
                          style={{
                            fontWeight: currentRoute.name.includes("maps")
                              ? "bold"
                              : "normal",
                            color: currentRoute.name.includes("maps")
                              ? "white"
                              : "rgb(17,24,39)",
                          }}
                        >
                          Ubicación
                        </Text>
                      </Pressable>
                    </Link>
                    <View>
                      <Pressable
                        style={{
                          ...styles.drawer_item,
                        }}
                        onPress={() => {
                          handleLogout();
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                          }}
                        >
                          <MaterialCommunityIcons
                            style={{
                              backgroundColor: "rgb(249 250 251)",
                              padding: 10,
                              borderRadius: 300,
                            }}
                            name="logout"
                            size={30}
                            color={theme.colors.third}
                          />
                          <Text
                            style={{
                              marginTop: 20,
                            }}
                          >
                            Cerrar sesión
                          </Text>
                        </View>
                      </Pressable>
                    </View>
                  </View>
                </ScrollView>
              </>
            ) : (
              <>
                <Link
                  href={"/offline_make_sales"}
                  style={{ width: "100%" }}
                  asChild
                >
                  <Pressable
                    style={{
                      backgroundColor: index === 1 ? theme.colors.dark : "#fff",
                      ...styles.drawer_item,
                    }}
                    onPress={() => setIndex(1)}
                  >
                    <View
                      style={{
                        backgroundColor: "rgb(249 250 251)",
                        padding: 10,
                        borderRadius: 300,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="cart-outline"
                        size={25}
                        color={index === 1 ? theme.colors.dark : "#94a3b8"}
                      />
                    </View>
                    <Text
                      style={{
                        fontWeight: index === 1 ? "bold" : "normal",
                        color: index === 1 ? "white" : "rgb(17,24,39)",
                      }}
                    >
                      Nueva venta
                    </Text>
                  </Pressable>
                </Link>
                <Link href={"/offline_sales"} style={{ width: "100%" }} asChild>
                  <Pressable
                    style={{
                      backgroundColor: index === 2 ? theme.colors.dark : "#fff",
                      ...styles.drawer_item,
                    }}
                    onPress={() => setIndex(2)}
                  >
                    <View
                      style={{
                        backgroundColor: "rgb(249 250 251)",
                        padding: 10,
                        borderRadius: 300,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="book-open-variant"
                        size={25}
                        color={index === 2 ? theme.colors.dark : "#94a3b8"}
                      />
                    </View>
                    <Text
                      style={{
                        fontWeight: index === 2 ? "bold" : "normal",
                        color: index === 2 ? "white" : "rgb(17,24,39)",
                      }}
                    >
                      Ventas
                    </Text>
                  </Pressable>
                </Link>
                <Link
                  href={"/offline_clients"}
                  style={{ width: "100%" }}
                  asChild
                >
                  <Pressable
                    style={{
                      backgroundColor: index === 3 ? theme.colors.dark : "#fff",
                      ...styles.drawer_item,
                    }}
                    onPress={() => setIndex(3)}
                  >
                    <View
                      style={{
                        backgroundColor: "rgb(249 250 251)",
                        padding: 10,
                        borderRadius: 300,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="account-group-outline"
                        size={25}
                        color={index === 3 ? theme.colors.dark : "#94a3b8"}
                      />
                    </View>
                    <Text
                      style={{
                        fontWeight: index === 3 ? "bold" : "normal",
                        color: index === 3 ? "white" : "rgb(17,24,39)",
                      }}
                    >
                      Cliente
                    </Text>
                  </Pressable>
                </Link>
                <Link
                  href={"/offline_branch_product" as Href}
                  style={{ width: "100%" }}
                  asChild
                >
                  <Pressable
                    style={{
                      backgroundColor: index === 4 ? theme.colors.dark : "#fff",
                      ...styles.drawer_item,
                    }}
                    onPress={() => setIndex(4)}
                  >
                    <View
                      style={{
                        backgroundColor: "rgb(249 250 251)",
                        padding: 10,
                        borderRadius: 300,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="shopping-outline"
                        size={25}
                        color={index === 4 ? theme.colors.dark : "#94a3b8"}
                      />
                    </View>
                    <Text
                      style={{
                        fontWeight: index === 4 ? "bold" : "normal",
                        color: index === 4 ? "white" : "rgb(17,24,39)",
                      }}
                    >
                      Productos
                    </Text>
                  </Pressable>
                </Link>
              </>
            )}
          </ScrollView>
        </DrawerContentScrollView>
      </View>
    </>
  );
};
const styles = StyleSheet.create({
  drawer_item: {
    width: "95%",
    borderTopEndRadius: 50,
    borderEndEndRadius: 50,
    borderBottomEndRadius: 50,
    padding: 5,
    paddingHorizontal: 15,
    display: "flex",
    alignContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#fff",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  drawerContent: {
    paddingVertical: 1,
    left: 1,
    right: 12,
  },
  justify: {
    marginLeft: 17,
  },
});

export default CustomDrawer;
