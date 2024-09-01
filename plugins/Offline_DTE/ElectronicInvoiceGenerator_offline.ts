import { ICat002TipoDeDocumento } from "@/types/billing/cat-002-tipo-de-documento.types";
import {
  FC_CuerpoDocumentoItems,
  FC_PagosItems,
  SVFE_FC_SEND,
} from "@/types/svf_dte/fc.types";
import { ambiente } from "@/utils/constants";
import { getElSalvadorDateTime } from "@/utils/date";
import { convertCurrencyFormat } from "../DTE/money/money";
import { Customer } from "@/offline/entity/customer.entity";
import { Transmitter } from "@/offline/entity/transmitter.entity";
import { ICartProductOffline } from "@/offline/types/branch_product_offline";
import { IPointOfSales } from "@/types/point_of_sales/pointOfSales.types";

export const generate_factura = (
  transmitter: Transmitter,
  valueTipo: ICat002TipoDeDocumento,
  customer: Customer,
  products_carts: ICartProductOffline[],
  tipo_pago: FC_PagosItems[],
  conditionPayment: number,
  totalUnformatted: number,
  onePercentRetention: number
): SVFE_FC_SEND => {
  return {
    nit: transmitter.nit,
    activo: true,
    passwordPri: transmitter.clavePrivada,
    dteJson: {
      identificacion: {
        version: 1,
        codigoGeneracion: "",
        ambiente: ambiente,
        tipoDte: valueTipo.codigo,
        numeroControl: "",
        tipoModelo: 1,
        tipoOperacion: 1,
        tipoContingencia: null,
        motivoContin: null,
        tipoMoneda: "USD",
        ...getElSalvadorDateTime(),
      },
      documentoRelacionado: null,
      emisor: { ...generate_emisor(transmitter, false) },
      receptor: { ...generate_receptor(customer!) },
      otrosDocumentos: null,
      ventaTercero: null,
      cuerpoDocumento: make_cuerpo_documento(products_carts),
      resumen: {
        totalNoSuj: 0,
        totalExenta: 0,
        totalGravada: Number(totalUnformatted.toFixed(2)),
        subTotalVentas: Number(totalUnformatted.toFixed(2)),
        descuNoSuj: 0,
        descuExenta: 0,
        descuGravada: 0,
        porcentajeDescuento: 0,
        totalDescu: 0,
        tributos: null,
        subTotal: Number(totalUnformatted.toFixed(2)),
        ivaRete1: Number(onePercentRetention.toFixed(2)),
        reteRenta: 0,
        totalIva: Number(total_iva(totalUnformatted).toFixed(2)),
        montoTotalOperacion: Number(totalUnformatted),
        totalNoGravado: 0,
        totalPagar: Number((totalUnformatted - onePercentRetention).toFixed(2)),
        totalLetras: convertCurrencyFormat(
          (totalUnformatted - onePercentRetention).toFixed(2)
        ),
        saldoFavor: 0,
        condicionOperacion: conditionPayment,
        pagos: tipo_pago,
        numPagoElectronico: null,
      },
      extension: null,
      apendice: null,
    },
  };
};
const total_iva = (totalUnformatted: number) => {
  const iva = totalUnformatted / 1.13;

  return totalUnformatted - iva;
};

export const generate_emisor = (
  transmitter: Transmitter,
  process: boolean,
  correlative?: IPointOfSales
) => {
  return {
    nit: transmitter.nit,
    nrc: transmitter.nrc,
    nombre: transmitter.nombre,
    nombreComercial: transmitter.nombreComercial,
    codActividad: transmitter.codActividad,
    descActividad: transmitter.descActividad,
    tipoEstablecimiento: process ? correlative!.tipoEstablecimiento : "N/A",
    direccion: {
      departamento: transmitter.departamento,
      municipio: transmitter.municipio,
      complemento: transmitter.complemento,
    },
    telefono: transmitter.telefono,
    correo: transmitter.correo,
    codEstable: process ? correlative!.codEstable : "N/A",
    codEstableMH: process
      ? correlative!.codEstableMH === "0" || correlative!.codEstableMH === "N/A"
        ? null
        : correlative!.codEstableMH
      : "N/A",
    codPuntoVenta: process ? correlative!.codPuntoVenta : "N/A",
    codPuntoVentaMH: process
      ? correlative!.codPuntoVentaMH === "0" ||
        correlative!.codPuntoVentaMH === "N/A"
        ? null
        : correlative!.codPuntoVentaMH
      : "N/A",
  };
};
export const generate_receptor = (value: Customer) => {
  return {
    tipoDocumento:
      value.nrc === "0" || value.nrc === "N/A"
        ? value.tipoDocumento === "0" || value.tipoDocumento === "N/A"
          ? null
          : value.tipoDocumento
        : "36",
    numDocumento:
      value.nrc === "0" || value.nrc === "N/A"
        ? value.numDocumento === "0" || value.numDocumento === "N/A"
          ? null
          : value.numDocumento
        : value.nit,
    nrc: value.nrc === "0" || value.nrc === "N/A" ? null : value.nrc,
    nombre: value.nombre,
    codActividad:
      value.codActividad === "0" || value.codActividad === "N/A"
        ? null
        : value.codActividad,
    descActividad:
      value.descActividad === "0" || value.descActividad === "N/A"
        ? null
        : value.descActividad,
    direccion: {
      departamento: value.departamento,
      municipio: value.municipio,
      complemento: value.complemento,
    },
    telefono: value!.telefono,
    correo: value!.correo,
  };
};
export const make_cuerpo_documento = (
  products_cart: ICartProductOffline[]
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
      montoDescu: 0,
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
