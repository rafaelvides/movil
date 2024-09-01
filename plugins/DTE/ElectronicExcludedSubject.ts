import { ICartProduct } from "@/types/branch_product/branch_product.types";
import { ICustomer } from "@/types/customer/customer.types";
import { SVFE_FSE_SEND } from "@/types/svf_dte/fse.types";
import { ITransmitter } from "@/types/transmitter/transmiter.types";
import { generate_uuid } from "../random/random";
import { ambiente } from "@/utils/constants";
import { formatearNumero, generate_control } from "@/utils/dte";
import { getElSalvadorDateTime } from "@/utils/date";
import { FC_PagosItems } from "@/types/svf_dte/fc.types";
import { ICat002TipoDeDocumento } from "@/types/billing/cat-002-tipo-de-documento.types";
import { IPointOfSaleCorrelatives } from "@/types/point_of_sales/pointOfSales.types";

export const ElectronicExcludedSubject = (
  transmitter: ITransmitter,
  correlative: IPointOfSaleCorrelatives,
  typeDocument: ICat002TipoDeDocumento,
  customer: ICustomer,
  products_carts: ICartProduct[],
  tipo_pago: FC_PagosItems[],
  conditionPayment: number,
  subTotal: number,
  total: number,
  reteRenta: number,
  descuentoPorProducto: {
    descripcion: string;
    descuento: number;
  }[]
): SVFE_FSE_SEND => {
  return {
    nit: transmitter.nit,
    passwordPri: transmitter.clavePublica,
    activo: true,
    dteJson: {
      identificacion: {
        codigoGeneracion: generate_uuid().toUpperCase(),
        ambiente: ambiente,
        tipoDte: typeDocument.codigo,
        numeroControl: generate_control(
          typeDocument.codigo,
          correlative.codEstable,
          correlative.codPuntoVenta,
          formatearNumero(correlative.next)
        ),
        version: 1,
        tipoModelo: 1,
        tipoOperacion: 1,
        tipoContingencia: null,
        motivoContin: null,
        tipoMoneda: "USD",
        ...getElSalvadorDateTime(),
        selloRecibido: null,
        sello: null,
      },
      emisor: {
        nit: transmitter.nit,
        nrc: transmitter.nrc,
        nombre: transmitter.nombre,
        telefono: transmitter.telefono,
        correo: transmitter.correo,
        direccion: {
          departamento: transmitter.direccion.departamento,
          municipio: transmitter.direccion.municipio,
          complemento: transmitter.direccion.complemento,
        },
        codActividad: transmitter.codActividad,
        descActividad: transmitter.descActividad,
        codEstable: correlative.codEstable,
        codPuntoVenta: correlative.codPuntoVenta,
        codEstableMH:
          correlative.codEstableMH! &&
          correlative.codEstableMH !== "N/A" &&
          correlative.codEstableMH !== "0"
            ? correlative.codEstableMH
            : null,
        codPuntoVentaMH:
          correlative.codEstableMH! &&
          correlative.codPuntoVentaMH !== "N/A" &&
          correlative.codPuntoVentaMH !== "0"
            ? correlative.codPuntoVentaMH
            : null,
      },
      sujetoExcluido: {
        tipoDocumento: customer.tipoDocumento,
        numDocumento: customer.numDocumento,
        nombre: customer.nombre,
        codActividad:
          customer.codActividad! &&
          customer.codActividad !== "N/A" &&
          customer.codActividad !== "0"
            ? customer.codActividad
            : null,
        descActividad:
          customer.descActividad &&
          customer.descActividad !== "N/A" &&
          customer.descActividad !== "0"
            ? customer.descActividad
            : null,
        direccion: {
          departamento: customer.direccion.departamento,
          municipio: customer.direccion.municipio,
          complemento: customer.direccion.complemento,
        },
        telefono:
          customer.telefono !== "N/A" && customer.telefono !== "0"
            ? customer.telefono
            : null,
        correo:
          customer.correo &&
          customer.correo !== "N/A" &&
          customer.correo !== "0"
            ? customer.correo
            : null,
      },
      cuerpoDocumento: make_cuerpo_documento_fiscal(products_carts),
      resumen: {
        totalCompra: Number(subTotal.toFixed(2)),
        descu: 0,
        totalDescu: descuentoPorProducto.reduce((a, b) => a + b.descuento, 0),
        subTotal: Number(subTotal.toFixed(2)),
        ivaRete1: 0,
        reteRenta: reteRenta,
        totalPagar: Number(total.toFixed(2)),
        totalLetras: formatearNumero(Number(total.toFixed(2))),
        condicionOperacion: conditionPayment,
        pagos: tipo_pago,
        observaciones: "",
      },
      apendice: null,
    },
  };
};

