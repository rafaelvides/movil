import {
  firmarDocumentoFactura,
  firmarDocumentoFiscal,
  send_to_mh,
} from "@/services/ministry_of_finance.service";
import { PayloadMH } from "@/types/dte/DTE.types";
import { SVFC_FC_Firmado, SVFE_FC_SEND } from "@/types/svf_dte/fc.types";
import {
  IProcessSalesResponse,
  SendMHFailed,
} from "@/types/svf_dte/responseMH/responseMH.types";
import { ITransmitter } from "@/types/transmitter/transmiter.types";
import { ambiente, API_URL } from "@/utils/constants";
import axios, { AxiosError } from "axios";
import { QR_URL } from "./make_generator/qr_generate";
import jsPDF from "jspdf";
import { generateFacturaComercial } from "../templates/template_fe";
import * as FileSystem from "expo-file-system";
import { formatDate } from "@/utils/date";
import { s3Client } from "../s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { return_token } from "../secure_store";
import { save_logs } from "@/services/logs.service";
import { SVFC_CF_Firmado, SVFE_CF_SEND } from "@/types/svf_dte/cf.types";
import { generateCreditoFiscal } from "../templates/template_cf";

export const save_electronic_invoice = async (
  transmitter: ITransmitter,
  token_mh: string,
  box_id: number,
  idEmployee: number,
  img_logo: string | null,
  clienteId: number,
  img_invalidation: string | null,
  saleDTE: SVFC_FC_Firmado
): Promise<IProcessSalesResponse | undefined> => {
  const DTE: SVFE_FC_SEND = {
    nit: transmitter.nit,
    activo: true,
    passwordPri: transmitter.clavePublica,
    dteJson: {
      identificacion: saleDTE.identificacion,
      documentoRelacionado: null,
      emisor: saleDTE.emisor,
      receptor: saleDTE.receptor,
      otrosDocumentos: null,
      ventaTercero: null,
      cuerpoDocumento: saleDTE.cuerpoDocumento,
      resumen: saleDTE.resumen,
      extension: null,
      apendice: null,
    },
  };
  return await firmarDocumentoFactura(DTE)
    .then(async (firmador) => {
      if (firmador.data.body) {
        const data_send: PayloadMH = {
          ambiente: ambiente,
          idEnvio: 1,
          version: 1,
          tipoDte: saleDTE.identificacion.tipoDte ?? "01",
          documento: firmador.data.body,
        };

        if (token_mh) {
          const source = axios.CancelToken.source();
          const timeout = setTimeout(() => {
            source.cancel("El tiempo de espera ha expirado");
          }, 60000);
          const result = await Promise.race([
            send_to_mh(data_send, token_mh).then(async ({ data }) => {
              clearTimeout(timeout);

              if (data.selloRecibido) {
                const DTE_FORMED = {
                  ...DTE.dteJson,
                  respuestaMH: data,
                  firma: firmador.data.body,
                };

                const doc = new jsPDF();
                const QR = QR_URL(
                  DTE_FORMED.identificacion.codigoGeneracion,
                  DTE_FORMED.identificacion.fecEmi
                );

                const blobQR = await axios.get<ArrayBuffer>(QR, {
                  responseType: "arraybuffer",
                });

                const document_gen = generateFacturaComercial(
                  doc,
                  DTE_FORMED,
                  new Uint8Array(blobQR.data),
                  img_invalidation,
                  img_logo,
                  false
                );

                if (document_gen) {
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
                        transmitter.nombre
                      }/${new Date().getFullYear()}/VENTAS/FACTURAS/${formatDate()}/${
                        DTE.dteJson.identificacion.codigoGeneracion
                      }/${DTE.dteJson.identificacion.numeroControl}.json`;

                      const pdf_url = `CLIENTES/${
                        transmitter.nombre
                      }/${new Date().getFullYear()}/VENTAS/FACTURAS/${formatDate()}/${
                        DTE.dteJson.identificacion.codigoGeneracion
                      }/${DTE.dteJson.identificacion.numeroControl}.pdf`;
                      const filePath = `${FileSystem.documentDirectory}example.pdf`;
                      await FileSystem.writeAsStringAsync(
                        filePath,
                        document_gen.replace(
                          /^data:application\/pdf;filename=generated\.pdf;base64,/,
                          ""
                        ),
                        {
                          encoding: FileSystem.EncodingType.Base64,
                        }
                      );

                      const response = await fetch(filePath);
                      const blob = await response.blob();
                      const pdfUploadParams = {
                        Bucket: "facturacion-seedcode",
                        Key: pdf_url,
                        Body: blob,
                      };

                      const blobJSON = await fetch(JSON_uri)
                        .then((res) => res.blob())
                        .catch(() => {
                          return null;
                        });
                      if (!blobJSON) {
                        return {
                          ok: false,
                          isErrorMh: false,
                          title: "res.title",
                          message: "res.message",
                        };
                      }
                      const jsonUploadParams = {
                        Bucket: "facturacion-seedcode",
                        Key: json_url,
                        Body: blobJSON!,
                      };

                      if (jsonUploadParams && pdfUploadParams) {
                        s3Client
                          .send(new PutObjectCommand(jsonUploadParams))
                          .then((response) => {
                            if (response.$metadata) {
                              s3Client
                                .send(new PutObjectCommand(pdfUploadParams))
                                .then(async(response) => {
                                  if (response.$metadata) {
                                    const payload = {
                                      pdf: pdf_url,
                                      dte: json_url,
                                      sello: true,
                                    };
                                    await return_token()
                                      .then((token) => {
                                        return axios
                                          .put(
                                            API_URL +
                                              "/sales/sale-update-transaction",
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
                                              title:
                                                "Error al sincronizar la venta",
                                              message:
                                                "No se guardaron los datos correctamente",
                                            };
                                          });
                                      })
                                      .catch(() => {
                                        return {
                                          ok: false,
                                          isErrorMh: false,
                                          title:
                                            "Error al sincronizar la venta",
                                          message:
                                            "No tienes los accesos necesarios",
                                        };
                                      });
                                  } else {
                                    return {
                                      ok: false,
                                      isErrorMh: false,
                                      title: "Error al subir el pdf",
                                      message:
                                        "Error en respuesta del servidor",
                                    };
                                  }
                                })
                                .catch(() => {
                                  return {
                                    ok: false,
                                    isErrorMh: false,
                                    title: "Error al subir el pdf",
                                    message:
                                      "El documento no se guardo correctamente",
                                  };
                                });
                            } else {
                              return {
                                ok: false,
                                isErrorMh: false,
                                title: "Error al subir el DTE",
                                message: "Error en respuesta del servidor",
                              };
                            }
                          })
                          .catch(() => {
                            return {
                              ok: false,
                              isErrorMh: false,
                              title: "Error al subir el DTE",
                              message:
                                "El documento no se guardo correctamente",
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
                  ok: true,
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
                  generationCode: DTE.dteJson.identificacion.codigoGeneracion,
                });
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
  transmitter: ITransmitter,
  token_mh: string,
  box_id: number,
  idEmployee: number,
  img_logo: string | null,
  clienteId: number,
  img_invalidation: string | null,
  saleDTE: SVFC_CF_Firmado
): Promise<IProcessSalesResponse | undefined> => {
  const DTE: SVFE_CF_SEND = {
    nit: transmitter.nit,
    activo: true,
    passwordPri: transmitter.clavePublica,
    dteJson: {
      identificacion: saleDTE.identificacion,
      documentoRelacionado: null,
      emisor: saleDTE.emisor,
      receptor: saleDTE.receptor,
      otrosDocumentos: null,
      ventaTercero: null,
      cuerpoDocumento: saleDTE.cuerpoDocumento,
      resumen: saleDTE.resumen,
      extension: null,
      apendice: null,
    },
  };
  return await firmarDocumentoFiscal(DTE)
    .then(async (firmador) => {
      if (firmador.data.body) {
        const data_send: PayloadMH = {
          ambiente: ambiente,
          idEnvio: 1,
          version: 3,
          tipoDte: saleDTE.identificacion.tipoDte ?? "03",
          documento: firmador.data.body,
        };
        if (token_mh) {
          const source = axios.CancelToken.source();
          const timeout = setTimeout(() => {
            source.cancel("El tiempo de espera ha expirado");
          }, 60000);
          const result = await Promise.race([
            send_to_mh(data_send, token_mh).then(async ({ data }) => {
              clearTimeout(timeout);
              if (data.selloRecibido) {
                const DTE_FORMED = {
                  ...DTE.dteJson,
                  respuestaMH: data,
                  firma: firmador.data.body,
                };

                const doc = new jsPDF();
                const QR = QR_URL(
                  DTE_FORMED.identificacion.codigoGeneracion,
                  DTE_FORMED.identificacion.fecEmi
                );

                const blobQR = await axios.get<ArrayBuffer>(QR, {
                  responseType: "arraybuffer",
                });
                const document_gen = generateCreditoFiscal(
                  doc,
                  DTE_FORMED,
                  new Uint8Array(blobQR.data),
                  img_invalidation,
                  img_logo,
                  false
                );
                if (document_gen) {
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
                        transmitter.nombre
                      }/${new Date().getFullYear()}/VENTAS/CRÉDITO_FISCAL/${formatDate()}/${
                        DTE.dteJson.identificacion.codigoGeneracion
                      }/${DTE.dteJson.identificacion.numeroControl}.json`;

                      const pdf_url = `CLIENTES/${
                        transmitter.nombre
                      }/${new Date().getFullYear()}/VENTAS/CRÉDITO_FISCAL/${formatDate()}/${
                        DTE.dteJson.identificacion.codigoGeneracion
                      }/${DTE.dteJson.identificacion.numeroControl}.pdf`;
                      const filePath = `${FileSystem.documentDirectory}example.pdf`;
                      await FileSystem.writeAsStringAsync(
                        filePath,
                        document_gen.replace(
                          /^data:application\/pdf;filename=generated\.pdf;base64,/,
                          ""
                        ),
                        {
                          encoding: FileSystem.EncodingType.Base64,
                        }
                      );
                      const response = await fetch(filePath);
                      const blob = await response.blob();
                      const pdfUploadParams = {
                        Bucket: "facturacion-seedcode",
                        Key: pdf_url,
                        Body: blob,
                      };
                      const blobJSON = await fetch(JSON_uri)
                        .then((res) => res.blob())
                        .catch(() => {
                          return null;
                        });
                      if (!blobJSON) {
                        return {
                          ok: true,
                          isErrorMh: false,
                          title: "res.title",
                          message: "res.message",
                        };
                      }
                      const jsonUploadParams = {
                        Bucket: "facturacion-seedcode",
                        Key: json_url,
                        Body: blobJSON!,
                      };

                      if (jsonUploadParams && pdfUploadParams) {
                        s3Client
                          .send(new PutObjectCommand(jsonUploadParams))
                          .then((response) => {
                            if (response.$metadata) {
                              s3Client
                                .send(new PutObjectCommand(pdfUploadParams))
                                .then(async (response) => {
                                  if (response.$metadata) {
                                    const payload = {
                                      pdf: pdf_url,
                                      dte: json_url,
                                      cajaId: box_id,
                                      codigoEmpleado: idEmployee,
                                      sello: true,
                                      clienteId: clienteId,
                                    };
                                    await return_token()
                                      .then((token) => {
                                        return axios
                                          .put(
                                            API_URL +
                                              "/sales/sale-update-transaction",
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
                                              title:
                                                "Error al sincronizar la venta",
                                              message:
                                                "No se guardaron los datos correctamente",
                                            };
                                          });
                                      })
                                      .catch(() => {
                                        return {
                                          ok: false,
                                          isErrorMh: false,
                                          title:
                                            "Error al sincronizar la venta",
                                          message:
                                            "No tienes los accesos necesarios",
                                        };
                                      });
                                  } else {
                                    return {
                                      ok: false,
                                      isErrorMh: false,
                                      title: "Error al subir el pdf",
                                      message:
                                        "Error en respuesta del servidor",
                                    };
                                  }
                                })
                                .catch(() => {
                                  return {
                                    ok: false,
                                    isErrorMh: false,
                                    title: "Error al subir el pdf",
                                    message:
                                      "El documento no se guardo correctamente",
                                  };
                                });
                            } else {
                              return {
                                ok: false,
                                isErrorMh: false,
                                title: "Error al subir el DTE",
                                message: "Error en respuesta del servidor",
                              };
                            }
                          })
                          .catch(() => {
                            return {
                              ok: false,
                              isErrorMh: false,
                              title: "Error al subir el DTE",
                              message:
                                "El documento no se guardo correctamente",
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
                  ok: true,
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
                  generationCode: DTE.dteJson.identificacion.codigoGeneracion,
                });
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
