import { ICat002TipoDeDocumento } from "@/types/billing/cat-002-tipo-de-documento.types";
import { ICartProduct } from "@/types/branch_product/branch_product.types";
import { ICustomer } from "@/types/customer/customer.types";
import { FC_PagosItems, SVFE_FC_SEND } from "@/types/svf_dte/fc.types";
import { ITransmitter } from "@/types/transmitter/transmiter.types";
import { ambiente } from "@/utils/constants";
import { formatearNumero, generate_control } from "@/utils/dte";
import { generate_uuid } from "../random/random";
import { getElSalvadorDateTime } from "@/utils/date";
import {
  generate_emisor,
  generate_receptor,
  make_cuerpo_documento,
} from "./make_generator/make-dte";
import { calcularDescuento, convertCurrencyFormat } from "./money/money";
import { IPointOfSaleCorrelatives } from "@/types/point_of_sales/pointOfSales.types";

export const generate_factura = (
  transmitter: ITransmitter,
  correlative: IPointOfSaleCorrelatives,
  valueTipo: ICat002TipoDeDocumento,
  customer: ICustomer,
  products_carts: ICartProduct[],
  tipo_pago: FC_PagosItems[],
  conditionPayment: number,
  onePercentRetention: number
): SVFE_FC_SEND => {
  return {
    nit: transmitter.nit,
    activo: true,
    passwordPri: transmitter.clavePrivada,
    dteJson: {
      identificacion: {
        version: 1,
        codigoGeneracion: generate_uuid().toUpperCase(),
        ambiente: ambiente,
        tipoDte: valueTipo.codigo,
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
      emisor: { ...generate_emisor(transmitter, correlative) },
      receptor: { ...generate_receptor(customer!) },
      otrosDocumentos: null,
      ventaTercero: null,
      cuerpoDocumento: make_cuerpo_documento(products_carts),
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
        tributos: null,
        subTotal: Number(total(products_carts).toFixed(2)),
        ivaRete1: Number(onePercentRetention.toFixed(2)),
        reteRenta: 0,
        totalIva: Number(total_iva(products_carts).toFixed(2)),
        montoTotalOperacion: Number(total(products_carts).toFixed(2)),
        totalNoGravado: 0,
        totalPagar: Number(
          (total(products_carts) - onePercentRetention).toFixed(2)
        ),
        totalLetras: convertCurrencyFormat(
          (total(products_carts) - onePercentRetention).toFixed(2)
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
const total = (productsCarts: ICartProduct[]) => {
  const total = productsCarts
    .map((cp) => Number(cp.quantity) * Number(cp.price))
    .reduce((a, b) => a + b, 0);

  return total;
};
const calDiscount = (productsCarts: ICartProduct[]) => {
  return productsCarts
    .map((prd) => Number(prd.monto_descuento * prd.quantity))
    .reduce((a, b) => a + b, 0);
};

const total_iva = (productsCarts: ICartProduct[]) => {
  return productsCarts
    .map((cp) => {
      const total = Number(cp.price) * Number(cp.quantity);

      const iva = total / 1.13;

      return total - iva;
    })
    .reduce((a, b) => a + b, 0);
};
const total_with_discount = (cart_products: ICartProduct[]) => {
  return cart_products
    .map((prd) => {
      const price =
        Number(prd.price) < prd.base_price ? prd.base_price : Number(prd.price);
      return price * prd.quantity;
    })
    .reduce((a, b) => a + b, 0);
};
