import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { SheetManager } from "react-native-actions-sheet";
import { formatDate, verifyApplyAnulation } from "@/utils/date";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import SpinnerInitPage from "@/components/Global/SpinnerInitPage";
import { useFocusEffect } from "expo-router";
import { useSaleStore } from "../../store/sale.store";
import { StatusBar } from "expo-status-bar";
import { ISale } from "@/types/sale/sale.types";
import Invalidations from "../../components/sales/svf_dte_generate/Invalidations";
import SpinLoading from "@/components/Global/SpinLoading";
import ElectronicDTEContingency from "@/components/sales/svf_dte_generate/ElectronicDTEContingency";
import { IEmployee } from "@/types/employee/employee.types";
import { get_branch_id } from "@/plugins/async_storage";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import AnimatedButton from "@/components/Global/AnimatedButtom";
import { ThemeContext } from "@/hooks/useTheme";
import Card from "@/components/Global/components_app/Card";
import { formatCurrency } from "@/utils/dte";
import ButtonForCard from "@/components/Global/components_app/ButtonForCard";
import SpinnerButton from "@/components/Global/SpinnerButton";
import { generate_json } from "@/plugins/DTE/GeneratePDFGeneral";

const processed_sales = () => {
  const [startDate, setStartDate] = useState(formatDate());
  const [endDate, setEndDate] = useState(formatDate());
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalContingency, setModalContingency] = useState(false);
  const [spinButton, setSpinButton] = useState({ loading: false, index: "" });
  const [infoContingency, setInfoContingecy] = useState({
    saleDTE: "",
    pathJson: "",
    box_id: 0,
    customer_id: 0,
    employee: 0,
  });

  const { theme } = useContext(ThemeContext);

  const { GetPaginatedSales, is_loading, sales, img_invalidation, img_logo } =
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
          await GetPaginatedSales(Number(id), 1, 5, startDate, endDate, 3);
        }
      });
    })();
    setRefreshing(false);
  }, [refreshing]);

  const handlePDF = async (
    pathJso: string,
    SaleDte: string,
    codigoGeneracion: string,
    index: string
  ) => {
    setSpinButton({ loading: true, index: index });
    // if (!img_logo) {
    //   ToastAndroid.show("No se encontró el logo", ToastAndroid.LONG);
    //   setSpinButton({ loading: false, index: index });
    //   return;
    // }
    await generate_json(
      pathJso,
      SaleDte,
      img_invalidation,
      img_logo!,
      false,
      codigoGeneracion
    )
      .then((data) => {
        if (data?.ok) {
          setSpinButton({ loading: false, index: index });
        }
      })
      .catch(() => {
        setSpinButton({ loading: false, index: index });
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
                  />
                  {/* <AnimatedButton
                    handleClick={pickDocument}
                    iconName="database-arrow-down"
                    buttonColor={theme.colors.third}
                    width={40}
                    height={40}
                    right={10}
                    size={25}
                    top={0}
                  /> */}
                </View>
                {/* <Pressable
                  onPress={() =>
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
                    })
                  }
                  style={styles.filter}
                >
                  <Text
                    style={{
                      color: "#718096",
                      fontSize: 16,
                    }}
                  >
                    Filtros disponibles
                  </Text>
                  <Pressable
                    style={{
                      position: "absolute",
                      right: 20,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="filter"
                      size={25}
                      color="#607274"
                    />
                  </Pressable>
                </Pressable> */}

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
                      sales &&
                      sales.map((sale, index) => (
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
                                color={"#AFB0B1"}
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
                                color={"#AFB0B1"}
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
                                  color={"#AFB0B1"}
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
                                  color={"#AFB0B1"}
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
                                  color={"#AFB0B1"}
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
                                  color={"#AFB0B1"}
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
                            <View style={stylesGlobals.ViewGroupButton}>
                              {spinButton &&
                              spinButton.loading &&
                              Number(spinButton.index) === index ? (
                                <Pressable
                                  style={{
                                    flexDirection: "row",
                                    marginTop: 5,
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <SpinnerButton />
                                </Pressable>
                              ) : (
                                <ButtonForCard
                                  onPress={() =>
                                    handlePDF(
                                      sale.pathJson,
                                      sale.tipoDte,
                                      sale.codigoGeneracion,
                                      String(index)
                                    )
                                  }
                                  icon={"eye-outline"}
                                />
                              )}
                              <ButtonForCard
                                onPress={() => {
                                  setModalContingency(true);
                                  setInfoContingecy({
                                    saleDTE: sale.tipoDte,
                                    pathJson: sale.pathJson,
                                    customer_id: Number(sale.customerId),
                                    box_id: sale.boxId,
                                    employee: sale.employeeId,
                                  });
                                }}
                                color={theme.colors.danger}
                                icon={"database-plus"}
                              />
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
              infoContingency={infoContingency}
              setModalContingency={setModalContingency}
            />
          </Modal>
        </>
      )}
    </>
  );
};

export default processed_sales;

const styles = StyleSheet.create({
  filter: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    paddingLeft: 20,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
    height: 56,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
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
    top: "30%",
    transform: [{ translateY: -15 }],
  },
});
