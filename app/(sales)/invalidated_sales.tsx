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
import React, { useContext, useEffect, useState } from "react";
import { SheetManager } from "react-native-actions-sheet";
import { formatDate, verifyApplyAnulation } from "@/utils/date";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import SpinnerInitPage from "@/components/Global/SpinnerInitPage";
import { useFocusEffect } from "expo-router";
import { useSaleStore } from "../../store/sale.store";
import { StatusBar } from "expo-status-bar";
import { ISale } from "@/types/sale/sale.types";
import Invalidations from "../../components/Invalidations/Invalidations";
import SpinLoading from "@/components/Global/SpinLoading";
import { get_branch_id, get_configuration } from "@/plugins/async_storage";
import { generate_json } from "@/plugins/DTE/GeneratePDFGeneral";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import Card from "@/components/Global/components_app/Card";
import { formatCurrency } from "@/utils/dte";
import { Chip } from "react-native-paper";
import AnimatedButton from "@/components/Global/AnimatedButtom";
import { ThemeContext } from "@/hooks/useTheme";
import Pagination from "@/components/Global/Pagination";

const processed_sales = () => {
  const [startDate, setStartDate] = useState(formatDate());
  const [endDate, setEndDate] = useState(formatDate());
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalInvalidations, setModalInvdalidation] = useState(false);
  const [modalDebitNote, setModalDebitNote] = useState(false);
  const [screenChange, setsCreenChange] = useState(false);
  const [spinButton, setSpinButton] = useState(false);
  const [message, setMessage] = useState("Esperando");
  const [sale, setSale] = useState<ISale>();
  const { GetPaginatedSales, is_loading, sales, pagination_sales } =
    useSaleStore();
  const { OnImgPDF, img_invalidation, img_logo } = useSaleStore();
  const { theme } = useContext(ThemeContext);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = pagination_sales.totalPag ?? 1;

  useEffect(() => {
    (async () => {
      await get_configuration().then((data) => {
        OnImgPDF(String(data?.logo));
      });
    })();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
          await GetPaginatedSales(
            Number(id),
            currentPage,
            5,
            startDate,
            endDate,
            1
          );
        }
      });
    })();
    setRefreshing(false);
  }, [refreshing, currentPage]);

  const handleVerifyIvalidation = (sale: ISale) => {
    const result = verifyApplyAnulation(
      sale.tipoDte,
      `${sale.fecEmi}T${sale.horEmi}`
    );
    if (result) {
      setSale(sale);
      setModalInvdalidation(true);
    }
  };

  const handlePDF = async (
    pathJso: string,
    SaleDte: string,
    codigoGeneracion: string
  ) => {
    setSpinButton(true);
    if (!img_logo) {
      ToastAndroid.show("No se encontró el logo", ToastAndroid.LONG);
      return;
    }
    await generate_json(
      pathJso,
      SaleDte,
      img_invalidation,
      img_logo,
      true,
      codigoGeneracion
    )
      .then((data) => {
        if (data?.ok) {
          setSpinButton(false);
        }
      })
      .catch(() => {
        setSpinButton(false);
      });
  };

  return (
    <>
      {loading ? (
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
        <>
          <SafeAreaView
            style={{
              flex: 1,
              width: "100%",
              height: "100%",
              backgroundColor: "#fff",
              paddingHorizontal: 8,
            }}
          >
            <StatusBar style="dark" />

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
            </View>

            <ScrollView
              style={{
                flex: 1,
                marginTop: 5,
                marginBottom: 5,
              }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => setRefreshing(true)}
                />
              }
            >
              {loading === false && is_loading ? (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <View
                    style={{
                      width: "100%",
                      height: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <SpinLoading is_showing={is_loading} />
                  </View>
                </View>
              ) : (
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
                          <Text style={{ fontWeight: "600", color: "#4B5563" }}>
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
                          <View style={styles.chip}>
                            <Chip
                              selectedColor="#fff"
                              style={{ backgroundColor: "#e12642" }}
                            >
                              {sale.salesStatus.name}
                            </Chip>
                          </View>
                        </View>
                      </Card>
                    ))}
                </View>
              )}
            </ScrollView>
            <>
              {sales.length > 0 && (
                <>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
              )}
            </>
          </SafeAreaView>
          <Modal visible={modalInvalidations} animationType="slide">
            {screenChange ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size={"large"} />
                <Text
                  style={{
                    fontSize: 18,
                    marginTop: 12,
                  }}
                >
                  {message}
                </Text>
              </View>
            ) : (
              <Invalidations
                sale={sale}
                setModal={setModalInvdalidation}
                setRefreshing={setRefreshing}
                setMessage={setMessage}
                setsCreenChange={setsCreenChange}
              />
            )}
          </Modal>
          <Modal visible={modalDebitNote} animationType="slide">
            {/* <DebitNote setModalDebitNote={setModalDebitNote} /> */}
          </Modal>
        </>
      )}
    </>
  );
};

export default processed_sales;

const styles = StyleSheet.create({
  filter: {
    justifyContent: "center",
    width: "100%",
    paddingLeft: 20,
    marginTop: 15,
    borderBottomWidth: 0.5,
    height: 56,
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
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 20,
  },
  chip: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
});
