import React, { useEffect, useRef, useState, useContext, useMemo } from "react";
import {
  View,
  SafeAreaView,
  Text,
  Pressable,
  Modal,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import ListBranchProduct from "@/offline/components/sales_offline/Product_sale/ListBranchProductsOffline";
import CartProductsList from "@/offline/components/sales_offline/Product_sale/CartsProductBranchOffline";
import { formatCurrency, formatCurrencyValue } from "@/utils/dte";
import AddSalesSupplement from "@/offline/components/sales_offline/AddSaleSupplement";
import { ICat002TipoDeDocumento } from "@/types/billing/cat-002-tipo-de-documento.types";
import { ITipoTributo } from "@/types/billing/cat-015-tipo-de-tributo.types";
import ElectronicTaxCredit from "@/offline/components/sales_offline/svf_dte_generate/ElectronicTaxCreditOffline";
import LottieView from "lottie-react-native";
import { ThemeContext } from "@/hooks/useTheme";
// import { Button } from "@/~/components/ui/button";
import { Card, FAB } from "react-native-paper";
import { useBranchProductOfflineStore } from "@/offline/store/branch_product_offline.store";
import { Customer } from "@/offline/entity/customer.entity";
import { useUserAndTransmitterOfflineStore } from "@/offline/store/user_and_transmitter_offline.store";
import ElectronicInvoice from "@/offline/components/sales_offline/svf_dte_generate/ElectronicInvoiceOffline";
import { ICondicionDeLaOperacion } from "@/types/billing/cat-016-condicion-de-la-operacion.types";
import { returnTypeCustomer } from "@/utils/filters";
import SpinnerInitPage from "@/components/Global/SpinnerInitPage";
import DetailsProduct from "@/components/sales/sales_products/DetailsProduct";
import Button from "@/components/Global/components_app/Button";
import ButtonForCard from "@/components/Global/components_app/ButtonForCard";
const offline_make_sales = () => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [showModalSale, setShowModalSale] = useState(false);
  const [focusButton, setFocusButton] = useState(false);
  const [customer, setCustomer] = useState<Customer>();
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
  const { OnGetTransmitter, transmitter } = useUserAndTransmitterOfflineStore();
  const { cart_products, emptyCart } = useBranchProductOfflineStore();
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
  const totalAPagar = useMemo(() => {
    return cart_products
      .map((a) => Number(a.price) * Number(a.quantity))
      .reduce((a, b) => a + b, 0);
  }, [cart_products, typeDocument, customer]);

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
    setConditionPayment({
      codigo: "1",
      id: 1,
      isActivated: true,
      valores: "Contado",
    });
    emptyCart();
    setShowModalSale(false);
  };
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
        <SafeAreaView
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            backgroundColor: "#fff",
          }}
        >
          <View
            style={{ width: "100%", height: "100%", paddingHorizontal: 20 }}
          >
            <View
              style={{
                marginLeft: 290,
              }}
            >
              <View>
                <ButtonForCard
                  onPress={() => {
                    setShowModal(true);
                  }}
                  icon="cart-outline"
                />
              </View>
            </View>
            {cart_products && cart_products.length > 0 ? (
              <CartProductsList handleReset={handleReset} />
            ) : (
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
                  source={require("../../assets/gif_json/bx8ntOOR1D.json")}
                />
              </View>
            )}
            <DetailsProduct
              buttonAction={() => setShowModalSale(true)}
              total={formatCurrency(totalAPagar)}
              montoDescuento={0}
              cantidad={calcQuantityProduct()}
            />
          </View>
        </SafeAreaView>
      )}
      <Modal visible={showModal} animationType="fade">
        <Pressable
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
          />
        </Pressable>
        <View
          style={{
            width: "100%",
            height: "100%",
            paddingHorizontal: 20,
            marginTop: 45,
          }}
        >
          <ListBranchProduct />
        </View>
      </Modal>
      <Modal visible={showModalSale} animationType="fade">
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
            <AddSalesSupplement
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
              conditionPayment={conditionPayment}
              setConditionPayment={setConditionPayment}
              totalUnformatted={totalAPagar}
              setFocusButton={setFocusButton}
            />
          </View>
          <>
            {typeDocument &&
              (typeDocument.codigo === "03" ? (
                <>
                  <ElectronicTaxCredit
                    clearAllData={handleReset}
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
        </>
      </Modal>
    </>
  );
};

export default offline_make_sales;

const styles = StyleSheet.create({
  inputWrapper: {
    position: "relative",
    width: "100%",
    height: 50,
    justifyContent: "center",
    marginBottom: 15,
  },
  icon: {
    position: "absolute",
    left: 7,
    top: "50%",
    transform: [{ translateY: -15 }],
  },
  input: {
    height: "100%",
    paddingLeft: 40,
    borderColor: "#D9D9DA",
    borderWidth: 1,
    borderRadius: 15,
  },
});
