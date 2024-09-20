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
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SheetManager } from "react-native-actions-sheet";
import { formatDate, verifyApplyAnulation } from "@/utils/date";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import SpinnerInitPage from "@/components/Global/SpinnerInitPage";
import { useFocusEffect } from "expo-router";
import { useSaleStore } from "../../store/sale.store";
import { StatusBar } from "expo-status-bar";
import { ISale } from "@/types/sale/sale.types";
import Invalidations from "../../components/Invalidations/Invalidations";
import DebitNote from "../../components/sales/svf_dte_generate/DebitNote";
import CreditNote from "../../components/sales/svf_dte_generate/CreditNote";
import SpinLoading from "@/components/Global/SpinLoading";
import { get_branch_id, get_configuration } from "@/plugins/async_storage";
import { generate_json } from "@/plugins/DTE/GeneratePDFGeneral";
import AnimatedButton from "@/components/Global/AnimatedButtom";
import { ThemeContext } from "@/hooks/useTheme";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { SVFE_FC } from "@/types/svf_dte/fc.types";
import { SVFE_CF } from "@/types/svf_dte/cf.types";
import SaleContingenceF from "@/components/sales/svf_for_json/SaleContingenceF";
import SaleContingenceCCF from "@/components/sales/svf_for_json/SaleContingenceCCF";
import LoadingSaleForJson from "@/components/Global/loading_json/LoadingSaleForJson";
import { useCustomerStore } from "@/store/customer.store";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import Card from "@/components/Global/components_app/Card";
import { formatCurrency } from "@/utils/dte";
import SpinnerButton from "@/components/Global/SpinnerButton";
import ButtonForCard from "@/components/Global/components_app/ButtonForCard";
import { useAuthStore } from "@/store/auth.store";
import { IPayloadCustomer } from "@/types/customer/customer.types";
import { useEmployeeStore } from "@/store/employee.store";

