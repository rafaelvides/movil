import {
  IProcessSalesResponse,
  SendMHFailed,
} from "@/types/svf_dte/responseMH/responseMH.types";
import { Sale } from "../entity/sale.entity";
import {
  get_details_sales,
  get_pays_for_sales,
  get_tribute_sale,
} from "./sale_local.service";
import { SVFE_FC_SEND } from "@/types/svf_dte/fc.types";
import { ambiente, API_URL, SPACES_BUCKET } from "@/utils/constants";
import { formatearNumero, generate_control } from "@/utils/dte";
import { formatDate, getElSalvadorDateTime } from "@/utils/date";
import {
  generate_emisor,
  generate_receptor,
} from "@/plugins/Offline_DTE/ElectronicInvoiceGenerator_offline";
import {
  firmarDocumentoFactura,
  firmarDocumentoFiscal,
  send_to_mh,
} from "@/services/ministry_of_finance.service";
import { PayloadMH } from "@/types/dte/DTE.types";
import axios, { AxiosError } from "axios";
import * as FileSystem from "expo-file-system";
import { s3Client } from "@/plugins/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { save_logs } from "@/services/logs.service";
import { SVFE_CF_SEND } from "@/types/svf_dte/cf.types";
import {
  generate_emisor_credit,
  generate_receptor_credit,
} from "@/plugins/Offline_DTE/ElectonicTaxCreditGenerator_offline";
import { IPointOfSales } from "@/types/point_of_sales/pointOfSales.types";
import { ToastAndroid } from "react-native";

