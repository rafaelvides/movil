import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ICustomer } from "@/types/customer/customer.types";
import { ITransmitter } from "@/types/transmitter/transmiter.types";
import { ICat002TipoDeDocumento } from "@/types/billing/cat-002-tipo-de-documento.types";
import { ICartProduct } from "@/types/branch_product/branch_product.types";
import { IFormasDePagoResponse } from "@/types/billing/cat-017-forma-de-pago.types";
import { ITipoTributo } from "@/types/billing/cat-015-tipo-de-tributo.types";
import { return_token, return_token_mh } from "@/plugins/secure_store";
import axios, { AxiosError } from "axios";
import { ICheckResponse } from "@/types/dte/Check.types";
import {
  check_dte,
  firmarDocumentoFacturaSujetoExcluido,
  send_to_mh,
} from "@/services/ministry_of_finance.service";
import { ambiente, API_URL } from "@/utils/constants";
import { s3Client } from "@/plugins/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
  ResponseMHSuccess,
  SendMHFailed,
} from "@/types/svf_dte/responseMH/responseMH.types";
import { formatDate } from "@/utils/date";
import {
  get_box_data,
  get_configuration,
  get_employee_id,
  get_user,
} from "@/plugins/async_storage";
import { ElectronicExcludedSubject } from "@/plugins/DTE/ElectronicExcludedSubject";
import { useBranchProductStore } from "@/store/branch_product.store";
import { PayloadMH } from "@/types/dte/DTE.types";
import * as FileSystem from "expo-file-system";
import { save_logs } from "@/services/logs.service";
import { SVFE_FSE_SEND } from "@/types/svf_dte/fse.types";
import jsPDF from "jspdf";
import { makePDFSujetoExcluido } from "@/plugins/templates/template_excludedSubject";
import { useSaleStore } from "@/store/sale.store";
import { QR_URL } from "@/plugins/DTE/make_generator/qr_generate";
import { get_find_by_correlative } from "@/services/point_of_sale.service";

