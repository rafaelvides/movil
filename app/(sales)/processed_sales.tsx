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
import Invalidations from "../../components/sales/svf_dte_generate/Invalidations";
import DebitNote from "../../components/sales/svf_dte_generate/DebitNote";
import CreditNote from "../../components/sales/svf_dte_generate/CreditNote";
import SpinLoading from "@/components/Global/SpinLoading";
import { get_configuration } from "@/plugins/async_storage";
import { generate_json } from "@/plugins/DTE/GeneratePDFGeneral";
import SpinnerButton from "@/components/Global/SpinnerButton";
import AnimatedButton from "@/components/Global/AnimatedButtom";
import { ThemeContext } from "@/hooks/useTheme";
import SaleContingenceForJSON from "@/components/sales/SaleContingeceForJSON";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { SVFE_FC } from "@/types/svf_dte/fc.types";
import { SVFE_CF, SVFE_CF_SEND } from "@/types/svf_dte/cf.types";
import SaleContingenceF from "@/components/sales/svf_for_json/SaleContingenceF";
import SaleContingenceCCF from "@/components/sales/svf_for_json/SaleContingenceCCF";
import LoadingSaleForJson from "@/components/Global/loading_json/LoadingSaleForJson";
import { formatCurrency } from "@/utils/dte";
import { useCustomerStore } from "@/store/customer.store";
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

  useEffect(() => {
    (async () => {
      await get_configuration().then((data) => {
        OnImgPDF(String(data?.logo));
      });
    })();
  }, []);
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
    GetPaginatedSales(1, 1, 5, startDate, endDate, 2);
    OnGetCustomersList()
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
      img_logo,
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
    setJson("");
    setTypeDte("");
    setMessage("Esperando");
    setJsonSaleF(undefined);
    setJsonSaleCCF(undefined);
    setSalesProgress(false)
    setLoadingJson(false);
    setShowModalDTE(false);
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
            <View style={styles.filter}>
              <View
                style={{
                  position: "absolute",
                  justifyContent: "space-between",
                  gap: 100,
                }}
              >
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
                  width={42}
                  height={42}
                  right={100}
                  size={30}
                  top={0}
                />
                <AnimatedButton
                  handleClick={pickDocument}
                  iconName="database-arrow-down"
                  buttonColor={theme.colors.third}
                  width={42}
                  height={42}
                  right={100}
                  size={30}
                  left={100}
                  top={0}
                />
              </View>
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
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 100,
                  }}
                >
                  {!is_loading &&
                    sales &&
                    sales.map((sale, index) => (
                      <></>
                    ))}
                </View>
              )}
            </ScrollView>
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
                  <SaleContingenceCCF setShowModalDTE={setShowModalDTE} />
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
    top: "30%",
    transform: [{ translateY: -15 }],
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 20,
  },
});
