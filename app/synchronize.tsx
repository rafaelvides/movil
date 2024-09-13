import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react-native";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
// import { useSalesOfflineStore } from "@/offline/store/sales_offline.store";
import { useFocusEffect } from "expo-router";
import { useBillingStore } from "@/store/billing/billing.store";
// import ComplementSale from "@/offline/components/sales/ComplementSale";
import { useTransmitterStore } from "@/store/transmitter.store";
import { get_box_data } from "@/plugins/async_storage";
import { useEmployeeStore } from "@/store/employee.store";
import SpinnerInitPage from "@/components/Global/SpinnerInitPage";
import { ThemeContext } from "@/hooks/useTheme";
import ComplementSale from "@/offline/components/sales_offline/ComplementSale";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import Button from "@/components/Global/components_app/Button";
import { useSalesOfflineStore } from "@/offline/store/sale_offline.store";
import Card from "@/components/Global/components_app/Card";
import Not_data from "@/components/Global/Global_Animation/Not_data";

const synchronize = () => {
  const [showModalContingencia, setShowModalContingencia] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [is_refresh, setIsRefresh] = useState(false);
  const [isReloadind, setIsReloading] = useState(false);
  const { OnGetSalesOfflinePagination, is_loading, sales_offline_pag } =
    useSalesOfflineStore();
  const { OnGetCat005TipoDeContingencia } = useBillingStore();
  const { OnGetTransmitter, transmitter } = useTransmitterStore();
  const { OnGetEmployeesList } = useEmployeeStore();
  const { theme } = useContext(ThemeContext);

  useFocusEffect(
    React.useCallback(() => {
      setIsRefresh(true);
      setIsReloading(true);
      setTimeout(() => {
        setIsReloading(false);
      }, 1000);
    }, [])
  );

  useEffect(() => {
    paginated_sale();
    OnGetCat005TipoDeContingencia();
    OnGetTransmitter();
    OnGetEmployeesList();
    setIsRefresh(false);
  }, [is_refresh]);
  const paginated_sale = async () => {
    await get_box_data().then((data) => {
      if (!data?.id) {
        ToastAndroid.show("No tienes caja asignada", ToastAndroid.LONG);
        return;
      } else {
        OnGetSalesOfflinePagination(data?.id, "", String(data.date), "", 1, 5);
      }
    });
  };
  const UpdatePagingProcess = () => {
    setIsRefresh(true);
    setShowModalContingencia(false);
    setIsProcessing(false);
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
        <SafeAreaView style={stylesGlobals.safeAreaViewStyle}>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={is_refresh}
                onRefresh={() => setIsRefresh(true)}
              />
            }
          >
            <View style={stylesGlobals.viewScroll}>
              {sales_offline_pag.length > 0 ? (
                <>
                  {sales_offline_pag.map((sale, index) => (
                    <Card key={index} style={stylesGlobals.styleCard}>
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ fontWeight: "600", color: "#4B5563" }}>
                          Ventas: #{sale.id}
                        </Text>
                      </View>
                      <View style={stylesGlobals.ViewCard}>
                        <MaterialCommunityIcons
                          color={theme.colors.secondary}
                          name="account-tie-outline"
                          size={22}
                          style={{
                            position: "absolute",
                            left: 7,
                          }}
                        />
                        <Text style={stylesGlobals.textCard}>
                          {sale.transmitter.nombre}
                        </Text>
                      </View>
                      <View style={stylesGlobals.ViewCard}>
                        <MaterialCommunityIcons
                          color={theme.colors.secondary}
                          name="account-supervisor-circle"
                          size={22}
                          style={{
                            position: "absolute",
                            left: 7,
                          }}
                        />
                        <Text style={stylesGlobals.textCard}>
                          Nombre del cliente: {sale.customer.nombre}
                        </Text>
                      </View>
                      <View style={stylesGlobals.ViewCard}>
                        <Ionicons
                          name="document-text-outline"
                          size={22}
                          color={theme.colors.secondary}
                          style={{
                            position: "absolute",
                            left: 7,
                          }}
                        />
                        <Text style={stylesGlobals.textCard}>
                          Tipo:{" "}
                          {sale.tipoDte === "01" ? "Factura Electrónica" : "Crédito fiscal"}
                        </Text>
                      </View>
                      <View style={stylesGlobals.ViewCard}>
                        <MaterialCommunityIcons
                          name="clipboard-text-clock-outline"
                          size={22}
                          color={theme.colors.secondary}
                          style={{
                            position: "absolute",
                            left: 7,
                          }}
                        />
                        <Text style={stylesGlobals.textCard}>
                          Hora: {sale.horEmi.toString()}
                        </Text>
                      </View>
                      <View style={stylesGlobals.ViewCard}>
                        <MaterialCommunityIcons
                          name="label-percent"
                          size={22}
                          color={theme.colors.secondary}
                          style={{
                            position: "absolute",
                            left: 7,
                          }}
                        />
                        <Text style={stylesGlobals.textCard}>
                          Descuento: {sale.porcentajeDescuento} %
                        </Text>
                      </View>
                      <View style={stylesGlobals.ViewCard}>
                        <FontAwesome5
                          name="money-bill-alt"
                          size={22}
                          color={theme.colors.secondary}
                          style={{
                            position: "absolute",
                            left: 7,
                          }}
                        />
                        <Text style={stylesGlobals.textCard}>
                          Total: ${sale.totalPagar}
                        </Text>
                      </View>
                    </Card>
                  ))}
                </>
              ) : (
                <Not_data />
              )}
            </View>
          </ScrollView>
          <View
            style={{
              width: "100%",
              backgroundColor: "#fff",
              borderTopWidth: 1,
              borderColor: "#ddd",
              padding: 5,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {isProcessing ? (
              <View
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                <ActivityIndicator size="large"></ActivityIndicator>
                <Text>Sincronizando...</Text>
              </View>
            ) : (
              <>
                <View
                  style={{
                    ...stylesGlobals.viewBotton,
                    marginBottom: 20,
                    marginTop: 20,
                  }}
                >
                  <Button
                    withB={390}
                    onPress={() => setShowModalContingencia(true)}
                    Title="Iniciar sincronización"
                    color={theme.colors.third}
                  />
                </View>
                {/* <Pressable
                    onPress={() => {
                      setShowModalContingencia(true);
                    }}
                    style={{
                      width: "100%",
                      padding: 16,
                      borderRadius: 4,
                      marginTop: 8,
                      backgroundColor: "#1d4ed8",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      Iniciar sincronización
                    </Text>
                  </Pressable> */}
              </>
            )}
          </View>
          <Modal visible={showModalContingencia} animationType="fade">
            <View
              style={{
                borderRadius: 25,
                width: "100%",
                top: -5,
                height: 130,
                backgroundColor: theme.colors.third,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Pressable
                style={{
                  position: "absolute",
                  right: 20,
                  top: 20,
                }}
              >
                <MaterialCommunityIcons
                  color={"white"}
                  name="close"
                  size={30}
                  onPress={() => setShowModalContingencia(false)}
                />
              </Pressable>
              <Text style={{ fontSize: 20, top: 15, color: "white" }}>
                Nuevo evento de contingencia
              </Text>
            </View>
            <ComplementSale
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
              UpdatePagingProcess={UpdatePagingProcess}
              processed_sales={sales_offline_pag}
              transmitter={transmitter}
            />
          </Modal>
        </SafeAreaView>
      )}
    </>
  );
};

export default synchronize;

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
  input: {
    height: "100%",
    paddingLeft: 15,
    borderColor: "#D9D9DA",
    borderWidth: 1,
    borderRadius: 15,
    fontSize: 16,
  },
});
