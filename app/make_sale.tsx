import React, { useEffect, useRef, useState, useContext, useMemo } from "react";
import {
  View,
  SafeAreaView,
  Text,
  Pressable,
  Modal,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import SpinnerInitPage from "../components/Global/SpinnerInitPage";
import { useFocusEffect } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useBranchProductStore } from "@/store/branch_product.store";
import ListBranchProduct from "../components/sales/sales_products/ListBrachProducts";
import CartProductsList from "../components/sales/sales_products/CartsProductsList";
import { formatCurrency } from "@/utils/dte";
import AddMakeSaleScreen from "../components/sales/AddMakeSaleScreen";
import { ICustomer } from "@/types/customer/customer.types";
import { ICat002TipoDeDocumento } from "@/types/billing/cat-002-tipo-de-documento.types";
import { ITipoTributo } from "@/types/billing/cat-015-tipo-de-tributo.types";
import ElectronicInvoice from "../components/sales/svf_dte_generate/ElectronicInvoice";
import { useTransmitterStore } from "../store/transmitter.store";
import ElectronicTaxCredit from "../components/sales/svf_dte_generate/ElectronicTaxCredit";
import LottieView from "lottie-react-native";
import { ThemeContext } from "@/hooks/useTheme";
import { ICondicionDeLaOperacion } from "@/types/billing/cat-016-condicion-de-la-operacion.types";
import { returnTypeCustomer } from "@/utils/filters";
import DetailsProduct from "@/components/sales/sales_products/DetailsProduct";

