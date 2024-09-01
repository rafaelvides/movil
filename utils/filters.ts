import { Customer } from "@/offline/entity/customer.entity";
import { Transmitter } from "@/offline/entity/transmitter.entity";
import { ICartProduct } from "@/types/branch_product/branch_product.types";
import { ICustomer } from "@/types/customer/customer.types";
import { ITransmitter } from "@/types/transmitter/transmiter.types";
import { ToastAndroid } from "react-native";

export const returnTypeCustomer = (type: string) => {
  switch (type.toLocaleLowerCase()) {
    case "gran contribuyente":
      return 1;
    case "mediano contribuyente":
      return 2;
    default:
      return 0;
  }
};
export interface Coordenada {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy: number;
  coordinateId?: number;
}
export function dividirArrayPorTiempo(array: Coordenada[]): Coordenada[][] {
  if (array.length === 0) {
    return [];
  }

  const resultado: Coordenada[][] = [];
  let segmentoActual: Coordenada[] = [array[0]];

  for (let i = 1; i < array.length; i++) {
    const tiempoDiferencia: number =
      array[i].timestamp - array[i - 1].timestamp;

    if (tiempoDiferencia >= 1200000) {
      // 600000 milisegundos = 10 minutos
      resultado.push(segmentoActual);
      segmentoActual = [array[i]];
    } else {
      segmentoActual.push(array[i]);
    }
  }

  // Agregar el último segmento
  resultado.push(segmentoActual);

  return resultado;
}
export function agregarGuion(texto: string) {
  if (!texto.includes("-")) {
    return texto.slice(0, -1) + "-" + texto.slice(-1);
  }
  return texto;
}
export const validateCustomerFiscal = (customer: ICustomer | Customer) => {
  if (customer.nit === "N/A" || customer.nit === "0") {
    ToastAndroid.show("NIT de cliente no puede ser vació", ToastAndroid.LONG);
    return false;
  }
  if (customer.nrc === "N/A" || customer.nrc === "0") {
    ToastAndroid.show("NRC de cliente no puede ser vacío", ToastAndroid.LONG);
    return false;
  }
  if (!validationNit(customer.nit)) {
    ToastAndroid.show("NIT de cliente no es valido", ToastAndroid.LONG);
    return false;
  }
  if (!validationNrc(customer.nrc)) {
    ToastAndroid.show("NRC de cliente no es valido", ToastAndroid.LONG);
    return false;
  }
  if (!codActividad(customer.codActividad)) {
    ToastAndroid.show(
      "COD ACTIVIDAD de cliente no es valido",
      ToastAndroid.LONG
    );
    return false;
  }
  if (customer.codActividad === "N/A" || customer.codActividad === "0") {
    ToastAndroid.show(
      "COD ACTIVIDAD de cliente no puede ser vacío",
      ToastAndroid.LONG
    );
    return false;
  }
  if (customer.descActividad === "N/A" || customer.descActividad === "0") {
    ToastAndroid.show(
      "DESC ACTIVIDAD de cliente no puede ser vacío",
      ToastAndroid.LONG
    );
    return false;
  }
  if (customer.correo === "N/A" || customer.correo === "0") {
    ToastAndroid.show(
      "CORREO de cliente no puede ser vacío",
      ToastAndroid.LONG
    );
    return false;
  }

  return true;
};

export const validationTransmitter = (
  transmitter: ITransmitter | Transmitter
) => {
  if (transmitter.nit === "N/A" || transmitter.nit === "0") {
    ToastAndroid.show("NIT de emisor no puede ser vacío", ToastAndroid.LONG);
    return false;
  }
  if (transmitter.nrc === "N/A" || transmitter.nrc === "0") {
    ToastAndroid.show("NRC de emisor no puede ser vacío", ToastAndroid.LONG);
    return false;
  }
  if (transmitter.codActividad === "N/A" || transmitter.codActividad === "0") {
    ToastAndroid.show(
      "COD ACTIVIDAD de emisor no puede ser vacío",
      ToastAndroid.LONG
    );
    return false;
  }
  if (
    transmitter.descActividad === "N/A" ||
    transmitter.descActividad === "0"
  ) {
    ToastAndroid.show(
      "DESC ACTIVIDAD de emisor no puede ser vacío",
      ToastAndroid.LONG
    );
    return false;
  }
  if (transmitter.correo === "N/A" || transmitter.correo === "0") {
    ToastAndroid.show("CORREO de emisor no puede ser vacío", ToastAndroid.LONG);
    return false;
  }
  if (!validationNit(transmitter.nit)) {
    ToastAndroid.show("NIT de emisor no es valido", ToastAndroid.LONG);
    return false;
  }
  if (!validationNrc(transmitter.nrc)) {
    ToastAndroid.show("NRC de emisor no es valido", ToastAndroid.LONG);
    return false;
  }
  if (!codActividad(transmitter.codActividad)) {
    ToastAndroid.show(
      "COD ACTIVIDAD de emisor no es valido",
      ToastAndroid.LONG
    );
    return false;
  }

  return true;
};

export const validationNit = (nit: string) =>
  /^([0-9]{14}|[0-9]{9})$/.test(nit);

export const validationNrc = (nrc: string) => /^[0-9]{1,8}$/.test(nrc);

export const codActividad = (c: string) => /^[0-9]{2,6}$/.test(c);
// !fd6#6Fy@a*cL6B

export const validateTotals = (
  cart_products: ICartProduct[],
  subTotal: number,
  totalIva: number
) => {
  const total = cart_products
    .map((product) => Number(product.price) * Number(product.quantity))
    .reduce((a, b) => a + b, 0);

  const iva = total * 0.13;

  if (iva > totalIva) {
    ToastAndroid.show(
      "El calculo de IVA no coinciden con el total de la compra",
      ToastAndroid.LONG
    );
    return false;
  }

  if (total > subTotal) {
    ToastAndroid.show(
      "El calculo de total no coinciden con el subtotal",
      ToastAndroid.LONG
    );
    return false;
  }
};