export const make_cuerpo_documento_fiscal = (products_cart: ICartProduct[]) => {
  return products_cart.map((cp, index) => {
    return {
      numItem: index + 1,
      tipoItem: 1,
      uniMedida: Number(26),
      numeroDocumento: null,
      cantidad: cp.quantity,
      codigo:
        cp.product.code !== "N/A" && cp.product.code !== "0"
          ? cp.product.code
          : null,
      codTributo: null,
      descripcion: cp.product.name,
      precioUni:
        Number(cp.price) < Number(cp.base_price)
          ? Number(cp.base_price)
          : Number(cp.price),
      montoDescu: Number(
        calcularPorcentajeDescuentoConRango(
          Number(cp.price) < Number(cp.base_price)
            ? Number(cp.base_price)
            : Number(cp.price),
          Number(cp.porcentaje),
          Number(cp.fixedPrice),
          cp.quantity,
          cp.minimum,
          cp.maximum,
          String(cp.operator),
          cp.days
        ).toFixed(2)
      ),
      ventaNoSuj: 0,
      ventaExenta: 0,
      ventaGravada: Number(
        ventaGrabada(
          Number(cp.price) < Number(cp.base_price)
            ? Number(cp.base_price)
            : Number(cp.price),
          cp.quantity
        ).toFixed(2)
      ),
      tributos: ["20"],
      psv: 0,
      noGravado: 0,
      compra: Number(
        ventaGrabada(
          Number(cp.price) < Number(cp.base_price)
            ? Number(cp.base_price)
            : Number(cp.price),
          cp.quantity
        ).toFixed(2)
      ),
    };
  });
};
const currentDay = new Date()
  .toLocaleString("en-US", { weekday: "long" })
  .toUpperCase();

let descuent = 0;
let ventaGraba = 0;
function calcularPorcentajeDescuentoConRango(
  precioProducto: number,
  descuentoProducto: number,
  fixedPrice: number,
  quantity: number,
  minimum: number,
  maximum: number,
  operator: string,
  days: string
) {
  let descuentoTotal = 0;
  if (days.includes(currentDay)) {
    const applyDiscount = (qty: number) => {
      if (descuentoTotal > 0) {
      }
      if (fixedPrice > 0) {
        const newFixedPrice =
          ((precioProducto - fixedPrice) / precioProducto) * 100;
        const descuento = precioProducto * (newFixedPrice / 100);
        return descuento * qty;
      } else if (descuentoProducto > 0) {
        const descuento = precioProducto * (descuentoProducto / 100);
        return descuento * qty;
      }
      descuentoTotal = 0;
      return 0;
    };

    // Lógica de aplicación de descuento basado en operadores y cantidades
    if (operator === "<") {
      if (quantity < minimum) {
        descuentoTotal += applyDiscount(quantity);
      }
    } else if (operator === ">") {
      if (quantity > minimum) {
        const qtyInRange = Math.min(quantity - minimum, maximum - minimum);
        descuentoTotal += applyDiscount(qtyInRange);
      }
    } else if (operator === "<=") {
      if (quantity <= minimum) {
        descuentoTotal += applyDiscount(quantity);
      } else if (quantity <= maximum) {
        descuentoTotal += applyDiscount(quantity);
      }
    } else if (operator === ">=") {
      if (quantity >= minimum) {
        const qtyInRange = Math.min(quantity - minimum, maximum - minimum);
        descuentoTotal += applyDiscount(qtyInRange);
      }
    } else if (operator === "=") {
      if (quantity === minimum) {
        descuentoTotal += applyDiscount(quantity);
      }
    } else {
      // Caso por defecto si no se especifica un operador válido
      const qtyInRange = Math.min(quantity, maximum);
      descuentoTotal += applyDiscount(qtyInRange);
    }
    descuent = descuentoTotal;
    return descuentoTotal;
  } else {
    return 0;
  }
}
function ventaGrabada(precioProducto: number, cantidad: number): number {
  const ventaGrabada = cantidad * precioProducto - descuent;
  ventaGraba = ventaGrabada;
  return ventaGrabada;
}
