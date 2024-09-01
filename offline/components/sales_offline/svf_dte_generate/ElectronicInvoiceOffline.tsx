import { View, Text, ToastAndroid, Pressable } from "react-native";
import React from "react";
import { ICat002TipoDeDocumento } from "@/types/billing/cat-002-tipo-de-documento.types";
import { ICartProductOffline } from "@/offline/types/branch_product_offline";
import { IFormasDePagoResponse } from "@/types/billing/cat-017-forma-de-pago.types";
import {
  get_box_data,
  get_employee_id,
  get_user,
} from "@/plugins/async_storage";
import { save_local_sale_invoice } from "@/offline/service/sale_local.service";
import { Customer } from "@/offline/entity/customer.entity";
import { Transmitter } from "@/offline/entity/transmitter.entity";
import { generate_factura } from "@/plugins/Offline_DTE/ElectronicInvoiceGenerator_offline";

interface Props {
  customer: Customer | undefined;
  transmitter: Transmitter;
  typeDocument: ICat002TipoDeDocumento | undefined;
  cart_products: ICartProductOffline[];
  pays: IFormasDePagoResponse[];
  conditionPayment: number;
  focusButton: boolean;
  totalUnformatted: number;
  onePercentRetention: number;
  clearAllData: () => void;
}
const ElectronicInvoice = (props: Props) => {
  const {
    customer,
    typeDocument,
    transmitter,
    cart_products,
    pays,
    conditionPayment,
    focusButton,
    totalUnformatted,
    onePercentRetention,
    clearAllData,
  } = props;

  const generateFactura = async () => {
    if (conditionPayment === 0) {
      ToastAndroid.show("Debes seleccionar una condición", ToastAndroid.SHORT);
      return;
    }
    const tipo_pago = pays.filter((type) => {
      if (conditionPayment === 1) {
        if (type.codigo !== "") {
          if (type.monto > 0) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        if (type.monto > 0 && type.periodo > 0 && type.plazo !== "") {
          return true;
        } else {
          return false;
        }
      }
    });

    const total_filteres = Number(
      tipo_pago
        .map((a) => a.monto)
        .reduce((a, b) => a + b, 0)
        .toFixed(2)
    );

    if (total_filteres !== Number(totalUnformatted.toFixed(2))) {
      ToastAndroid.show(
        "Los montos de las formas de pago no coinciden con el total de la compra",
        ToastAndroid.SHORT
      );
      return;
    }
    if (tipo_pago.length === 0) {
      ToastAndroid.show(
        "Debes agregar al menos una forma de pago",
        ToastAndroid.SHORT
      );
      return;
    }
    if (!typeDocument) {
      ToastAndroid.show(
        "Debes seleccionar el tipo de documento",
        ToastAndroid.SHORT
      );
      return;
    }
    const box = await get_box_data();

    if (box?.id === 0 || !box) {
      ToastAndroid.show("No se encontró la caja", ToastAndroid.SHORT);
      return;
    }
    const codeEmployee = await get_employee_id();

    if (!codeEmployee) {
      ToastAndroid.show("No se encontró el empleado", ToastAndroid.SHORT);
      return;
    }
    if (!customer) {
      ToastAndroid.show("Debes seleccionar el cliente", ToastAndroid.SHORT);
      return;
    }
    const user = await get_user();
    if (!user) {
      ToastAndroid.show("No se encontró el usuario", ToastAndroid.SHORT);
      return;
    }

    if (cart_products.some((product) => Number(product.price) <= 0)) {
      ToastAndroid.show(
        "No se puede facturar un precio negativo o cero",
        ToastAndroid.LONG
      );
      return;
    }
    try {
      const generate = generate_factura(
        transmitter,
        typeDocument,
        customer,
        cart_products,
        tipo_pago.map((a) => {
          return {
            codigo: a.codigo,
            montoPago: a.monto,
            plazo: conditionPayment === 1 ? null : a.plazo,
            periodo: conditionPayment === 1 ? null : a.periodo,
            referencia: "",
          };
        }),
        conditionPayment,
        totalUnformatted,
        onePercentRetention
      );
      save_local_sale_invoice(generate, box.id, user?.id!).then(() => {
        clearAllData();
      });
    } catch (error) {
      ToastAndroid.show(`Error: ${error}`, ToastAndroid.LONG);
    }
  };

  return (
    <>
      {!focusButton && (
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Pressable
            onPress={generateFactura}
            style={{
              width: "84%",
              padding: 16,
              borderRadius: 4,
              marginTop: 12,
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
              Generar la factura
            </Text>
          </Pressable>
        </View>
      )}
    </>
  );
};

export default ElectronicInvoice;
