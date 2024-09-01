import { ND_Emisor, ND_Receptor, SVFE_ND_SEND } from "@/types/svf_dte/nd.types";
import { ITransmitter } from "@/types/transmitter/transmiter.types";
import { generate_uuid } from "../random/random";
import { formatearNumero, generate_control } from "@/utils/dte";
import { ambiente } from "@/utils/constants";
import { getElSalvadorDateTime } from "@/utils/date";
import {
  CF_CuerpoDocumentoItems,
  CF_Identificacion,
} from "@/types/svf_dte/cf.types";
import { calcularDescuento, convertCurrencyFormat } from "./money/money";
import { IPointOfSaleCorrelatives } from "@/types/point_of_sales/pointOfSales.types";
import { ICartProduct } from "@/types/branch_product/branch_product.types";

export const generateNotaDebito = (
  transmitter: ITransmitter,
  receptor: ND_Receptor,
  correlative: IPointOfSaleCorrelatives,
  editedItems: CF_CuerpoDocumentoItems[],
  identity: CF_Identificacion
): SVFE_ND_SEND => {
  return {
    nit: transmitter.nit,
    activo: true,
    passwordPri: transmitter.clavePrivada,
    dteJson: {
      identificacion: {
        codigoGeneracion: generate_uuid().toUpperCase(),
        tipoContingencia: null,
        numeroControl: generate_control(
          "06",
          correlative.codEstable,
          correlative.codPuntoVenta,
          formatearNumero(correlative.next)
        ),
        tipoOperacion: 1,
        ambiente: ambiente,
        fecEmi: getElSalvadorDateTime().fecEmi,
        tipoModelo: 1,
        tipoDte: "06",
        version: 3,
        tipoMoneda: "USD",
        motivoContin: null,
        horEmi: getElSalvadorDateTime().horEmi,
      },
      documentoRelacionado: [
        {
          tipoDocumento: "03",
          tipoGeneracion: 2,
          numeroDocumento: identity.codigoGeneracion,
          fechaEmision: identity.fecEmi,
        },
      ],
      emisor: generateEmisorNotaDebito(transmitter, correlative),
      ventaTercero: null,
      receptor: receptor,
      cuerpoDocumento: editedItems.map((item, index) => ({
        numItem: index + 1,
        tipoItem: item.tipoItem,
        numeroDocumento: identity.codigoGeneracion,
        codigo: item.codigo,
        codTributo: null,
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        uniMedida: item.uniMedida,
        precioUni: Number(item.precioUni.toFixed(2)),
        montoDescu: item.montoDescu * item.cantidad,
        ventaNoSuj: item.ventaNoSuj,
        ventaExenta: item.ventaExenta,
        ventaGravada: Number(item.ventaGravada.toFixed(2)),
        tributos: ["20"],
      })),
      resumen: {
        totalNoSuj: 0,
        totalExenta: 0,
        totalGravada: Number(total(editedItems).toFixed(2)),
        subTotalVentas: Number(total(editedItems).toFixed(2)),
        descuNoSuj: 0,
        descuExenta: 0,
        descuGravada: Number(),
        totalDescu: Number(calDiscount(editedItems).toFixed(2)),
        tributos: [
          {
            codigo: "20",
            descripcion: "Impuesto al Valor Agregado 13%",
            valor: Number(total_iva(editedItems).toFixed(2)),
          },
        ],
        subTotal: Number(total(editedItems).toFixed(2)),
        ivaRete1: 0,
        reteRenta: 0,
        ivaPerci1: 0,
        montoTotalOperacion: Number(
          (total(editedItems) + total_iva(editedItems)).toFixed(2)
        ),
        totalLetras: convertCurrencyFormat(
          (total(editedItems) + total_iva(editedItems)).toFixed(2)
        ),
        condicionOperacion: 1,
        numPagoElectronico: null,
      },
      apendice: null,
      extension: null,
    },
  };
};
export const generateEmisorNotaDebito = (
  transmitter: ITransmitter,
  correlative: IPointOfSaleCorrelatives
): ND_Emisor => {
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
  };
};
const total = (editedItems: CF_CuerpoDocumentoItems[]) => {
  return editedItems
    .map((item) => Number(item.ventaGravada))
    .reduce((a, b) => a + b, 0);
};
const total_iva = (editedItems: CF_CuerpoDocumentoItems[]) => {
  return editedItems
    .map((cp) => {
      const iva = Number(cp.ventaGravada) * 0.13;
      return iva;
    })
    .reduce((a, b) => a + b, 0);
};
const calDiscount = (cart_products: CF_CuerpoDocumentoItems[]) => {
  return cart_products.map((pr) => (pr.montoDescu * pr.cantidad)).reduce((a, b) => a + b, 0);
};
const total_with_discount = (cart_products: CF_CuerpoDocumentoItems[]) => {
  return cart_products
    .map((prd) => {
      const price =
        (Number(prd.precioUni) - prd.montoDescu) * Number(prd.cantidad);
      return price * prd.cantidad;
    })
    .reduce((a, b) => a + b, 0);
};