export const save_electronic_invoice = async (
  sale: Sale,
  codigoGeneracion: string,
  token_mh: string,
  idEmployee: number,
  correlative: IPointOfSales,
  token: string
): Promise<IProcessSalesResponse> => {
  console.log("enter")
  const details = await get_details_sales(sale.id).then((respond) => {
    return respond;
  });

  const payForSale = await get_pays_for_sales(sale.id).then((respond) => {
    return respond.map((res) => ({
      codigo: res.codigo,
      montoPago: res.montoPago,
      referencia: res.referencia,
      plazo: null,
      periodo: null,
    }));
  });

  const products_cart = details.map((detail, index) => {
    return {
      numItem: index + 1,
      tipoItem: detail.tipoItem,
      uniMedida: detail.uniMedida,
      numeroDocumento: null,
      cantidad: detail.cantidadItem,
      codTributo: null,
      codigo: detail.branchProduct.product.code,
      descripcion: detail.branchProduct.product.name,
      precioUni: detail.precio,
      montoDescu: Number(detail.montoDescu.toFixed(2)),
      ventaNoSuj: 0,
      ventaExenta: 0,
      ventaGravada: detail.ventaGravada,
      ivaItem: Number(detail.ivaItem.toFixed(2)),
      tributos: null,
      psv: 0,
      noGravado: 0,
    };
  });

  const DTE: SVFE_FC_SEND = {
    nit: sale.transmitter.nit,
    activo: true,
    passwordPri: sale.transmitter.clavePrivada,
    dteJson: {
      identificacion: {
        version: 1,
        codigoGeneracion: codigoGeneracion,
        ambiente: ambiente,
        tipoDte: sale.tipoDte,
        numeroControl: generate_control(
          sale.tipoDte,
          correlative.codEstable,
          correlative.codPuntoVenta,
          formatearNumero(Number(correlative?.next))
        ),
        tipoModelo: 1,
        tipoOperacion: 1,
        tipoContingencia: null,
        motivoContin: null,
        tipoMoneda: "USD",
        ...getElSalvadorDateTime(),
      },
      documentoRelacionado: null,
      emisor: {
        ...generate_emisor(sale.transmitter, true, correlative),
      },
      receptor: { ...generate_receptor(sale.customer) },
      otrosDocumentos: null,
      ventaTercero: null,
      cuerpoDocumento: products_cart,
      resumen: {
        totalNoSuj: 0,
        totalExenta: 0,
        totalGravada: sale.totalGravada,
        subTotalVentas: sale.subTotalVentas,
        descuNoSuj: 0,
        descuExenta: 0,
        descuGravada: 0,
        porcentajeDescuento: sale.porcentajeDescuento,
        totalDescu: sale.totalDescu,
        tributos: null,
        subTotal: sale.subTotal,
        ivaRete1: 0,
        reteRenta: 0,
        totalIva: sale.totalIva,
        montoTotalOperacion: sale.montoTotalOperacion,
        totalNoGravado: 0,
        totalPagar: Number(sale.totalPagar),
        totalLetras: sale.totalLetras,
        saldoFavor: 0,
        condicionOperacion: sale.condicionOperacion,
        pagos: payForSale,
        numPagoElectronico: null,
      },
      extension: null,
      apendice: null,
    },
  };
  console.log(DTE)
  return await firmarDocumentoFactura(DTE)
    .then(async (firmador) => {
      console.log("se firmo el documento", firmador.data.body);
      if (firmador.data.body) {
        const data_send: PayloadMH = {
          ambiente: ambiente,
          idEnvio: 1,
          version: 1,
          tipoDte: "01",
          documento: firmador.data.body,
        };
        if (token_mh) {
          const source = axios.CancelToken.source();
          const timeout = setTimeout(() => {
            source.cancel("El tiempo de espera ha expirado");
          }, 25000);
          const result = await Promise.race([
            send_to_mh(data_send, token_mh!, source).then(async ({ data }) => {
              clearTimeout(timeout);
              if (data.selloRecibido) {
                const DTE_FORMED = {
                  ...DTE.dteJson,
                  respuestaMH: data,
                  firma: firmador.data.body,
                };

                if (DTE_FORMED) {
                  const JSON_uri =
                    FileSystem.documentDirectory +
                    DTE.dteJson.identificacion.numeroControl +
                    ".json";

                  return FileSystem.writeAsStringAsync(
                    JSON_uri,
                    JSON.stringify({
                      ...DTE_FORMED,
                    }),
                    {
                      encoding: FileSystem.EncodingType.UTF8,
                    }
                  )
                    .then(async () => {
                      const json_url = `CLIENTES/${
                        sale.transmitter.nombre
                      }/${new Date().getFullYear()}/VENTAS/FACTURAS/${formatDate()}/${
                        DTE.dteJson.identificacion.codigoGeneracion
                      }/${DTE.dteJson.identificacion.numeroControl}.json`;

                      const responseJSON = await fetch(JSON_uri);
                      const blobJSON = await responseJSON.blob();

                      if (!blobJSON) {
                        return {
                          ok: true,
                          isErrorMh: false,
                          title: "Problemas al crear el JSON",
                          message: "No se creo el JSON",
                        };
                      }
                      const jsonUploadParams = {
                        Bucket: SPACES_BUCKET,
                        Key: json_url,
                        Body: blobJSON!,
                      };
                      const resultJSON = await s3Client
                        .send(new PutObjectCommand(jsonUploadParams))
                        .catch(() => {
                          ToastAndroid.show(
                            "Error al subir el json",
                            ToastAndroid.LONG
                          );
                        });
                      if (jsonUploadParams && resultJSON) {
                        const payload = {
                          pdf: "N/A",
                          dte: json_url,
                          cajaId: sale.idBox,
                          codigoEmpleado: idEmployee,
                          sello: true,
                          clienteId: sale.customer.customerId,
                        };

                        return axios
                          .post(API_URL + "/sales/factura-sale", payload, {
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                          })
                          .then(() => {
                            return {
                              ok: true,
                              isErrorMh: false,
                              title: "Venta creada con éxito",
                              message: "Se creo la venta",
                            };
                          })
                          .catch(() => {
                            return {
                              ok: false,
                              isErrorMh: false,
                              title: "Error al sincronizar la venta",
                              message:
                                "No se guardaron los datos correctamente",
                            };
                          });
                      } else {
                        return {
                          ok: false,
                          isErrorMh: false,
                          title: "Error al subir el pdf",
                          message: "Error en respuesta del servidor",
                        };
                      }
                    })
                    .catch(() => {
                      return {
                        ok: false,
                        isErrorMh: false,
                        title: "Error al subir el pdf",
                        message: "El documento no se guardo correctamente",
                      };
                    })
                    .catch(() => {
                      return {
                        ok: false,
                        isErrorMh: false,
                        title: "Error inesperado",
                        message: "Ocurrió un error al formar el pdf",
                      };
                    });
                } else {
                  return {
                    ok: false,
                    isErrorMh: false,
                    title: "No se pudo generar el pdf",
                    message: "Ocurrió un error al generar el pdf",
                  };
                }
              } else {
                return {
                  ok: false,
                  isErrorMh: true,
                  title: "Hacienda no respondió con el sello",
                  message: "No se devolvió el sello",
                };
              }
            }),
            new Promise<never>((_, reject) => {
              setTimeout(() => {
                reject(new Error("El tiempo de espera ha expirado"));
              }, 60000);
            }),
          ]).catch(async (error: AxiosError<SendMHFailed>) => {
            clearTimeout(timeout);
            if (error.response?.status === 401) {
              return {
                ok: false,
                isErrorMh: false,
                title: "Error al sincronizar la venta",
                message: "No tienes los accesos necesarios",
              };
            } else {
              if (error.response?.data) {
                if (error.response?.data) {
                  return {
                    ok: false,
                    isErrorMh: true,
                    title: error.response?.data.descripcionMsg
                      ? error.response?.data.descripcionMsg
                      : "El Ministerio de Hacienda no pudo procesar la solicitud",
                    message:
                      error.response.data.observaciones &&
                      error.response.data.observaciones.length > 0
                        ? error.response?.data.observaciones.join("\n\n")
                        : error.response?.data.descripcionMsg
                        ? ""
                        : "El Ministerio de Hacienda no pudo responder a la solicitud. Por favor, inténtalo de nuevo más tarde.",
                  };
                }
                await save_logs({
                  title:
                    error.response.data.descripcionMsg ??
                    "Error al procesar venta",
                  message:
                    error.response.data.observaciones &&
                    error.response.data.observaciones.length > 0
                      ? error.response?.data.observaciones.join("\n\n")
                      : "",
                  generationCode: DTE.dteJson.identificacion.codigoGeneracion,
                });
                return {
                  ok: false,
                  isErrorMh: true,
                  title: error.response?.data.descripcionMsg,
                  message:
                    error.response?.data.observaciones &&
                    error.response?.data.observaciones.length > 0
                      ? error.response?.data.observaciones.join("\n\n")
                      : "",
                };
              } else {
                return {
                  ok: false,
                  isErrorMh: false,
                  title: "Error inesperado",
                  message: "Ocurrio un error inesperado",
                };
              }
            }
          });
          return result;
        } else {
          return {
            ok: false,
            isErrorMh: false,
            title: "No tienes los accesos necesarios",
            message: "No se encontró el acceso al Ministerio de Hacienda",
          };
        }
      } else {
        return {
          ok: false,
          isErrorMh: false,
          title: "Ocurrió un error inesperado",
          message: "No se devolvió la firma",
        };
      }
    })
    .catch(() => {
      return {
        ok: false,
        isErrorMh: false,
        title: "Error al firmar el documento",
        message: "Ocurrió un error al firmar el documento",
      };
    });
};

