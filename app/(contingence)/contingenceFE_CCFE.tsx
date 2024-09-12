import {
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { SheetManager } from "react-native-actions-sheet";
import { formatDate } from "@/utils/date";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import SpinnerInitPage from "@/components/Global/SpinnerInitPage";
import { useFocusEffect } from "expo-router";
import { useSaleStore } from "../../store/sale.store";
import { StatusBar } from "expo-status-bar";
import SpinLoading from "@/components/Global/SpinLoading";
import ElectronicDTEContingency from "@/components/sales/svf_dte_generate/ElectronicDTEContingency";
import { get_branch_id } from "@/plugins/async_storage";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import AnimatedButton from "@/components/Global/AnimatedButtom";
import { ThemeContext } from "@/hooks/useTheme";
import Card from "@/components/Global/components_app/Card";
import { formatCurrency } from "@/utils/dte";

const contingenceFE_CCFE = () => {

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalContingency, setModalContingency] = useState(false);

  const { theme } = useContext(ThemeContext);

  const { is_loading, onGetSalesContingence, contingence_sales } =
    useSaleStore();

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
      await get_branch_id().then(async (id) => {
        if (id !== null && id !== undefined) {
          await onGetSalesContingence(Number(id));
          // await GetPaginatedSales(Number(id), 1, 5, startDate, endDate, 3);
        }
      });
    })();
    setRefreshing(false);
  }, [refreshing]);

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
                  {/* <AnimatedButton
                    handleClick={() => {
                      SheetManager.show("sales-filters-sheet", {
                        payload: {
                          setEndDate,
                          startDate: startDate,
                          setStartDate,
                          endDate: endDate,
                          handleConfirm(startDate, endDate) {
                            setStartDate(startDate);
                            setEndDate(endDate);
                            setRefreshing(true);
                            SheetManager.hide("sales-filters-sheet");
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
                  /> */}
                  <AnimatedButton
                    handleClick={() => {
                      setModalContingency(true);
                      // setInfoContingecy({
                      //   saleDTE: sale.tipoDte,
                      //   pathJson: sale.pathJson,
                      //   customer_id: Number(sale.customerId),
                      //   box_id: sale.boxId,
                      //   employee: sale.employeeId,
                      // });
                    }}
                    iconName="database-plus"
                    buttonColor={theme.colors.third}
                    width={40}
                    height={40}
                    right={10}
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
                      contingence_sales &&
                      contingence_sales.map((sale, index) => (
                        <Card key={index} style={stylesGlobals.styleCard}>
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
                            <View style={stylesGlobals.ViewCard}>
                              <MaterialCommunityIcons
                                color={theme.colors.secondary}
                                name="card-text-outline"
                                size={22}
                                style={styles.icon}
                              />
                              <Text style={stylesGlobals.textCard}>
                                {`${sale.codigoGeneracion.slice(0, 30)}...`}
                              </Text>
                            </View>
                            <View style={stylesGlobals.ViewCard}>
                              <MaterialCommunityIcons
                                color={theme.colors.secondary}
                                name="account"
                                size={22}
                                style={styles.icon}
                              />
                              <Text style={stylesGlobals.textCard}>
                                {sale.numeroControl}
                              </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: "row",
                                marginRight: 5,
                                marginTop: 15,
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <MaterialCommunityIcons
                                  color={theme.colors.secondary}
                                  name="calendar-month"
                                  size={22}
                                  style={styles.icon}
                                />
                                <Text
                                  style={{
                                    marginLeft: 50,
                                    fontWeight: "400",
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
                                  color={theme.colors.secondary}
                                  name="clipboard-clock-outline"
                                  size={22}
                                  style={styles.icon}
                                />
                                <Text
                                  style={{
                                    marginLeft: 50,
                                    fontWeight: "400",
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
                                  color={theme.colors.secondary}
                                  name="ticket-percent"
                                  size={22}
                                  style={styles.icon}
                                />
                                <Text
                                  style={{
                                    width: 70,
                                    marginLeft: 45,
                                    fontWeight: "400",
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
                                  color={theme.colors.secondary}
                                  name="cash"
                                  size={22}
                                  style={{ position: "absolute", left: 6 }}
                                />
                                <Text
                                  style={{
                                    width: 80,
                                    marginLeft: 40,
                                    fontWeight: "400",
                                    color: "#4B5563",
                                  }}
                                >
                                  {formatCurrency(Number(sale.totalPagar))}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </Card>
                      ))}
                  </View>
                </ScrollView>
              </>
            )}
          </SafeAreaView>
          <Modal visible={modalContingency} animationType="fade">
            <ElectronicDTEContingency
              // infoContingency={infoContingency}
              setModalContingency={setModalContingency}
            />
          </Modal>
        </>
      )}
    </>
  );
};

export default contingenceFE_CCFE;

const styles = StyleSheet.create({
  icon: {
    position: "absolute",
    left: 7,
  },
});
