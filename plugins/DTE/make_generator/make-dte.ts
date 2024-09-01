import { ICartProduct } from "@/types/branch_product/branch_product.types";
import {
  FC_CuerpoDocumentoItems,
  SVFE_FC_SEND,
} from "@/types/svf_dte/fc.types";
import { ResponseMHSuccess } from "@/types/svf_dte/responseMH/responseMH.types";
import { ITransmitter } from "@/types/transmitter/transmiter.types";
import { convertCurrencyFormat } from "../money/money";
import { ICustomer } from "@/types/customer/customer.types";
import { SVFE_CF_SEND } from "@/types/svf_dte/cf.types";
import { Alert } from "react-native";
import { IPointOfSaleCorrelatives } from "@/types/point_of_sales/pointOfSales.types";
import { agregarGuion } from "@/utils/filters";

export const generate_emisor = (
  transmitter: ITransmitter,
  correlative: IPointOfSaleCorrelatives
) => {
  return {
    nit: transmitter.nit,
    nrc: transmitter.nrc,
    nombre: transmitter.nombre,
    nombreComercial: transmitter.nombreComercial,
    codActividad: transmitter.codActividad,
    descActividad: transmitter.descActividad,
    tipoEstablecimiento: correlative.tipoEstablecimiento,
    direccion: {
      departamento: transmitter.direccion.departamento,
      municipio: transmitter.direccion.municipio,
      complemento: transmitter.direccion.complemento,
    },
    telefono: transmitter.telefono,
    correo: transmitter.correo,
    codEstable: correlative.codEstable,
    codEstableMH:
      correlative!.codEstableMH === "0" || correlative!.codEstableMH === "N/A"
        ? null
        : correlative!.codEstableMH,
    codPuntoVenta: correlative.codPuntoVenta,
    codPuntoVentaMH:
      correlative!.codPuntoVentaMH === "0" ||
      correlative!.codPuntoVentaMH === "N/A"
        ? null
        : correlative!.codPuntoVentaMH,
  };
};
export const generate_receptor = (value: ICustomer) => {
  return {
    tipoDocumento:
      Number(value!.nrc) !== 0 && value!.nrc
        ? "36"
        : value!.tipoDocumento === "0" || value.tipoDocumento === "N/A"
        ? null
        : value!.tipoDocumento,
    numDocumento:
      Number(value!.nrc) !== 0 && value!.nrc
        ? value!.nit
        : value!.numDocumento === "0" || value.numDocumento === "N/A"
        ? null
        : agregarGuion(value!.numDocumento),
    nrc: Number(value!.nrc) === 0 ? null : value!.nrc,
    nombre: value!.nombre,
    codActividad:
      Number(value!.codActividad) === 0 ? null : value!.codActividad,
    descActividad:
      Number(value!.descActividad) === 0 ? null : value!.descActividad,
    direccion: {
      departamento: value!.direccion?.departamento,
      municipio: value!.direccion?.municipio,
      complemento: value!.direccion?.complemento,
    },
    telefono: value!.telefono,
    correo: value!.correo,
  };
};