const make_sale = () => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [showModalSale, setShowModalSale] = useState(false);
  const [loadingSaveSale, setLoadingSaveSale] = useState(false);
  const [loadingRevision, setLoadingRevision] = useState(false);
  const [focusButton, setFocusButton] = useState(false);
  const [message, setMessage] = useState("Esperando");
  const [customer, setCustomer] = useState<ICustomer>();
  const [typeDocument, setTypeDocument] = useState<ICat002TipoDeDocumento>({
    codigo: "01",
    id: 1,
    isActivated: true,
    valores: "Factura",
  });
  const [typeTribute, setTypeTribute] = useState<ITipoTributo>({
    codigo: "20",
    id: 1,
    isActivated: true,
    valores: "Impuesto al Valor Agregado 13%",
  });
  const [conditionPayment, setConditionPayment] =
    useState<ICondicionDeLaOperacion>({
      codigo: "1",
      id: 1,
      isActivated: true,
      valores: "Contado",
    });
  const animation = useRef(null);
  const { theme } = useContext(ThemeContext);
  const { cart_products, emptyCart } = useBranchProductStore();

  const totalAPagar = useMemo(() => {
    return cart_products
      .map((a) => Number(a.price) * Number(a.quantity))
      .reduce((a, b) => a + b, 0);
  }, [cart_products, typeDocument, customer]);

  const discountTotal = useMemo(() => {
    return cart_products
      .map((a) => Number(a.monto_descuento) * Number(a.quantity))
      .reduce((a, b) => a + b, 0);
  }, [cart_products]);

  const onePercentRetention = useMemo(() => {
    if (customer && totalAPagar >= 100) {
      const type = customer.tipoContribuyente
        ? returnTypeCustomer(customer.tipoContribuyente)
        : 0;
      if (typeDocument.codigo === "03") {
        if (type === 0) return 0;
        if (type === 1) return totalAPagar * 0.01;
      } else {
        if (type === 1) {
          const iva = Number(totalAPagar.toFixed(2)) / 1.13;
          return iva * 0.01;
        }
      }
      return 0;
    }
    return 0;
  }, [customer, totalAPagar, typeDocument]);

  const iva = totalAPagar * 0.13;
  const totalPagar = totalAPagar - onePercentRetention;
  const totalPagarIva = totalAPagar + iva - onePercentRetention;

  const { OnGetTransmitter, transmitter } = useTransmitterStore();
  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      setRefresh(true);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }, [])
  );
  useEffect(() => {
    OnGetTransmitter();
    setRefresh(false);
  }, [refresh]);

  const [pays, setPays] = useState([
    {
      codigo: "01",
      plazo: "",
      periodo: 0,
      monto: 0,
    },
  ]);
  useEffect(() => {
    if (typeDocument.codigo === "01") {
      setPays([
        {
          codigo: "01",
          plazo: "",
          periodo: 0,
          monto: Number(totalPagar.toFixed(2)),
        },
      ]);
    } else {
      setPays([
        {
          codigo: "01",
          plazo: "",
          periodo: 0,
          monto: Number(totalPagarIva.toFixed(2)),
        },
      ]);
    }
  }, [cart_products, typeDocument, onePercentRetention, totalAPagar]);
  const handleReset = () => {
    setCustomer(undefined);
    setTypeDocument({
      codigo: "01",
      id: 1,
      isActivated: true,
      valores: "Factura",
    });
    setPays([
      {
        codigo: "01",
        plazo: "",
        periodo: 0,
        monto: 0,
      },
    ]);
    setMessage("");
    setLoadingRevision(false);
    setConditionPayment({
      codigo: "1",
      id: 1,
      isActivated: true,
      valores: "Contado",
    });
    // emptyCart();
  };

  const handleAddPay = () => {
    setPays([...pays, { codigo: "01", plazo: "", periodo: 0, monto: 0 }]);
  };

  const onUpdatePeriodo = (index: number, value: number) => {
    const newPays = [...pays];
    newPays[index].periodo = value;
    setPays(newPays);
  };

  const onUpdateMonto = (index: number, value: number) => {
    const newPays = [...pays];
    newPays[index].monto = value;
    setPays(newPays);
  };

  const handleUpdatePlazo = (index: number, value: string) => {
    const newPays = [...pays];
    newPays[index].plazo = value;
    setPays(newPays);
  };

  const handleUpdateTipoPago = (index: number, value: string) => {
    const newPays = [...pays];
    newPays[index].codigo = value;
    setPays(newPays);
  };

  const handleRemovePay = (index: number) => {
    if (pays.length > 1) {
      setPays(pays.filter((_, i) => i !== index));
    }
  };
  const calcQuantityProduct = () => {
    let total = 0;
    cart_products.forEach((product) => {
      total += product.quantity;
    });
    return total;
  };

  return (
    <>
      <StatusBar style="dark" />
      {loading ? (
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
      ) : (
        <>
          <SafeAreaView
            style={{
              flex: 1,
              width: "100%",
              height: "100%",
              backgroundColor: "#fff",
            }}
          >
            <View
              style={{
                width: "100%",
                height: "100%",
                paddingHorizontal: 10,
              }}
            >
              <View
                style={{
                  alignContent: "flex-end",
                  alignItems: "flex-end",
                }}
              >
               
              </View>
              {cart_products && cart_products.length > 0 ? (
                <>
                  <CartProductsList handleReset={handleReset} />
                </>
              ) : (
                <>
                  <View
                    style={{
                      padding: 40,
                      width: "100%",
                      height: "auto",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <LottieView
                      autoPlay
                      ref={animation}
                      style={{
                        marginTop: 50,
                        width: 380,
                        height: 380,
                      }}
                      source={require("../assets/gif_json/bx8ntOOR1D.json")}
                    />
                  </View>
                </>
              )}
              <DetailsProduct
                buttonAction={() => setShowModalSale(true)}
                total={formatCurrency(totalAPagar)}
                montoDescuento={discountTotal.toFixed(2)}
                cantidad={calcQuantityProduct()}
              />
            </View>
          </SafeAreaView>
          <Modal visible={showModal} animationType="fade" >
            {/* <Pressable
              style={{
                position: "absolute",
                right: 10,
                top: 10,
                marginBottom: 40,
              }}
            >
              <MaterialCommunityIcons
                color={"#2C3377"}
                name="close"
                size={30}
                onPress={() => {
                  setShowModal(false);
                }}
              /> */}
            {/* </Pressable> */}
            <View
              // style={{
              //   width: "100%",
              //   height: "100%",
              //   paddingHorizontal: 20,
              //   marginTop: 45,
              // }}
            >
              <ListBranchProduct closeModal={()=> setShowModal(false)}/>
            </View>
          </Modal>
          <Modal visible={showModalSale} animationType="fade">
            {loadingSaveSale ? (
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
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "90%",
                    padding: 32,
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
                      color={"#2C3377"}
                      name="close"
                      size={30}
                      onPress={() => {
                        setShowModalSale(false);
                      }}
                    />
                  </Pressable>
                  <Text style={{ fontSize: 25 }}>Procesar venta</Text>
                  <AddMakeSaleScreen
                    customer={customer}
                    setCustomer={setCustomer}
                    typeDocument={typeDocument}
                    setTypeDocument={setTypeDocument}
                    typeTribute={typeTribute}
                    setTypeTribute={setTypeTribute}
                    handleAddPay={handleAddPay}
                    onUpdatePeriodo={onUpdatePeriodo}
                    onUpdateMonto={onUpdateMonto}
                    handleUpdatePlazo={handleUpdatePlazo}
                    handleUpdateTipoPago={handleUpdateTipoPago}
                    handleRemovePay={handleRemovePay}
                    pays={pays}
                    setConditionPayment={setConditionPayment}
                    conditionPayment={conditionPayment}
                    totalUnformatted={totalPagar}
                    totalPagarIva={totalPagarIva}
                    setFocusButton={setFocusButton}
                    total={discountTotal.toString()}
                  />
                </View>
                {loadingRevision === true ? (
                  <>
                    <View
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                        marginTop: 0,
                      }}
                    >
                      <ActivityIndicator size="large"></ActivityIndicator>
                      <Text>Consultando el documento en hacienda...</Text>
                    </View>
                  </>
                ) : (
                  <>
                    {typeDocument &&
                      (typeDocument.codigo === "03" ? (
                        <>
                          <ElectronicTaxCredit
                            clearAllData={handleReset}
                            setLoadingRevision={setLoadingRevision}
                            setLoadingSave={setLoadingSaveSale}
                            setShowModalSale={setShowModalSale}
                            setMessage={setMessage}
                            customer={customer}
                            typeDocument={typeDocument}
                            transmitter={transmitter}
                            cart_products={cart_products}
                            pays={pays}
                            conditionPayment={conditionPayment.id}
                            typeTribute={typeTribute}
                            focusButton={focusButton}
                            totalUnformatted={totalPagarIva}
                            onePercentRetention={onePercentRetention}
                          />
                        </>
                      ) : (
                        <>
                          <ElectronicInvoice
                            clearAllData={handleReset}
                            setLoadingRevision={setLoadingRevision}
                            setLoadingSave={setLoadingSaveSale}
                            setShowModalSale={setShowModalSale}
                            setMessage={setMessage}
                            customer={customer}
                            typeDocument={typeDocument}
                            transmitter={transmitter}
                            cart_products={cart_products}
                            pays={pays}
                            conditionPayment={conditionPayment.id}
                            totalUnformatted={totalPagar}
                            focusButton={focusButton}
                            onePercentRetention={onePercentRetention}
                          />
                        </>
                      ))}
                  </>
                )}
              </>
            )}
          </Modal>
        </>
      )}
    </>
  );
};

export default make_sale;
