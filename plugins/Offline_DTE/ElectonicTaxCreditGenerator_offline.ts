import { ICat002TipoDeDocumento } from "@/types/billing/cat-002-tipo-de-documento.types";
import { ITipoTributo } from "@/types/billing/cat-015-tipo-de-tributo.types";
import { CF_PagosItems, SVFE_CF_SEND } from "@/types/svf_dte/cf.types";
import { ambiente } from "@/utils/constants";
import { getElSalvadorDateTime } from "@/utils/date";
import { convertCurrencyFormat } from "../DTE/money/money";
import { Customer } from "@/offline/entity/customer.entity";
import { Transmitter } from "@/offline/entity/transmitter.entity";
import { ICartProductOffline } from "@/offline/types/branch_product_offline";
import { IPointOfSales } from "@/types/point_of_sales/pointOfSales.types";

export const generate_receptor_credit = (customer: Customer) => {
  return {
    nit: customer.nit,
    nrc: customer.nrc,
    nombre: customer.nombre,
    codActividad: customer.codActividad,
    descActividad: customer.descActividad,
    nombreComercial:
      customer.nombreComercial === "N/A" ? null : customer.nombreComercial,
    direccion: {
      departamento: customer.departamento!,
      municipio: customer.municipio!,
      complemento: customer.complemento!,
    },
    telefono: customer.telefono === "N/A" ? null : customer.telefono,
    correo: customer.correo,
  };
};
export const generate_credito_fiscal_offline = (
  emisor: Transmitter,
  valueTipo: ICat002TipoDeDocumento,
  customer: Customer,
  products_carts: ICartProductOffline[],
  tipo_pago: CF_PagosItems[],
  tributo: ITipoTributo,
  conditionPayment: number,
  onePercentRetention: number
): SVFE_CF_SEND => {
  return {
    nit: emisor.nit,
    activo: true,
    passwordPri: emisor.clavePublica,
    dteJson: {
      identificacion: {
        version: valueTipo.codigo === "03" ? 3 : 1,
        codigoGeneracion: "N/A",
        ambiente: ambiente,
        tipoDte: valueTipo!.codigo,
        numeroControl: "N/A",
        tipoModelo: 1,
        tipoOperacion: 1,
        tipoContingencia: null,
        motivoContin: null,
        tipoMoneda: "USD",
        ...getElSalvadorDateTime(),
      },
      documentoRelacionado: null,
      emisor: { ...generate_emisor_credit(emisor) },
      receptor: generate_receptor_credit(customer),
      otrosDocumentos: null,
      ventaTercero: null,
      cuerpoDocumento: make_cuerpo_documento_fiscal(products_carts),
      resumen: {
        totalNoSuj: 0,
        totalExenta: 0,
        totalGravada: Number(total(products_carts).toFixed(2)),
        subTotalVentas: Number(total(products_carts).toFixed(2)),
        descuNoSuj: 0,
        descuExenta: 0,
        descuGravada: 0,
        porcentajeDescuento: 0,
        totalDescu: 0,
        tributos: [
          {
            codigo: tributo!.codigo,
            descripcion: tributo!.valores,
            valor: Number(total_iva(products_carts).toFixed(2)),
          },
        ],
        subTotal: Number(total(products_carts).toFixed(2)),
        ivaRete1: Number(onePercentRetention.toFixed(2)),
        reteRenta: 0,
        ivaPerci1: 0,
        montoTotalOperacion: Number(total(products_carts).toFixed(2)),
        totalNoGravado: 0,
        totalPagar: Number(
          (total(products_carts) - onePercentRetention).toFixed(2)
        ),
        totalLetras: convertCurrencyFormat(
          (total(products_carts) - onePercentRetention).toFixed(2)
        ),
        saldoFavor: 0,
        condicionOperacion: Number(conditionPayment),
        pagos: tipo_pago,
        numPagoElectronico: null,
      },
      extension: null,
      apendice: null,
    },
  };
};
const currentDay = new Date()
  .toLocaleString("en-US", { weekday: "long" })
  .toUpperCase();

export const make_cuerpo_documento_fiscal = (
  products_cart: ICartProductOffline[]
) => {
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
      ventaGravada: Number((Number(cp.price!) * cp.quantity).toFixed(2)),
      tributos: ["20"],
      psv: 0,
      noGravado: 0,
    };
  });
};

const total_iva = (cart_products: ICartProductOffline[]) => {
  return cart_products
    .map((cp) => {
      const total = Number(cp.price) * Number(cp.quantity);

      const iva = total * 0.13;

      return iva;
    })
    .reduce((a, b) => a + b, 0);
};
const total = (cart_products: ICartProductOffline[]) => {
  return cart_products
    .map((cp) => Number(cp.quantity) * Number(cp.price))
    .reduce((a, b) => a + b, 0);
};
export const generate_emisor_credit = (
  transmitter: Transmitter,
  correlative?: IPointOfSales
) => {
  return {
    nit: transmitter.nit,
    nrc: transmitter.nrc,
    nombre: transmitter.nombre,
    nombreComercial: transmitter.nombreComercial,
    codActividad: transmitter.codActividad,
    descActividad: transmitter.descActividad,
    tipoEstablecimiento: correlative ? correlative!.tipoEstablecimiento : "N/A",
    direccion: {
      departamento: transmitter.departamento,
      municipio: transmitter.municipio,
      complemento: transmitter.complemento,
    },
    telefono: transmitter.telefono,
    correo: transmitter.correo,
    codEstable: correlative ? correlative!.codEstable : "N/A",
    codEstableMH: correlative
      ? correlative!.codEstableMH === "0" || correlative!.codEstableMH === "N/A"
        ? null
        : correlative!.codEstableMH
      : "N/A",
    codPuntoVenta: correlative ? correlative!.codPuntoVenta : "N/A",
    codPuntoVentaMH: correlative
      ? correlative!.codPuntoVentaMH === "0" ||
        correlative!.codPuntoVentaMH === "N/A" ||
        !correlative
        ? null
        : correlative!.codPuntoVentaMH
      : "N/A",
  };
};