export const make_cuerpo_documento = (
  products_cart: ICartProduct[]
): FC_CuerpoDocumentoItems[] => {
  return products_cart.map((cp, index) => {
    const prices = [
      Number(cp.base_price),
      Number(cp.priceA),
      Number(cp.priceB),
      Number(cp.priceC),
    ];

    const price = prices.includes(Number(cp.price))
      ? Number(cp.price)
      : prices[0];

    return {
      numItem: index + 1,
      tipoItem: Number(cp.product.tipoItem),
      uniMedida: Number(cp.product.uniMedida),
      numeroDocumento: null,
      cantidad: cp.quantity,
      codigo: cp.product.code !== "N/A" ? cp.product.code : null,
      codTributo: null,
      descripcion: cp.product.name,
      precioUni: Number(price.toFixed(2)),
      montoDescu: Number((cp.monto_descuento * cp.quantity).toFixed(2)),
      ventaNoSuj: 0,
      ventaExenta: 0,
      ventaGravada: Number((cp.quantity * Number(cp.price)).toFixed(2)),
      ivaItem: Number(get_iva(Number(cp.price), cp.quantity).toFixed(2)),
      tributos: null,
      psv: 0,
      noGravado: 0,
    };
  });
};
export const get_iva = (price: number, quantity: number) => {
  const total = Number(price) * Number(quantity);

  const iva = total / 1.13;

  return total - iva;
};
export const make_to_pdf = (
  DTE: SVFE_FC_SEND,
  total: number,
  data: ResponseMHSuccess
) => {
  return {
    emisor: DTE.dteJson.emisor,
    receptor: DTE.dteJson.receptor,
    resumen: {
      ...DTE.dteJson.resumen,
      totalNoSuj: Number(DTE.dteJson.resumen.totalNoSuj).toFixed(2),
      totalExenta: Number(DTE.dteJson.resumen.totalExenta).toFixed(2),
      totalGravada: Number(DTE.dteJson.resumen.totalGravada).toFixed(2),
      subTotalVentas: Number(DTE.dteJson.resumen.subTotalVentas).toFixed(2),
      descuNoSuj: Number(DTE.dteJson.resumen.descuNoSuj).toFixed(2),
      descuExenta: Number(DTE.dteJson.resumen.descuExenta).toFixed(2),
      descuGravada: Number(DTE.dteJson.resumen.descuGravada).toFixed(2),
      porcentajeDescuento: Number(
        DTE.dteJson.resumen.porcentajeDescuento
      ).toFixed(2),
      totalDescu: Number(DTE.dteJson.resumen.totalDescu).toFixed(2),
      tributos: null,
      subTotal: Number(DTE.dteJson.resumen.subTotal).toFixed(2),
      ivaRete1: Number(DTE.dteJson.resumen.ivaRete1).toFixed(2),
      reteRenta: Number(DTE.dteJson.resumen.reteRenta).toFixed(2),
      totalIva: Number(DTE.dteJson.resumen.totalIva).toFixed(2),
      montoTotalOperacion: Number(
        DTE.dteJson.resumen.montoTotalOperacion
      ).toFixed(2),
      totalNoGravado: Number(DTE.dteJson.resumen.totalNoGravado).toFixed(2),
      totalPagar: Number(DTE.dteJson.resumen.totalPagar).toFixed(2),
      totalLetras: convertCurrencyFormat(String(total.toFixed(2))),
      saldoFavor: 0,
    },
    codigoGeneracion: data.codigoGeneracion,
    version: data.version,
    ambiente: data.ambiente,
    versionApp: data.versionApp,
    estado: data.estado,
    selloRecibido: data.selloRecibido,
    fhProcesamiento: data.fhProcesamiento,
    clasificaMsg: data.clasificaMsg,
    codigoMsg: data.codigoMsg,
    descripcionMsg: data.descripcionMsg,
    observaciones: data.observaciones,
    numeroControl: DTE.dteJson.identificacion.numeroControl,
    cuerpoDocumento: make_cuerpo_documento_pdf(DTE),
  };
};
export const make_cuerpo_documento_pdf = (DTE: SVFE_FC_SEND) => {
  return DTE.dteJson.cuerpoDocumento.map((item) => {
    return {
      ...item,
      montoDescu: Number(item.montoDescu).toFixed(2),
      ventaNoSuj: Number(item.ventaNoSuj).toFixed(2),
      ventaExenta: Number(item.ventaExenta).toFixed(2),
      ventaGravada: Number(item.ventaGravada).toFixed(2),
      ivaItem: Number(0).toFixed(2),
      psv: Number(item.psv).toFixed(2),
      noGravado: Number(item.noGravado).toFixed(2),
    };
  });
};
//---------------------------------TaxCredit-----------------------------
export const make_to_pdf_fiscal = (
  DTE: SVFE_CF_SEND,
  total: number,
  data: ResponseMHSuccess
) => {
  return {
    emisor: DTE.dteJson.emisor,
    receptor: DTE.dteJson.receptor,
    resumen: {
      ...DTE.dteJson.resumen,
      totalNoSuj: Number(DTE.dteJson.resumen.totalNoSuj).toFixed(2),
      totalExenta: Number(DTE.dteJson.resumen.totalExenta).toFixed(2),
      totalGravada: Number(DTE.dteJson.resumen.totalGravada).toFixed(2),
      subTotalVentas: Number(DTE.dteJson.resumen.subTotalVentas).toFixed(2),
      descuNoSuj: Number(DTE.dteJson.resumen.descuNoSuj).toFixed(2),
      descuExenta: Number(DTE.dteJson.resumen.descuExenta).toFixed(2),
      descuGravada: Number(DTE.dteJson.resumen.descuGravada).toFixed(2),
      porcentajeDescuento: Number(
        DTE.dteJson.resumen.porcentajeDescuento
      ).toFixed(2),
      totalDescu: Number(DTE.dteJson.resumen.totalDescu).toFixed(2),
      tributos: DTE.dteJson.resumen.tributos,
      subTotal: Number(DTE.dteJson.resumen.subTotal).toFixed(2),
      ivaRete1: Number(DTE.dteJson.resumen.ivaRete1).toFixed(2),
      reteRenta: Number(DTE.dteJson.resumen.reteRenta).toFixed(2),
      montoTotalOperacion: Number(
        DTE.dteJson.resumen.montoTotalOperacion
      ).toFixed(2),
      totalNoGravado: Number(DTE.dteJson.resumen.totalNoGravado).toFixed(2),
      totalPagar: Number(DTE.dteJson.resumen.totalPagar).toFixed(2),
      totalLetras: convertCurrencyFormat(String(total.toFixed(2))),
      saldoFavor: 0,
    },
    codigoGeneracion: data.codigoGeneracion,
    version: data.version,
    ambiente: data.ambiente,
    versionApp: data.versionApp,
    estado: data.estado,
    selloRecibido: data.selloRecibido,
    fhProcesamiento: data.fhProcesamiento,
    clasificaMsg: data.clasificaMsg,
    codigoMsg: data.codigoMsg,
    descripcionMsg: data.descripcionMsg,
    observaciones: data.observaciones,
    numeroControl: DTE.dteJson.identificacion.numeroControl,
    cuerpoDocumento: make_cuerpo_documento_pdf_fiscal(DTE),
  };
};
export const make_cuerpo_documento_pdf_fiscal = (DTE: SVFE_CF_SEND) => {
  return DTE.dteJson.cuerpoDocumento.map((item) => {
    return {
      ...item,
      montoDescu: Number(item.montoDescu).toFixed(2),
      ventaNoSuj: Number(item.ventaNoSuj).toFixed(2),
      ventaExenta: Number(item.ventaExenta).toFixed(2),
      ventaGravada: Number(item.ventaGravada).toFixed(2),
      tributos: item.tributos,
      psv: Number(item.psv).toFixed(2),
      noGravado: Number(item.noGravado).toFixed(2),
    };
  });
};

export const showAlertAndWait = (title: string, message: string) => {
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      {
        text: "OK",
        onPress: () => resolve(true),
      },
    ]);
  });
};
