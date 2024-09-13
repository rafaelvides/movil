import { SVFE_CF_SEND } from "@/types/svf_dte/cf.types";
import { connection } from "../db.config";
import { Sale } from "../entity/sale.entity";
import { DetailSale } from "../entity/detail_sale.entity";
import { BranchProducts } from "../entity/branch_product.entity";
import { Customer } from "../entity/customer.entity";
import { PaymentSale } from "../entity/payment_sale.entity";
import { Transmitter } from "../entity/transmitter.entity";
import { ToastAndroid } from "react-native";
import { TributeSale } from "../entity/sale_tribute.entity";
import { SVFE_FC_SEND } from "@/types/svf_dte/fc.types";
import { IGetSalesOfflinePag } from "../types/sale_offline.types";
import { In, Like } from "typeorm/browser";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
export const save_local_sale_tax_credit = async (
  dte_json: SVFE_CF_SEND,
  box_id: number,
  userId: number
) => {
  try {
    const saleRepository = connection.getRepository(Sale);
    const saleDatilsRepository = connection.getRepository(DetailSale);
    const branchProductRepository = connection.getRepository(BranchProducts);
    const clientRepository = connection.getRepository(Customer);
    const paySaleRepository = connection.getRepository(PaymentSale);
    const emisorRepository = connection.getRepository(Transmitter);
    const tributesRepository = connection.getRepository(TributeSale);
    if (box_id === 0) return;

    const customer = await clientRepository.findOne({
      where: {
        correo: dte_json.dteJson.receptor.correo,
        nit: dte_json.dteJson.receptor.nit,
      },
    });
    const emisor = await emisorRepository.findOne({
      where: { nit: dte_json.dteJson.emisor.nit },
    });
    if (!customer) {
      ToastAndroid.show("No se encontró el cliente", ToastAndroid.LONG);
      return;
    }
    const sale = new Sale();
    sale.tipoDte = dte_json.dteJson.identificacion.tipoDte;
    sale.fecEmi = dte_json.dteJson.identificacion.fecEmi;
    sale.horEmi = dte_json.dteJson.identificacion.horEmi;
    sale.totalNoSuj = dte_json.dteJson.resumen.totalNoSuj;
    sale.totalExenta = dte_json.dteJson.resumen.totalExenta;
    sale.totalGravada = dte_json.dteJson.resumen.totalGravada;
    sale.subTotalVentas = dte_json.dteJson.resumen.subTotalVentas;
    sale.descuNoSuj = dte_json.dteJson.resumen.descuNoSuj;
    sale.descuExenta = dte_json.dteJson.resumen.descuExenta;
    sale.descuGravada = dte_json.dteJson.resumen.descuGravada;
    sale.porcentajeDescuento = dte_json.dteJson.resumen.porcentajeDescuento;
    sale.totalDescu = dte_json.dteJson.resumen.totalDescu;
    sale.subTotal = dte_json.dteJson.resumen.subTotal;
    sale.totalIva = dte_json.dteJson.resumen.tributos![0].valor;
    sale.montoTotalOperacion = dte_json.dteJson.resumen.montoTotalOperacion;
    sale.condicionOperacion = dte_json.dteJson.resumen.condicionOperacion;
    sale.totalPagar = String(dte_json.dteJson.resumen.totalPagar);
    sale.totalLetras = dte_json.dteJson.resumen.totalLetras;
    sale.userId = userId;
    sale.isProcessed = false;
    sale.tipeSale = "Sin conexión";
    sale.idBox = box_id;
    sale.customer = customer;
    sale.customerId = customer.id;
    sale.transmitter = emisor!;
    sale.transmitterId = emisor!.id;
    new Promise(() => {
      saleRepository
        .save(sale)
        .then(async (sl) => {
          for (const tributo of dte_json.dteJson.resumen.tributos!) {
            const tribute = new TributeSale();
            tribute.descripcion = tributo.descripcion;
            tribute.codigo = tributo.codigo;
            tribute.monto = tributo.valor;
            tribute.sale = sl;
            tribute.saleId = sl.id;
            await tributesRepository.save(tribute);
          }

          for (const pays of dte_json.dteJson.resumen.pagos!) {
            const pay = new PaymentSale();
            pay.codigo = pays.codigo;
            pay.montoPago = pays.montoPago;
            pay.periodo = pays.periodo;
            pay.plazo = pays.plazo;
            pay.referencia = pay.referencia;
            pay.sale = sl;
            pay.saleId = sl.id;
            await paySaleRepository.save(pay);
          }

          dte_json.dteJson.cuerpoDocumento.forEach(async (cuerpo) => {
            const branch_product = await branchProductRepository.findOne({
              where: {
                product: {
                  code: String(cuerpo.codigo),
                },
              },
            });

            if (branch_product) {
              const details_sales = new DetailSale();
              details_sales.sale = sl;
              details_sales.saleId = sl.id;
              details_sales.branchProduct = branch_product;
              details_sales.branchProductId = branch_product.id;
              details_sales.montoDescu = cuerpo.montoDescu;
              details_sales.ventaNoSuj = cuerpo.ventaNoSuj;
              details_sales.ventaExenta = cuerpo.ventaExenta;
              details_sales.totalItem = cuerpo.precioUni * cuerpo.cantidad;
              details_sales.ventaGravada = cuerpo.ventaGravada;
              details_sales.cantidadItem = cuerpo.cantidad;
              details_sales.tipoItem = cuerpo.tipoItem;
              details_sales.precio = cuerpo.precioUni;
              details_sales.uniMedida = cuerpo.uniMedida;
              details_sales.ivaItem = Number(
                cuerpo.ivaItem ? cuerpo.ivaItem : 0
              );
              details_sales.isActive = true;
              await saleDatilsRepository.save(details_sales).catch(() => {
                ToastAndroid.show(
                  "Error al guardar el detalle de venta",
                  ToastAndroid.SHORT
                );
              });
            } else {
              ToastAndroid.show(
                "Error al obtener producto",
                ToastAndroid.SHORT
              );

              return null;
            }
          });
        })
        .then(() => {
          Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: "Éxito",
            textBody: "Se completaron todos los procesos",
          });
          return true;
        })
        .catch(() => {
          ToastAndroid.show("Error al guardar la venta", ToastAndroid.SHORT);
          return false;
        });
    }).catch((error) => {
      ToastAndroid.show(`Error: ${error}`, ToastAndroid.SHORT);
    });
  } catch (error) {
    ToastAndroid.show(`Error: ${error}`, ToastAndroid.SHORT);
  }
};
export const save_local_sale_invoice = async (
  dte_json: SVFE_FC_SEND,
  box_id: number,
  userId: number
) => {
  try {
    const saleRepository = connection.getRepository(Sale);
    const saleDatilsRepository = connection.getRepository(DetailSale);
    const branchProductRepository = connection.getRepository(BranchProducts);
    const clientRepository = connection.getRepository(Customer);
    const paySaleRepository = connection.getRepository(PaymentSale);
    const emisorRepository = connection.getRepository(Transmitter);

    if (box_id === 0) return;

    const customer = await clientRepository.findOne({
      where: {
        // correo: dte_json.dteJson.receptor.correo,
        numDocumento: dte_json.dteJson.receptor.numDocumento!,
      },
    });
    const emisor = await emisorRepository.findOne({
      where: { nit: dte_json.dteJson.emisor.nit },
    });

    if (!customer) {
      ToastAndroid.show("No se encontró el cliente", ToastAndroid.LONG);
      return;
    }
    const sale = new Sale();
    sale.tipoDte = dte_json.dteJson.identificacion.tipoDte;
    sale.fecEmi = dte_json.dteJson.identificacion.fecEmi;
    sale.horEmi = dte_json.dteJson.identificacion.horEmi ;
    sale.totalNoSuj = dte_json.dteJson.resumen.totalNoSuj;
    sale.totalExenta = dte_json.dteJson.resumen.totalExenta;
    sale.totalGravada = dte_json.dteJson.resumen.totalGravada;
    sale.subTotalVentas = dte_json.dteJson.resumen.subTotalVentas;
    sale.descuNoSuj = dte_json.dteJson.resumen.descuNoSuj;
    sale.descuExenta = dte_json.dteJson.resumen.descuExenta;
    sale.descuGravada = dte_json.dteJson.resumen.descuGravada;
    sale.porcentajeDescuento = dte_json.dteJson.resumen.porcentajeDescuento;
    sale.totalDescu = dte_json.dteJson.resumen.totalDescu;
    sale.subTotal = dte_json.dteJson.resumen.subTotal;
    sale.totalIva = dte_json.dteJson.resumen.totalIva;
    sale.montoTotalOperacion = dte_json.dteJson.resumen.montoTotalOperacion;
    sale.totalPagar = String(dte_json.dteJson.resumen.totalPagar);
    sale.condicionOperacion = dte_json.dteJson.resumen.condicionOperacion;
    sale.totalLetras = dte_json.dteJson.resumen.totalLetras;
    sale.userId = userId;
    sale.tipeSale = "Sin conexión";
    sale.isProcessed = false;
    sale.idBox = box_id;
    sale.customer = customer;
    sale.customerId = customer.id;
    sale.transmitter = emisor!;
    sale.transmitterId = emisor!.id;

    new Promise(() => {
      saleRepository
        .save(sale)
        .then(async (sl) => {

          for (const pays of dte_json.dteJson.resumen.pagos!) {
            const pay = new PaymentSale();
            pay.codigo = pays.codigo;
            pay.montoPago = pays.montoPago;
            pay.periodo = pays.periodo;
            pay.plazo = pays.plazo;
            pay.referencia = pay.referencia;
            pay.sale = sl;
            pay.saleId = sl.id;
            await paySaleRepository.save(pay);
          }
          dte_json.dteJson.cuerpoDocumento.forEach(async (cuerpo) => {
            const branch_product = await branchProductRepository.findOne({
              where: {
                product: {
                  code: String(cuerpo.codigo),
                },
              },
            });

            if (branch_product) {
              const details_sales = new DetailSale();
              details_sales.sale = sl;
              details_sales.saleId = sl.id;
              details_sales.branchProduct = branch_product;
              details_sales.branchProductId = branch_product.id;
              details_sales.montoDescu = cuerpo.montoDescu;
              details_sales.ventaNoSuj = cuerpo.ventaNoSuj;
              details_sales.ventaExenta = cuerpo.ventaExenta;
              details_sales.totalItem = cuerpo.precioUni * cuerpo.cantidad;
              details_sales.ventaGravada = cuerpo.ventaGravada;
              details_sales.cantidadItem = cuerpo.cantidad;
              details_sales.precio = cuerpo.precioUni;
              details_sales.tipoItem = cuerpo.tipoItem;
              details_sales.uniMedida = cuerpo.uniMedida;
              details_sales.ivaItem = Number(cuerpo.ivaItem);
              details_sales.isActive = true;
              await saleDatilsRepository.save(details_sales).catch(() => {
                ToastAndroid.show(
                  "Error al guardar el detalle de venta",
                  ToastAndroid.SHORT
                );
              });
            } else {
              ToastAndroid.show(
                "Error al obtener producto",
                ToastAndroid.SHORT
              );

              return null;
            }
          });
        })
        .then(() => {
          Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: "Éxito",
            textBody: "Se completaron todos los procesos",
          });
          return true;
        })
        .catch(() => {
          ToastAndroid.show("Error al guardar la venta", ToastAndroid.SHORT);
          return false;
        });
    }).catch((error) => {
      ToastAndroid.show(`Error: ${error}`, ToastAndroid.SHORT);
    });
  } catch (error) {
    ToastAndroid.show(`Error: ${error}`, ToastAndroid.SHORT);
  }
};