interface Props {
  customer: ICustomer | undefined;
  transmitter: ITransmitter;
  typeDocument: ICat002TipoDeDocumento | undefined;
  cart_products: ICartProduct[];
  pays: IFormasDePagoResponse[];
  conditionPayment: number;
  typeTribute: ITipoTributo | undefined;
  focusButton: boolean;
  totalUnformatted: number;
  setLoadingSave: Dispatch<SetStateAction<boolean>>;
  setMessage: Dispatch<SetStateAction<string>>;
  setShowModalSale: Dispatch<SetStateAction<boolean>>;
  setLoadingRevision: Dispatch<SetStateAction<boolean>>;
  clearAllData: () => void;
}
const ExcludedSubject = (props: Props) => {
  const {
    customer,
    typeDocument,
    transmitter,
    cart_products,
    setLoadingSave,
    setMessage,
    setShowModalSale,
    clearAllData,
    setLoadingRevision,
    pays,
    conditionPayment,
    focusButton,
    totalUnformatted,
  } = props;
  const { descuentoPorProducto, reteRenta } = useBranchProductStore();
  const [responseMH, setResponseMH] = useState<{
    respuestaMH: ResponseMHSuccess;
    firma: string;
  }>({
    respuestaMH: {
      ambiente: "",
      clasificaMsg: "",
      codigoGeneracion: "",
      codigoMsg: "",
      descripcionMsg: "",
      estado: "",
      fhProcesamiento: "",
      observaciones: [],
      selloRecibido: "",
      version: 0,
      versionApp: 0,
    },
    firma: "",
  });
  const [currentDTE, setCurrentDTE] = useState<SVFE_FSE_SEND>();
  const { OnImgPDF, img_invalidation, img_logo } = useSaleStore();

  useEffect(() => {
    (async () => {
      await get_configuration().then((data) => {
        OnImgPDF(String(data?.logo));
      });
    })();
  }, []);

  const total = useMemo(() => {
    return totalUnformatted - reteRenta;
  }, [pays]);
  const generateTaxCredit = async () => {
    if (conditionPayment === 0) {
      ToastAndroid.show("Debes seleccionar una condición", ToastAndroid.SHORT);
      return;
    }
    const tipo_pago = pays.filter((type) => {
      if (conditionPayment === 1) {
        if (type.codigo !== "") {
          if (type.monto > 0) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        if (type.monto > 0 && type.periodo > 0 && type.plazo !== "") {
          return true;
        } else {
          return false;
        }
      }
    });
    const total_filteres = tipo_pago
      .map((a) => a.monto)
      .reduce((a, b) => a + b, 0);
    if (total_filteres !== totalUnformatted) {
      ToastAndroid.show(
        "Los montos de las formas de pago no coinciden con el total de la compra",
        ToastAndroid.SHORT
      );
      return;
    }
    if (tipo_pago.length === 0) {
      ToastAndroid.show(
        "Debes agregar al menos una forma de pago",
        ToastAndroid.SHORT
      );
      return;
    }
    if (!typeDocument) {
      ToastAndroid.show(
        "Debes seleccionar el tipo de documento",
        ToastAndroid.SHORT
      );
      return;
    }
    if (!customer) {
      ToastAndroid.show("Debes seleccionar el cliente", ToastAndroid.SHORT);
      return;
    }
    const correlatives = await get_find_by_correlative(transmitter.id, "14");

    if (!correlatives.data.correlativo) {
      ToastAndroid.show("No se encontraron correlativos", ToastAndroid.SHORT);
      return;
    }
    const box = await get_box_data();

    if (!box) {
      ToastAndroid.show("No se encontró la caja", ToastAndroid.SHORT);
      return;
    }

    const codeEmployee = await get_employee_id();

    if (!codeEmployee) {
      ToastAndroid.show("No se encontró el empleado", ToastAndroid.SHORT);
      return;
    }
    const generate_excluded = ElectronicExcludedSubject(
      transmitter,
      correlatives!.data.correlativo,
      typeDocument,
      customer,
      cart_products,
      tipo_pago.map((a) => {
        return {
          codigo: a.codigo,
          montoPago: a.monto,
          plazo: conditionPayment === 1 ? null : a.plazo,
          periodo: conditionPayment === 1 ? null : a.periodo,
          referencia: "",
        };
      }),
      conditionPayment,
      totalUnformatted,
      total,
      reteRenta,
      descuentoPorProducto
    );

    setCurrentDTE(generate_excluded);
    setLoadingSave(true);
    setMessage("Estamos firmando tu documento");
    firmarDocumentoFacturaSujetoExcluido(generate_excluded)
      .then(async (firma) => {
        const token_mh = await return_token_mh();
        if (firma.data.body) {
          const data_send: PayloadMH = {
            ambiente: ambiente,
            idEnvio: 1,
            version: 1,
            tipoDte: "14",
            documento: firma.data.body,
          };
          setMessage("Se ah enviado a hacienda, esperando respuesta...");
          if (token_mh) {
            const source = axios.CancelToken.source();
            const timeoutId = setTimeout(() => {
              source.cancel("El tiempo de espera ha expirado");
              setLoadingSave(false);
            }, 60000);
            Promise.race([
              send_to_mh(data_send, token_mh).then(async ({ data }) => {
                clearTimeout(timeoutId);
                if (data.selloRecibido) {
                  setMessage("El DTE ah sido validado por hacienda");
                  const DTE_FORMED = {
                    ...generate_excluded.dteJson,
                    respuestaMH: data,
                    firma: firma.data.body,
                  };
                  setResponseMH(DTE_FORMED);
                  const doc = new jsPDF();
                  const QR = QR_URL(
                    DTE_FORMED.identificacion.codigoGeneracion,
                    DTE_FORMED.identificacion.fecEmi
                  );
                  const blobQR = await axios.get<ArrayBuffer>(QR, {
                    responseType: "arraybuffer",
                  });
                  const document_gen = makePDFSujetoExcluido(
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
                      generate_excluded.dteJson.identificacion.numeroControl +
                      ".json";

                    FileSystem.writeAsStringAsync(
                      JSON_uri,
                      JSON.stringify({
                        ...DTE_FORMED,
                      }),
                      {
                        encoding: FileSystem.EncodingType.UTF8,
                      }
                    )
                      .then(async () => {
                        const pdf_url = `CLIENTES/${
                          transmitter.nombre
                        }/${new Date().getFullYear()}/VENTAS/SUJETO-EXCLUIDO/${formatDate()}/${
                          generate_excluded.dteJson.identificacion
                            .codigoGeneracion
                        }/${
                          generate_excluded.dteJson.identificacion.numeroControl
                        }.pdf`;
                        const json_url = `CLIENTES/${
                          transmitter.nombre
                        }/${new Date().getFullYear()}/VENTAS/SUJETO-EXCLUIDO/${formatDate()}/${
                          generate_excluded.dteJson.identificacion
                            .codigoGeneracion
                        }/${
                          generate_excluded.dteJson.identificacion.numeroControl
                        }.json`;

                        setMessage("Estamos generando los documentos");
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

                        if (!response) {
                          setLoadingSave(false);
                          return;
                        }

                        const blob = await response.blob();
                        const pdfUploadParams = {
                          Bucket: "facturacion-seedcode",
                          Key: pdf_url,
                          Body: blob,
                        };

                        const blobJSON = await fetch(JSON_uri)
                          .then((res) => res.blob())
                          .catch(() => {
                            ToastAndroid.show(
                              "Error al generar la url del documento",
                              ToastAndroid.LONG
                            );
                            setLoadingSave(false);
                            return null;
                          });
                        if (!blobJSON) {
                          setLoadingSave(false);
                          return;
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
                                  .then((response) => {
                                    if (response.$metadata) {
                                      setMessage(
                                        "Estamos guardando tus documentos"
                                      );
                                      const payload = {
                                        pdf: pdf_url,
                                        dte: json_url,
                                        cajaId: box.id,
                                        codigoEmpleado: codeEmployee,
                                        sello: true,
                                        clienteId: customer?.id,
                                      };
                                      return_token()
                                        .then((token) => {
                                          axios
                                            .post(
                                              API_URL +
                                                "/sales/credit-transaction",
                                              payload,
                                              {
                                                headers: {
                                                  Authorization: `Bearer ${token}`,
                                                },
                                              }
                                            )
                                            .then(() => {
                                              setMessage("");
                                              Alert.alert(
                                                "Éxito",
                                                "Se completaron todos los procesos"
                                              );
                                              setLoadingSave(false);
                                              setShowModalSale(false);
                                              clearAllData();
                                            })
                                            .catch(() => {
                                              ToastAndroid.show(
                                                "Error al guarda la venta",
                                                ToastAndroid.LONG
                                              );
                                              setMessage(
                                                "Se produjo un error al guardar la venta en nuestra base de datos"
                                              );
                                              setLoadingSave(false);
                                            });
                                        })
                                        .catch(() => {
                                          setLoadingSave(false);
                                          ToastAndroid.show(
                                            "No tienes el acceso necesario",
                                            ToastAndroid.LONG
                                          );
                                        });
                                    } else {
                                      setLoadingSave(false);
                                      ToastAndroid.show(
                                        "Error inesperado, contacte al equipo de soporte1",
                                        ToastAndroid.LONG
                                      );
                                    }
                                  })
                                  .catch(() => {
                                    setLoadingSave(false);
                                    ToastAndroid.show(
                                      "Ocurrió un error al subir el PDF",
                                      ToastAndroid.LONG
                                    );
                                  });
                              } else {
                                setLoadingSave(false);
                                ToastAndroid.show(
                                  "Error inesperado, contacte al equipo de soporte",
                                  ToastAndroid.LONG
                                );
                              }
                            })
                            .catch(() => {
                              setLoadingSave(false);
                              ToastAndroid.show(
                                "Ocurrió un error al subir el Json",
                                ToastAndroid.LONG
                              );
                            });
                        } else {
                          setLoadingSave(false);
                          ToastAndroid.show(
                            "No tienes los documentos",
                            ToastAndroid.LONG
                          );
                        }
                      })
                      .catch(() => {
                        setLoadingSave(false);
                        ToastAndroid.show(
                          "Ocurrió un error en el Json",
                          ToastAndroid.LONG
                        );
                      });
                  } else {
                    ToastAndroid.show(
                      "Hubo un error al generar la información",
                      ToastAndroid.LONG
                    );
                    setLoadingSave(false);
                  }
                } else {
                  setLoadingSave(false);
                  ToastAndroid.show(
                    "Hacienda no respondió con el sello",
                    ToastAndroid.LONG
                  );
                }
              }),
              new Promise((_, reject) => {
                setTimeout(() => {
                  reject(new Error("El tiempo de espera ha expirado"));
                }, 60000);
              }),
            ]).catch(async (error: AxiosError<SendMHFailed>) => {
              clearTimeout(timeoutId);
              if (error.response?.status === 401) {
                ToastAndroid.show(
                  "No tienes los accesos necesarios",
                  ToastAndroid.LONG
                );
                setLoadingSave(false);
                return;
              } else {
                if (error.response?.data) {
                  Alert.alert(
                    error.response?.data.descripcionMsg
                      ? error.response?.data.descripcionMsg
                      : "El Ministerio de Hacienda no pudo procesar la solicitud",
                    error.response.data.observaciones &&
                      error.response.data.observaciones.length > 0
                      ? error.response?.data.observaciones.join("\n\n")
                      : error.response?.data.descripcionMsg
                      ? ""
                      : "El Ministerio de Hacienda no pudo responder a la solicitud. Por favor, inténtalo de nuevo más tarde.",
                    [
                      {
                        text: "Reintentar",
                        onPress: () => generateTaxCredit(),
                      },
                      {
                        text: "Revisar",
                        onPress: () => {
                          handleVerify();
                        },
                      },
                      {
                        text: "Enviar a contingencia",
                        onPress: () => handleContigence(),
                      },
                    ]
                  );
                  setLoadingSave(false);
                  return;
                } else {
                  ToastAndroid.show(
                    "Ah ocurrido un error, consulte al equipo de soporte técnico",
                    ToastAndroid.LONG
                  );
                  setLoadingSave(false);
                }
              }
              if (error.response?.data) {
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
                    generate_excluded.dteJson.identificacion.codigoGeneracion,
                });
              }
            });
          } else {
            ToastAndroid.show(
              "No se ha podido obtener el token de hacienda",
              ToastAndroid.LONG
            );
            setLoadingSave(false);
          }
        } else {
          ToastAndroid.show(
            "No se proporciono la firma necesaria",
            ToastAndroid.LONG
          );
          setLoadingSave(false);
        }
      })
      .catch(() => {
        Alert.alert(
          "Error al firmar el documento",
          "Intenta firmar el documento mas tarde o contacta al equipo de soporte"
        );
        setLoadingSave(false);
      });
  };
  const handleContigence = async () => {
    setLoadingSave(true);
    setMessage(
      "Estamos realizando el evento\n de contingencia, Espera un momento..."
    );
    const user = await get_user();

    if (currentDTE) {
      const JSON_uri =
        FileSystem.documentDirectory +
        currentDTE.dteJson.identificacion.numeroControl +
        ".json";

      FileSystem.writeAsStringAsync(
        JSON_uri,
        JSON.stringify({
          ...currentDTE.dteJson,
        }),
        {
          encoding: FileSystem.EncodingType.UTF8,
        }
      )
        .then(async () => {
          setMessage("Estamos procesando la información, Espera un momento...");
          const json_url = `CLIENTES/${
            transmitter.nombre
          }/${new Date().getFullYear()}/VENTAS/SUJETO-EXCLUIDO/${formatDate()}/${
            currentDTE.dteJson.identificacion.codigoGeneracion
          }/${currentDTE.dteJson.identificacion.numeroControl}.json`;

          const blobJSON = await fetch(JSON_uri)
            .then((res) => res.blob())
            .catch(() => {
              ToastAndroid.show(
                "Error al generar la url del documento",
                ToastAndroid.LONG
              );
              setLoadingSave(false);
              return null;
            });

          if (!blobJSON) {
            setLoadingSave(false);
            return;
          }

          const jsonUploadParams = {
            Bucket: "facturacion-seedcode",
            Key: json_url,
            Body: blobJSON!,
          };

          if (jsonUploadParams) {
            setMessage(
              "Subiendo los archivos\n y guardando el evento, Espera un momento..."
            );
            s3Client
              .send(new PutObjectCommand(jsonUploadParams))
              .then((response) => {
                if (response.$metadata) {
                  const payload = {
                    dte: json_url,
                    cajaId: Number(50),
                    codigoEmpleado: "",
                    sello: false,
                    clienteId: customer?.id,
                  };
                  return_token()
                    .then((token) => {
                      axios
                        .post(API_URL + "/sales/credit-sale", payload, {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        })
                        .then(() => {
                          setMessage("");
                          Alert.alert(
                            "Éxito",
                            "La venta se envió a contingencia"
                          );
                          setLoadingSave(false);
                          setShowModalSale(false);
                          clearAllData();
                        })
                        .catch(() => {
                          setMessage("Error al guardar la venta");
                          setLoadingSave(false);
                        });
                    })
                    .catch(() => {
                      setLoadingSave(false);
                      ToastAndroid.show(
                        "No tienes el acceso necesario",
                        ToastAndroid.LONG
                      );
                    });
                } else {
                  setLoadingSave(false);
                  ToastAndroid.show(
                    "Error inesperado, contacte al equipo de soporte",
                    ToastAndroid.LONG
                  );
                }
              })
              .catch(() => {
                setLoadingSave(false);
                ToastAndroid.show(
                  "Ocurrió un error al subir el archivo",
                  ToastAndroid.LONG
                );
              });
          } else {
            setLoadingSave(false);
            ToastAndroid.show(
              "Ocurrió un error al crear el Json",
              ToastAndroid.LONG
            );
          }
        })
        .catch(() => {
          setLoadingSave(false);
          ToastAndroid.show("Ocurrió un error en el Json", ToastAndroid.LONG);
        });
    } else {
      ToastAndroid.show(
        "Se produjo un error al obtener los datos",
        ToastAndroid.LONG
      );
    }
  };
  const handleVerify = () => {
    setLoadingRevision(true);
    if (currentDTE?.dteJson.identificacion && transmitter) {
      const payload = {
        nitEmisor: transmitter.nit,
        tdte: currentDTE.dteJson.identificacion.tipoDte ?? "01",
        codigoGeneracion:
          currentDTE.dteJson.identificacion.codigoGeneracion ?? "",
      };
      return_token_mh()
        .then((token_mh) => {
          check_dte(payload, String(token_mh))
            .then(async (response) => {
              if (response.data.selloRecibido) {
                setLoadingRevision(false);
                setLoadingSave(true);
                setMessage(
                  "El DTE se encontró en hacienda,\n se están generando los documentos..."
                );
                const DTE_FORMED = {
                  ...currentDTE.dteJson,
                  ...responseMH,
                };

                const doc = new jsPDF();
                const QR = QR_URL(
                  DTE_FORMED.identificacion.codigoGeneracion,
                  DTE_FORMED.identificacion.fecEmi
                );
                const blobQR = await axios.get<ArrayBuffer>(QR, {
                  responseType: "arraybuffer",
                });
                const document_gen = makePDFSujetoExcluido(
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
                    currentDTE.dteJson.identificacion.numeroControl +
                    ".json";

                  FileSystem.writeAsStringAsync(
                    JSON_uri,
                    JSON.stringify({
                      ...DTE_FORMED,
                    }),
                    {
                      encoding: FileSystem.EncodingType.UTF8,
                    }
                  ).then(async () => {
                    const pdf_url = `CLIENTES/${
                      transmitter.nombre
                    }/${new Date().getFullYear()}/VENTAS/SUJETO-EXCLUIDO/${formatDate()}/${
                      currentDTE.dteJson.identificacion.codigoGeneracion
                    }/${currentDTE.dteJson.identificacion.numeroControl}.pdf`;
                    const json_url = `CLIENTES/${
                      transmitter.nombre
                    }/${new Date().getFullYear()}/VENTAS/SUJETO-EXCLUIDO/${formatDate()}/${
                      currentDTE.dteJson.identificacion.codigoGeneracion
                    }/${currentDTE.dteJson.identificacion.numeroControl}.json`;
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

                    if (!response) {
                      setLoadingSave(false);
                      return;
                    }

                    const blob = await response.blob();
                    const pdfUploadParams = {
                      Bucket: "facturacion-seedcode",
                      Key: pdf_url,
                      Body: blob,
                    };

                    const blobJSON = await fetch(JSON_uri)
                      .then((res) => res.blob())
                      .catch(() => {
                        ToastAndroid.show(
                          "Error al generar la url del documento",
                          ToastAndroid.LONG
                        );
                        setLoadingSave(false);
                        return null;
                      });
                    if (!blobJSON) {
                      setLoadingSave(false);
                      return;
                    }

                    const jsonUploadParams = {
                      Bucket: "facturacion-seedcode",
                      Key: json_url,
                      Body: blobJSON!,
                    };
                    setMessage("Se están subiendo los documentos...");
                    if (jsonUploadParams && pdfUploadParams) {
                      s3Client
                        .send(new PutObjectCommand(jsonUploadParams))
                        .then((response) => {
                          if (response.$metadata) {
                            s3Client
                              .send(new PutObjectCommand(pdfUploadParams))
                              .then((response) => {
                                if (response.$metadata) {
                                  setMessage(
                                    "Se esta guardando el DTE en nuestra base de datos..."
                                  );
                                  const payload = {
                                    pdf: pdf_url,
                                    dte: json_url,
                                    cajaId: Number(50),
                                    sello: true,
                                    clienteId: customer?.id,
                                  };
                                  return_token()
                                    .then((token) => {
                                      axios
                                        .post(
                                          API_URL + "/sales/credit-transaction",
                                          payload,
                                          {
                                            headers: {
                                              Authorization: `Bearer ${token}`,
                                            },
                                          }
                                        )
                                        .then(() => {
                                          setMessage("");
                                          Alert.alert(
                                            "Éxito",
                                            "Se completaron todos los procesos"
                                          );
                                          setLoadingRevision(true);
                                          setShowModalSale(false);
                                          clearAllData();
                                        })
                                        .catch(() => {
                                          ToastAndroid.show(
                                            "Error al guarda la venta",
                                            ToastAndroid.LONG
                                          );
                                          setMessage(
                                            "Se produjo un error al guardar la venta en nuestra base de datos"
                                          );
                                          setLoadingSave(false);
                                        });
                                    })
                                    .catch(() => {
                                      setLoadingSave(false);
                                      ToastAndroid.show(
                                        "No tienes el acceso necesario",
                                        ToastAndroid.LONG
                                      );
                                    });
                                } else {
                                  setLoadingSave(false);
                                  ToastAndroid.show(
                                    "Error inesperado, contacte al equipo de soporte1",
                                    ToastAndroid.LONG
                                  );
                                }
                              })
                              .catch(() => {
                                setLoadingSave(false);
                                ToastAndroid.show(
                                  "Ocurrió un error al subir el PDF",
                                  ToastAndroid.LONG
                                );
                              });
                          } else {
                            setLoadingSave(false);
                            ToastAndroid.show(
                              "Error inesperado, contacte al equipo de soporte",
                              ToastAndroid.LONG
                            );
                          }
                        })
                        .catch(() => {
                          setLoadingSave(false);
                          ToastAndroid.show(
                            "Ocurrió un error al subir el Json",
                            ToastAndroid.LONG
                          );
                        });
                    } else {
                      setLoadingSave(false);
                      ToastAndroid.show(
                        "No tienes los documentos",
                        ToastAndroid.LONG
                      );
                    }
                  });
                }
              }
            })
            .catch((error: AxiosError<ICheckResponse>) => {
              setLoadingRevision(false);
              if (error.status === 500) {
                Alert.alert("No encontrado", "DTE no encontrado en hacienda");
                return;
              }
              Alert.alert(
                "Error",
                `${
                  error.response?.data.descripcionMsg ??
                  "DTE no encontrado en hacienda"
                }`
              );
            });
        })
        .catch(() => {
          setLoadingRevision(false);
          ToastAndroid.show("No tienes el acceso necesario", ToastAndroid.LONG);
        });
    }
  };
  return (
    <>
      {!focusButton && (
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Pressable
            onPress={generateTaxCredit}
            style={{
              width: "84%",
              padding: 16,
              borderRadius: 4,
              backgroundColor: "#1d4ed8",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              Generar la venta
            </Text>
          </Pressable>
        </View>
      )}
    </>
  );
};

export default ExcludedSubject;

const styles = StyleSheet.create({});