export const save_electronic_tax_credit = async (
  sale: Sale,
  codigoGeneracion: string,
  token_mh: string,
  idEmployee: number,
  correlatives: IPointOfSales,
  token: string
): Promise<IProcessSalesResponse> => {
  const details = await get_details_sales(sale.id).then((resspon) => {
    return resspon;
  });
  const payForSale = await get_pays_for_sales(sale.id).then((resspon) => {
    return resspon;
  });
  const tributes = await get_tribute_sale(sale.id).then((result) => {
    return result.map((res) => ({
      codigo: res.codigo,
      descripcion: res.descripcion,
      valor: res.monto,
    }));
  });
  const products_cart = details.map((detail, index) => {
    return {
      numItem: index + 1,
      tipoItem: detail.tipoItem,
      uniMedida: detail.uniMedida,
      numeroDocumento: null,
      cantidad: detail.cantidadItem,
      codTributo: null,
      codigo: detail.branchProduct.product.code,
      descripcion: detail.branchProduct.product.name,
      precioUni: detail.precio,
      montoDescu: Number(detail.montoDescu.toFixed(2)),
      ventaNoSuj: 0,
      ventaExenta: 0,
      ventaGravada: detail.ventaGravada,
      tributos: ["20"],
      psv: 0,
      noGravado: 0,
    };
  });

  const generate: SVFE_CF_SEND = {
    nit: sale.transmitter.nit,
    activo: true,
    passwordPri: sale.transmitter.clavePrivada,
    dteJson: {
      identificacion: {
        version: 3,
        codigoGeneracion: codigoGeneracion,
        ambiente: ambiente,
        tipoDte: sale.tipoDte,
        numeroControl: generate_control(
          sale.tipoDte,
          correlatives?.codEstable,
          correlatives?.codPuntoVenta,
          formatearNumero(Number(correlatives?.next))
        ),
        tipoModelo: 1,
        tipoOperacion: 1,
        tipoContingencia: null,
        motivoContin: null,
        tipoMoneda: "USD",
        ...getElSalvadorDateTime(),
      },
      documentoRelacionado: null,
      emisor: {
        ...generate_emisor_credit(sale.transmitter, correlatives),
      },
      receptor: { ...generate_receptor_credit(sale.customer) },
      otrosDocumentos: null,
      ventaTercero: null,
      cuerpoDocumento: products_cart,
      resumen: {
        totalNoSuj: 0,
        totalExenta: 0,
        totalGravada: sale.totalGravada,
        subTotalVentas: sale.subTotalVentas,
        descuNoSuj: 0,
        descuExenta: 0,
        descuGravada: 0,
        porcentajeDescuento: sale.porcentajeDescuento,
        totalDescu: sale.totalDescu,
        tributos: tributes,
        subTotal: sale.subTotal,
        ivaPerci1: 0,
        ivaRete1: 0,
        reteRenta: 0,
        montoTotalOperacion: sale.montoTotalOperacion,
        totalNoGravado: 0,
        totalPagar: Number(sale.totalPagar),
        totalLetras: sale.totalLetras,
        saldoFavor: 0,
        condicionOperacion: sale.condicionOperacion,
        pagos: payForSale,
        numPagoElectronico: null,
      },
      extension: null,
      apendice: null,
    },
  };

  return await firmarDocumentoFiscal(generate)
    .then(async (firma) => {
      if (firma.data.body) {
        const data_send: PayloadMH = {
          ambiente: ambiente,
          idEnvio: 1,
          version: 3,
          tipoDte: "03",
          documento: firma.data.body,
        };
        if (token_mh) {
          const source = axios.CancelToken.source();
          const timeout = setTimeout(() => {
            source.cancel("El tiempo de espera ha expirado");
          }, 60000);
          const result = await Promise.race([
            send_to_mh(data_send, token_mh, source).then(async ({ data }) => {
              clearTimeout(timeout);
              if (data.selloRecibido) {
                const DTE_FORMED = {
                  ...generate.dteJson,
                  respuestaMH: data,
                  firma: firma.data.body,
                };

                if (DTE_FORMED) {
                  const JSON_uri =
                    FileSystem.documentDirectory +
                    generate.dteJson.identificacion.numeroControl +
                    ".json";

                  return FileSystem.writeAsStringAsync(
                    JSON_uri,
                    JSON.stringify({
                      ...DTE_FORMED,
                    }),
                    {
                      encoding: FileSystem.EncodingType.UTF8,
                    }
                  )
                    .then(async () => {
                      const json_url = `CLIENTES/${
                        sale.transmitter.nombre
                      }/${new Date().getFullYear()}/VENTAS/CRÉDITO_FISCAL/${formatDate()}/${
                        generate.dteJson.identificacion.codigoGeneracion
                      }/${generate.dteJson.identificacion.numeroControl}.json`;

                      const responseJSON = await fetch(JSON_uri);
                      const blobJSON = await responseJSON.blob();

                      if (!blobJSON) {
                        return {
                          ok: true,
                          isErrorMh: false,
                          title: "Problemas al crear el JSON",
                          message: "No se creo el JSON",
                        };
                      }

                      const jsonUploadParams = {
                        Bucket: SPACES_BUCKET,
                        Key: json_url,
                        Body: blobJSON!,
                      };
                      const resultJSON = await s3Client
                        .send(new PutObjectCommand(jsonUploadParams))
                        .catch(() => {
                          ToastAndroid.show(
                            "Error al subir el json",
                            ToastAndroid.LONG
                          );
                        });
                      if (jsonUploadParams && resultJSON) {
                        const payload = {
                          pdf: "pdf_url",
                          dte: json_url,
                          cajaId: sale.idBox,
                          codigoEmpleado: idEmployee,
                          sello: true,
                          clienteId: sale.customer.customerId,
                        };

                        return axios
                          .post(
                            API_URL + "/sales/sale-fiscal-transaction",
                            payload,
                            {
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            }
                          )
                          .then(() => {
                            return {
                              ok: true,
                              isErrorMh: false,
                              title: "Venta creada con éxito",
                              message: "Se creo la venta",
                            };
                          })
                          .catch(() => {
                            return {
                              ok: false,
                              isErrorMh: false,
                              title: "Error al sincronizar la venta",
                              message:
                                "No se guardaron los datos correctamente",
                            };
                          });
                      } else {
                        return {
                          ok: false,
                          isErrorMh: false,
                          title: "Error inesperado",
                          message: "Error al formar los documentos",
                        };
                      }
                    })
                    .catch(() => {
                      return {
                        ok: false,
                        isErrorMh: false,
                        title: "Error inesperado",
                        message: "Error al subir el pdf",
                      };
                    });
                } else {
                  return {
                    ok: false,
                    isErrorMh: false,
                    title: "No se pudo generar el pdf",
                    message: "Ocurrió un error al generar el pdf",
                  };
                }
              } else {
                return {
                  ok: false,
                  isErrorMh: false,
                  title: "Hacienda no respondió con el sello",
                  message: "No se devolvió el sello",
                };
              }
            }),
            new Promise<never>((_, reject) => {
              setTimeout(() => {
                reject(new Error("El tiempo de espera ha expirado"));
              }, 60000);
            }),
          ]).catch(async (error: AxiosError<SendMHFailed>) => {
            clearTimeout(timeout);
            if (error.response?.status === 401) {
              return {
                ok: false,
                isErrorMh: false,
                title: "Error al sincronizar la venta",
                message: "No tienes los accesos necesarios",
              };
            } else {
              if (error.response?.data) {
                if (error.response?.data) {
                  return {
                    ok: false,
                    isErrorMh: false,
                    title: error.response?.data.descripcionMsg
                      ? error.response?.data.descripcionMsg
                      : "El Ministerio de Hacienda no pudo procesar la solicitud",
                    message:
                      error.response.data.observaciones &&
                      error.response.data.observaciones.length > 0
                        ? error.response?.data.observaciones.join("\n\n")
                        : error.response?.data.descripcionMsg
                        ? ""
                        : "El Ministerio de Hacienda no pudo responder a la solicitud. Por favor, inténtalo de nuevo más tarde.",
                  };
                }

                await save_logs({
                  title:
                    error.response.data.descripcionMsg ??
                    "Error al procesar venta",
                  message:
                    error.response.data.observaciones &&
                    error.response.data.observaciones.length > 0
                      ? error.response?.data.observaciones.join("\n\n")
                      : "",
                  generationCode:
                    generate.dteJson.identificacion.codigoGeneracion,
                });
                return {
                  ok: false,
                  isErrorMh: true,
                  title: error.response?.data.descripcionMsg,
                  message:
                    error.response?.data.observaciones &&
                    error.response?.data.observaciones.length > 0
                      ? error.response?.data.observaciones.join("\n\n")
                      : "",
                };
              } else {
                return {
                  ok: false,
                  isErrorMh: false,
                  title: "Error inesperado",
                  message: "Ocurrio un error inesperado",
                };
              }
            }
          });
          return result;
        } else {
          return {
            ok: false,
            isErrorMh: false,
            title: "No tienes los accesos necesarios",
            message: "No se encontró el acceso al Ministerio de Hacienda",
          };
        }
      } else {
        return {
          ok: false,
          isErrorMh: false,
          title: "Ocurrió un error inesperado",
          message: "No se devolvió la firma",
        };
      }
    })
    .catch(() => {
      return {
        ok: false,
        isErrorMh: false,
        title: "Error al firmar el documento",
        message: "Ocurrió un error al firmar el documento",
      };
    });
};
