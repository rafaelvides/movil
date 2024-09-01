import { ICat002TipoDeDocumento } from "@/types/billing/cat-002-tipo-de-documento.types";
import { ITipoTributo } from "@/types/billing/cat-015-tipo-de-tributo.types";
import { ICartProduct } from "@/types/branch_product/branch_product.types";
import { CF_PagosItems, SVFE_CF_SEND } from "@/types/svf_dte/cf.types";
import { ITransmitter } from "@/types/transmitter/transmiter.types";
import { generate_uuid } from "../random/random";
import { ambiente } from "@/utils/constants";
import { formatearNumero, generate_control } from "@/utils/dte";
import { getElSalvadorDateTime } from "@/utils/date";
import { generate_emisor } from "./make_generator/make-dte";
import { calcularDescuento, convertCurrencyFormat } from "./money/money";
import { ICustomer } from "@/types/customer/customer.types";
import { IPointOfSaleCorrelatives } from "@/types/point_of_sales/pointOfSales.types";

export const generate_receptor = (customer: ICustomer) => {
  return {
    nit: customer.nit,
    nrc: customer.nrc,
    nombre: customer.nombre,
    codActividad: customer.codActividad,
    descActividad: customer.descActividad,
    nombreComercial:
      customer.nombreComercial === "N/A" ? null : customer.nombreComercial,
    direccion: {
      departamento: customer.direccion.departamento!,
      municipio: customer.direccion.municipio!,
      complemento: customer.direccion.complemento!,
    },
    telefono: customer.telefono === "N/A" ? null : customer.telefono,
    correo: customer.correo,
  };
};
export const generate_credito_fiscal = (
  emisor: ITransmitter,
  valueTipo: ICat002TipoDeDocumento,
  correlative: IPointOfSaleCorrelatives,
  customer: ICustomer,
  products_carts: ICartProduct[],
  tipo_pago: CF_PagosItems[],
  tributo: ITipoTributo,
  conditionPayment: number,
  totalUnformatted: number,
  onePercentRetention: number
): SVFE_CF_SEND => {
  return {
    nit: emisor.nit,
    activo: true,
    passwordPri: emisor.clavePrivada,
    dteJson: {
      identificacion: {
        version: valueTipo.codigo === "03" ? 3 : 1,
        codigoGeneracion: generate_uuid().toUpperCase(),
        ambiente: ambiente,
        tipoDte: valueTipo!.codigo,
        numeroControl: generate_control(
          valueTipo!.codigo,
          correlative.codEstable!,
          correlative.codPuntoVenta!,
          formatearNumero(correlative.next)
        ),
        tipoModelo: 1,
        tipoOperacion: 1,
        tipoContingencia: null,
        motivoContin: null,
        tipoMoneda: "USD",
        ...getElSalvadorDateTime(),
      },
      documentoRelacionado: null,
      emisor: { ...generate_emisor(emisor, correlative) },
      receptor: generate_receptor(customer),
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
        porcentajeDescuento: Number(
          calcularDescuento(
            total_with_discount(products_carts),
            total(products_carts)
          ).porcentajeDescuento.toFixed(2)
        ),
        totalDescu: Number(calDiscount(products_carts).toFixed(2)),
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
        montoTotalOperacion: Number(totalUnformatted.toFixed(2)),
        totalNoGravado: 0,
        totalPagar: Number(totalUnformatted.toFixed(2)),
        totalLetras: convertCurrencyFormat(totalUnformatted.toFixed(2)),
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

export const make_cuerpo_documento_fiscal = (products_cart: ICartProduct[]) => {
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
      ventaGravada: Number((Number(cp.price!) * cp.quantity).toFixed(2)),
      tributos: ["20"],
      psv: 0,
      noGravado: 0,
    };
  });
};

const total = (cart_products: ICartProduct[]) => {
  return cart_products
    .map((cp) => Number(cp.quantity) * Number(cp.price))
    .reduce((a, b) => a + b, 0);
};
const total_with_discount = (cart_products: ICartProduct[]) => {
  return cart_products
    .map((prd) => {
      const price =
        (Number(prd.price) + prd.monto_descuento) * Number(prd.quantity);
      return price * prd.quantity;
    })
    .reduce((a, b) => a + b, 0);
};
const calDiscount = (cart_products: ICartProduct[]) => {
  return cart_products
    .map((pr) => pr.monto_descuento)
    .reduce((a, b) => a + b, 0);
};
const total_iva = (cart_products: ICartProduct[]) => {
  return cart_products
    .map((cp) => {
      const total = Number(cp.price) * Number(cp.quantity);

      const iva = total * 0.13;

      return iva;
    })
    .reduce((a, b) => a + b, 0);
};
