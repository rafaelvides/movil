import { View, Text, ToastAndroid, Pressable } from "react-native";
import React, { useContext } from "react";
import { ICat002TipoDeDocumento } from "@/types/billing/cat-002-tipo-de-documento.types";
import { ICartProductOffline } from "@/offline/types/branch_product_offline";
import { IFormasDePagoResponse } from "@/types/billing/cat-017-forma-de-pago.types";
import { ITipoTributo } from "@/types/billing/cat-015-tipo-de-tributo.types";
import { get_box_data, get_user } from "@/plugins/async_storage";
import { save_local_sale_tax_credit } from "@/offline/service/sale_local.service";
import { Customer } from "@/offline/entity/customer.entity";
import { generate_credito_fiscal_offline } from "@/plugins/Offline_DTE/ElectonicTaxCreditGenerator_offline";
import { Transmitter } from "@/offline/entity/transmitter.entity";
import { validateCustomerFiscal, validationTransmitter } from "@/utils/filters";
import { Employee } from "@/offline/entity/employee.entity";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import Button from "@/components/Global/components_app/Button";
import { ThemeContext } from "@/hooks/useTheme";

interface Props {
  customer: Customer | undefined;
  transmitter: Transmitter;
  typeDocument: ICat002TipoDeDocumento;
  cart_products: ICartProductOffline[];
  pays: IFormasDePagoResponse[];
  conditionPayment: number;
  typeTribute: ITipoTributo;
  focusButton: boolean;
  totalUnformatted: number;
  onePercentRetention: number;
  employee: Employee | undefined;
  clearAllData: () => void;
}
const ElectronicTaxCredit = (props: Props) => {
  const {
    customer,
    typeDocument,
    transmitter,
    cart_products,
    pays,
    employee,
    conditionPayment,
    typeTribute,
    focusButton,
    totalUnformatted,
    onePercentRetention,
    clearAllData,
  } = props;
  const { theme } = useContext(ThemeContext);

  const generateTaxCredit = async () => {
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
    const total_filteres = tipo_pago
      .map((a) => a.monto)
      .reduce((a, b) => a + b, 0);
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
    if (!customer) {
      ToastAndroid.show("Debes seleccionar el cliente", ToastAndroid.SHORT);
      return;
    }
    if (!typeTribute) {
      ToastAndroid.show(
        "Debes seleccionar el tipo de tributo",
        ToastAndroid.SHORT
      );
      return;
    }
    if (!validateCustomerFiscal(customer)) return;
    if (!validationTransmitter(transmitter)) return;

    const user = await get_user();
    if (!user) {
      ToastAndroid.show("No se encontró el usuario", ToastAndroid.SHORT);
      return;
    }

    if (
      customer.nit === "N/A" ||
      customer.nrc === "N/A" ||
      customer.codActividad === "N/A" ||
      customer.descActividad === "N/A" ||
      customer.correo === "N/A"
    ) {
      ToastAndroid.show(
        "No tienes los datos necesarios para el crédito fiscal",
        ToastAndroid.LONG
      );
      return;
    }
    const box = await get_box_data();

    if (!box) {
      ToastAndroid.show("No se encontró la caja", ToastAndroid.SHORT);
      return;
    }

    if (!employee) {
      ToastAndroid.show("No se encontró el empleado", ToastAndroid.SHORT);
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
      const generate = generate_credito_fiscal_offline(
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
        typeTribute,
        conditionPayment,
        onePercentRetention
      );
      save_local_sale_tax_credit(generate, box.id, user?.id!).then(() => {
        clearAllData();
      });
    } catch (error) {
      ToastAndroid.show(`Error: ${error}`, ToastAndroid.LONG);
    }
  };

  return (
    <>
      {!focusButton && (
        <View style={stylesGlobals.viewBotton}>
          <Button
            withB={390}
            onPress={generateTaxCredit}
            Title="Generar el crédito fiscal"
            color={theme.colors.dark}
          />
        </View>
      )}
    </>
  );
};

export default ElectronicTaxCredit;