export const get_sales_by_box = async (
  box_id: number,
  tipoDte: string,
  fecEmi: string,
  totalPagar: string,
  page: number,
  limit: number
): Promise<IGetSalesOfflinePag> => {
  const saleRepository = connection.getRepository(Sale);
  const [existingSales, total] = await saleRepository.findAndCount({
    where: {
      idBox: box_id,
      tipoDte: tipoDte ? tipoDte : In(["01", "03"]),
      fecEmi: fecEmi ? Like(`%${fecEmi}%`) : undefined,
      totalPagar: totalPagar ? Like(`%${totalPagar}%`) : undefined,
    },
    take: limit,
    skip: (page - 1) * limit,
    relations: {
      customer: true,
      transmitter: true,
    },
    // order: {
    //   id: "DESC",
    // }
  });

  if (existingSales.length === 0) {
    return {
      sales: [],
      totalPages: 0,
      totalItems: 0,
      nextPage: 0,
      prevPage: 0,
      currentPage: 0,
      limit: 0,
    };
  }
  let totalPag: number = total / limit;
  if (totalPag % 1 !== 0) {
    totalPag = Math.floor(totalPag) + 1;
  }

  const nextPage: number = page >= totalPag ? page : Number(page) + 1;
  const prevPage: number = page <= 1 ? page : Number(page) - 1;
  return {
    sales: existingSales,
    totalPages: totalPag,
    totalItems: total,
    nextPage: nextPage,
    prevPage: prevPage,
    currentPage: page,
    limit: limit,
  };
};
export const get_details_sales = (id: number) => {
  const details_sales = connection.getRepository(DetailSale);
  return details_sales.find({
    where: {
      sale: {
        id: id,
      },
    },
    relations: {
      branchProduct: {
        product: true,
      },
      sale: true,
    },
  });
};
export const get_pays_for_sales = (id: number) => {
  const pays = connection.getRepository(PaymentSale);
  return pays.find({
    where: {
      sale: {
        id: id,
      },
    },
    relations: {
      sale: true,
    },
  });
};
export const get_tribute_sale = (id: number) => {
  const tributes = connection.getRepository(TributeSale);

  return tributes.find({
    where: {
      sale: {
        id: id,
      },
    },
    relations: {
      sale: true,
    },
  });
};
export const clear_complete_sale = async (id: number): Promise<boolean> => {
  const saleReport = connection.getRepository(Sale);
  const detailSaleReport = connection.getRepository(DetailSale);
  const payReport = connection.getRepository(PaymentSale);
  const tributesReport = connection.getRepository(TributeSale);

  const sale = await saleReport.findOne({ where: { id: id } });
  if (sale) {
    const findPays = await payReport.find({
      where: { sale: { id: id } },
      relations: { sale: true },
    });
    if (findPays.length > 0) {
      findPays.forEach(async (pay) => {
        await payReport.remove(pay);
      });
    }
    const tribute = await tributesReport.find({
      relations: { sale: true },
      where: { sale: { id: id } },
    });

    if (tribute.length > 0) {
      tribute.forEach(async (tbt) => {
        await tributesReport.remove(tbt);
      });
    }

    const details = await detailSaleReport.find({
      where: { sale: { id: id } },
      relations: { sale: true },
    });

    if (details.length > 0) {
      details.forEach(async (dtl) => {
        await detailSaleReport.remove(dtl);
      });
    }
    await saleReport.remove(sale);
    return true;
  } else {
    return false;
  }
};