const processed_sales = () => {
  const [startDate, setStartDate] = useState(formatDate());
  const [endDate, setEndDate] = useState(formatDate());
  const [loading, setLoading] = useState(false);
  const [spinButton, setSpinButton] = useState({ loading: false, index: "" });
  const [refreshing, setRefreshing] = useState(false);
  const [modalInvalidations, setModalInvdalidation] = useState(false);
  const [modalDebitNote, setModalDebitNote] = useState(false);
  const [screenChange, setsCreenChange] = useState(false);
  const [message, setMessage] = useState("Esperando");
  const [saleId, setSaleId] = useState(0);
  const [sale, setSale] = useState<ISale>();
  const [note, setNote] = useState("");
  const [showModalDTE, setShowModalDTE] = useState(false);
  const [json, setJson] = useState<string>("");
  const [jsonSaleF, setJsonSaleF] = useState<SVFE_FC>();
  const [jsonSaleCCF, setJsonSaleCCF] = useState<SVFE_CF>();
  const [typeDte, setTypeDte] = useState("");
  const [loadingJson, setLoadingJson] = useState(false);
  const [salesProgress, setSalesProgress] = useState(false);

  const { GetPaginatedSales, is_loading, sales } = useSaleStore();
  const { OnImgPDF, img_invalidation, img_logo } = useSaleStore();
  const { theme } = useContext(ThemeContext);
  const { OnGetCustomersList } = useCustomerStore();
  const { personalization } = useAuthStore();
  // useEffect(() => {
  //   (async () => {
  //     await OnImgPDF(personalization !== undefined ? personalization.logo : "N/A");
  //   })();
  // }, []);
  const { OnGetEmployeesList } = useEmployeeStore();

  useEffect(() => {
    OnGetEmployeesList();
  }, []);

  const get_logo = async () => {
    if (personalization) {
      await OnImgPDF(personalization.logo);
    } else {
      const logo = require("../../assets/images/logo/react-logo.png");
      await OnImgPDF(logo);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      setRefreshing(true);
      get_logo();
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }, [])
  );
  useEffect(() => {
    (async () => {
      await get_branch_id().then(async (id) => {
        if (id !== null && id !== undefined) {
          await GetPaginatedSales(Number(id), 1, 5, startDate, endDate, 2);
        }
      });
    })();
    OnGetCustomersList();
    setRefreshing(false);
  }, [refreshing]);

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
    codigoGeneracion: string,
    index: string
  ) => {
    setSpinButton({ loading: true, index: index });
    if (!img_logo) {
      ToastAndroid.show("No se encontró el logo", ToastAndroid.LONG);
      setSpinButton({ loading: false, index: index });
      return;
    }
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

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
    });

    if (result) {
      if (result.assets) {
        const { uri } = result.assets[0];
        const content_json = await FileSystem.readAsStringAsync(uri, {
          encoding: "utf8",
        });
        if (content_json !== "") {
          setLoadingJson(true);
          setShowModalDTE(true);
          setJson(content_json);
        }
      }
    }
  };
  useEffect(() => {
    if (json !== "") {
      const fetchData = async () => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const jsonData = JSON.parse(json);
          const dte = jsonData.identificacion.tipoDte;
          setTypeDte(dte);
          if (dte === "01") {
            const data = JSON.parse(json) as SVFE_FC;
            setJsonSaleF(data);
            setLoadingJson(false);
          } else if (dte === "03") {
            const data = JSON.parse(json) as SVFE_CF;
            setJsonSaleCCF(data);
            setLoadingJson(false);
          } else {
          }
        } catch (error) {
          console.error(error);
        }
      };

      fetchData();
    }
  }, [json]);

  const resetSaleForJson = () => {
    setSalesProgress(false);
    setLoadingJson(false);
    setShowModalDTE(false);
    setTypeDte("");
    setJson("");
    setMessage("Esperando");
    setJsonSaleF(undefined);
    setJsonSaleCCF(undefined);
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
                  <AnimatedButton
                    handleClick={pickDocument}
                    iconName="database-arrow-down"
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
                                onPress={() => handleVerifyIvalidation(sale)}
                                color={theme.colors.danger}
                                icon={"file-remove-outline"}
                              />
                              {sale.tipoDte === "03" && (
                                <ButtonForCard
                                  onPress={() => {
                                    SheetManager.show("note-sheet", {
                                      payload: {
                                        handleConfirm(note: string) {
                                          setModalDebitNote(true);
                                          setSaleId(sale.id);
                                          setNote(note);
                                          SheetManager.hide("note-sheet");
                                        },
                                      },
                                    });
                                  }}
                                  color={theme.colors.third}
                                  icon={"plus"}
                                />
                              )}
                            </View>
                          </View>
                        </Card>
                      ))}
                  </View>
                </ScrollView>
              </>
            )}
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
          {note === "01" ? (
            <Modal visible={modalDebitNote} animationType="slide">
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
                    onPress={() => {
                      setModalDebitNote(false);
                    }}
                  />
                </Pressable>
                <Text style={{ fontSize: 20, top: 15, color: "white" }}>
                  Nota de débito
                </Text>
              </View>
              <DebitNote
                setModalDebitNote={setModalDebitNote}
                saleId={saleId}
              />
            </Modal>
          ) : (
            <Modal visible={modalDebitNote} animationType="slide">
              <CreditNote
                setModalCreditNote={setModalDebitNote}
                saleId={saleId}
              />
            </Modal>
          )}
        </>
      )}
      <Modal visible={showModalDTE} animationType="fade">
        {loadingJson ? (
          <>
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#fff",
              }}
            >
              <LoadingSaleForJson />
            </View>
          </>
        ) : (
          <>
            {salesProgress ? (
              <>
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
              </>
            ) : (
              <>
                <Pressable
                  onPress={resetSaleForJson}
                  style={styles.closeButton}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={30}
                    color="#2C3377"
                  />
                </Pressable>
                {typeDte === "01" ? (
                  <SaleContingenceF
                    resetSaleForJson={resetSaleForJson}
                    jsonSaleF={jsonSaleF!}
                    setMessage={setMessage}
                    setSalesProgress={setSalesProgress}
                  />
                ) : (
                  <SaleContingenceCCF
                    resetSaleForJson={resetSaleForJson}
                    jsonSaleCCF={jsonSaleCCF!}
                    setMessage={setMessage}
                    setSalesProgress={setSalesProgress}
                  />
                )}
              </>
            )}
          </>
        )}
      </Modal>
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
});
