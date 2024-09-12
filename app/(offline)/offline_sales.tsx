import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import SpinnerInitPage from "@/components/Global/SpinnerInitPage";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SpinLoading from "@/components/Global/SpinLoading";
import { useFocusEffect } from "expo-router";
import { useSalesOfflineStore } from "@/offline/store/sale_offline.store";
import { get_box_data } from "@/plugins/async_storage";
import AnimatedButton from "@/components/Global/AnimatedButtom";
import { SheetManager } from "react-native-actions-sheet";
import { ThemeContext } from "@/hooks/useTheme";
import { Pressable } from "react-native";
import { clear_complete_sale } from "@/offline/service/sale_local.service";
import AlertWithAnimation from "@/components/Global/manners/Alert";
import { formatDate } from "@/utils/date";
import { ICat002TipoDeDocumento } from "@/types/billing/cat-002-tipo-de-documento.types";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import Card from "@/components/Global/components_app/Card";
import { formatCurrency } from "@/utils/dte";

const offline_sales = () => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isAlert, setIsAlert] = useState({ active: false, id: 0 });
  const [totalP, setTotalP] = useState("");
  const [startDate, setStartDate] = useState(formatDate());
  const [typeDoc, setTypeDTE] = useState<ICat002TipoDeDocumento>({
    id: 0,
    codigo: "",
    valores: "Todos",
    isActivated: true,
  });

  const { OnGetSalesOfflinePagination, is_loading, sales_offline_pag } =
    useSalesOfflineStore();
  const { theme } = useContext(ThemeContext);

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      setRefreshing(true);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }, [])
  );
  useEffect(() => {
    (async () => {
      await get_box_data().then((data) => {
        if (!data?.id) {
          ToastAndroid.show("No tienes caja asignada", ToastAndroid.LONG);
          return;
        }
        OnGetSalesOfflinePagination(
          data?.id,
          String(typeDoc?.codigo ?? ""),
          startDate,
          totalP,
          1,
          100
        );
      });
    })();
    setRefreshing(false);
  }, [refreshing]);

  const handleDeleteSale = (id: number) => {
    clear_complete_sale(id).then((res) => {
      if (res) {
        setRefreshing(true);
      }
    });
  };

  return (
    <>
      <StatusBar style="dark" />

      {loading ? (
        <>
          <View style={stylesGlobals.viewSpinnerInit}>
            <SpinnerInitPage />
          </View>
        </>
      ) : (
        <>
          <SafeAreaView style={stylesGlobals.safeAreaViewStyle}>
            {loading === false && is_loading ? (
              <SpinLoading is_showing={is_loading} />
            ) : (
              <>
                <View style={stylesGlobals.filter}>
                  <AnimatedButton
                    handleClick={() => {
                      SheetManager.show("sale-offline-filters-sheet", {
                        payload: {
                          typeDTE: typeDoc,
                          setTypeDTE,
                          totalP: totalP,
                          onChangeValueTotalP(text) {
                            setTotalP(text);
                          },
                          startDate: startDate,
                          setStartDate,
                          handleConfirm(startDate, typeDTE) {
                            setStartDate(startDate);
                            setTypeDTE(typeDTE);
                            setRefreshing(true);
                            SheetManager.hide("sale-offline-filters-sheet");
                          },
                        },
                      });
                    }}
                    iconName="filter"
                    buttonColor={theme.colors.third}
                    width={40}
                    height={40}
                    right={42}
                    left={10}
                    size={25}
                    top={0}
                  />
                </View>

                <ScrollView
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={() => setRefreshing(true)}
                    />
                  }
                >
                  <View style={stylesGlobals.viewScroll}>
                    {!is_loading &&
                      sales_offline_pag &&
                      sales_offline_pag.map((sale, index) => (
                        <Card style={stylesGlobals.styleCard} key={index}>
                          <View
                            style={{
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Text
                              style={{ fontWeight: "600", color: "#4B5563" }}
                            >
                              Ventas: #{sale.id}
                            </Text>
                          </View>
                          <View style={{ width: "100%" }}>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginTop: 12,
                                width: "100%",
                              }}
                            >
                              <MaterialCommunityIcons
                                color={"#AFB0B1"}
                                name="account-tie-outline"
                                size={22}
                                style={styles.icon}
                              />
                              <Text
                                style={{
                                  marginLeft: 50,
                                  fontWeight: "600",
                                  color: "#4B5563",
                                }}
                              >
                                {sale.transmitter.nombre}
                              </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginTop: 20,
                                marginBottom: 12,
                                width: "100%",
                              }}
                            >
                              <MaterialCommunityIcons
                                color={"#AFB0B1"}
                                name="account"
                                size={22}
                                style={styles.icon}
                              />
                              <Text
                                style={{
                                  marginLeft: 50,
                                  fontWeight: "600",
                                  color: "#4B5563",
                                }}
                              >
                                {sale.customer.nombre}
                              </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: "row",
                                marginRight: 5,
                                marginTop: 10,
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <MaterialCommunityIcons
                                  color={"#AFB0B1"}
                                  name="calendar-month"
                                  size={22}
                                  style={styles.icon}
                                />
                                <Text
                                  style={{
                                    marginLeft: 50,
                                    fontWeight: "600",
                                    color: "#4B5563",
                                  }}
                                >
                                  {sale.fecEmi.toLocaleString()}
                                </Text>
                              </View>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  marginLeft: 65,
                                }}
                              >
                                <MaterialCommunityIcons
                                  color={"#AFB0B1"}
                                  name="clipboard-clock-outline"
                                  size={22}
                                  style={styles.icon}
                                />
                                <Text
                                  style={{
                                    marginLeft: 50,
                                    fontWeight: "600",
                                    color: "#4B5563",
                                  }}
                                >
                                  {sale.horEmi.toLocaleString()}
                                </Text>
                              </View>
                            </View>
                            <View
                              style={{
                                flexDirection: "row",
                                marginLeft: 5,
                                marginTop: 25,
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <MaterialCommunityIcons
                                  color={"#AFB0B1"}
                                  name="ticket-percent"
                                  size={22}
                                  style={styles.icon}
                                />
                                <Text
                                  style={{
                                    width: 70,
                                    marginLeft: 45,
                                    fontWeight: "600",
                                    color: "#4B5563",
                                  }}
                                >
                                  {sale.totalDescu}
                                </Text>
                              </View>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  marginLeft: 73,
                                }}
                              >
                                <MaterialCommunityIcons
                                  color={"#AFB0B1"}
                                  name="cash"
                                  size={22}
                                  style={{ position: "absolute", left: 6 }}
                                />
                                <Text
                                  style={{
                                    width: 80,
                                    marginLeft: 40,
                                    fontWeight: "600",
                                    color: "#4B5563",
                                  }}
                                >
                                  {formatCurrency(Number(sale.totalPagar))}
                                </Text>
                              </View>
                            </View>
                            <View
                              style={{
                                justifyContent: "space-between",
                                marginTop: 20,
                                flexDirection: "row",
                                width: "100%",
                              }}
                            >
                              <Pressable
                                onPress={() =>
                                  setIsAlert({ active: true, id: sale.id })
                                }
                                style={{
                                  flexDirection: "row",
                                  marginTop: 5,
                                  width: 40,
                                  height: 40,
                                  backgroundColor: "#912",
                                  borderRadius: 10,
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <MaterialCommunityIcons
                                  color={"#ffffff"}
                                  name="delete"
                                  size={25}
                                />
                              </Pressable>
                              <Pressable
                                style={{
                                  flexDirection: "row",
                                  marginTop: 5,
                                  width: 40,
                                  height: 40,
                                  backgroundColor: "#6E6E6E",
                                  borderRadius: 10,
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <MaterialCommunityIcons
                                  color={"#ffffff"}
                                  name="eye-outline"
                                  size={25}
                                />
                              </Pressable>
                            </View>
                          </View>
                        </Card>
                      ))}
                  </View>
                </ScrollView>
              </>
            )}
          </SafeAreaView>
        </>
      )}
      <AlertWithAnimation
        visible={isAlert.active}
        onClose={() => setIsAlert({ active: false, id: 0 })}
        onPress={() => handleDeleteSale(isAlert.id)}
        title="¿Estas seguro que deseas eliminar este registro?"
      />
    </>
  );
};

export default offline_sales;

const styles = StyleSheet.create({
  card: {
    height: "auto",
    marginBottom: 25,
    padding: 5,
    width: "95%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  icon: {
    position: "absolute",
    left: 7,
  },
  filter: {
    justifyContent: "center",
    width: "100%",
    paddingLeft: 20,
    marginTop: 15,
    borderBottomWidth: 0.5,
    height: 56,
    alignItems: "center",
  },
});
