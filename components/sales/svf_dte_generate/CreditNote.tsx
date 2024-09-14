import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useSaleStore } from "@/store/sale.store";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTransmitterStore } from "@/store/transmitter.store";
import {
  check_dte,
  firmarNotaCredito,
  send_to_mh,
} from "@/services/ministry_of_finance.service";
import * as FileSystem from "expo-file-system";
import { PayloadMH } from "@/types/dte/DTE.types";
import { API_URL, ambiente } from "@/utils/constants";
import { return_token_mh } from "@/plugins/secure_store";
import { return_token } from "@/plugins/async_storage";

import axios, { AxiosError } from "axios";
import { s3Client } from "@/plugins/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { formatDate } from "@/utils/date";
import { generateNotaCredito } from "@/plugins/DTE/ElectronicCreditNote";
import { get_configuration } from "@/plugins/async_storage";
import jsPDF from "jspdf";
import { makeNotaCreditoPDF } from "@/plugins/templates/template_noteCredit";
import {
  ResponseMHSuccess,
  SendMHFailed,
} from "@/types/svf_dte/responseMH/responseMH.types";
import { save_logs } from "@/services/logs.service";
import { SVFE_NC_SEND } from "@/types/svf_dte/nc.types";
import { ICheckResponse } from "@/types/dte/Check.types";
import { QR_URL } from "@/plugins/DTE/make_generator/qr_generate";
import { get_find_by_correlative } from "@/services/point_of_sale.service";
interface Props {
  setModalCreditNote: Dispatch<SetStateAction<boolean>>;
  saleId: number;
}
const CreditNote = (props: Props) => {
  const { setModalCreditNote, saleId } = props;
  const { GetSaleDetails, json_sale, is_loading_details, UpdateSaleDetails } =
    useSaleStore();
  const [currentDTE, setCurrentDTE] = useState<SVFE_NC_SEND>();
  const { OnGetTransmitter, transmitter } = useTransmitterStore();
  const [screenChange, setsCreenChange] = useState(false);
  const [message, setMessage] = useState("Esperando");
  const [loadingRevision, setLoadingRevision] = useState(false);
  const [errorQuantity, setErrorQuantity] = useState({ index: "", error: "" });
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
  const [errorPrice, setErrorPrice] = useState({ index: "", error: "" });
  const { OnImgPDF, img_invalidation, img_logo } = useSaleStore();

  useEffect(() => {
    GetSaleDetails(saleId);
    OnGetTransmitter();
  }, []);

  useEffect(() => {
    (async () => {
      await get_configuration().then((data) => {
        OnImgPDF(String(data?.logo));
      });
    })();
  }, []);

  const updatePrice = (price: number, noItem: number, index: number) => {
    if (price > json_sale?.itemsCopy[index].precioUni!) {
      setErrorPrice({
        index: index.toString(),
        error: "El precio ingresada debe de ser menor a la inicial",
      });
      return;
    } else {
      setErrorPrice({
        index: "",
        error: "",
      });

      const items = json_sale?.cuerpoDocumento;
      const copy = JSON.parse(JSON.stringify(json_sale?.itemsCopy));
      if (items) {
        const item = items.find((i) => i.numItem === noItem);
        if (item) {
          const total = item.cantidad * price;
          item.precioUni = price;
          item.ventaGravada = total;

          if (!json_sale.indexEdited.includes(noItem)) {
            json_sale.indexEdited = [...json_sale.indexEdited, noItem];
          }

          const edited = items.map((i) => (i.numItem === noItem ? item : i));

          UpdateSaleDetails({
            ...json_sale,
            cuerpoDocumento: edited,
            indexEdited: json_sale.indexEdited,
            itemsCopy: copy,
          });
        }
      }
    }
  };
  const updateQuantity = (quantity: number, noItem: number, index: number) => {
    if (quantity > json_sale?.itemsCopy[index].cantidad!) {
      setErrorQuantity({
        index: index.toString(),
        error: "La cantidad ingresada debe de ser menor a la inicial",
      });
      return;
    } else {
      setErrorQuantity({
        index: "",
        error: "",
      });

      const items = json_sale?.cuerpoDocumento;
      const copy = JSON.parse(JSON.stringify(json_sale?.itemsCopy));
      if (items) {
        const item = items.find((i) => i.numItem === noItem);
        if (item) {
          const total = quantity * item.precioUni;
          item.cantidad = quantity;
          item.ventaGravada = total;
          json_sale.indexEdited = [...json_sale.indexEdited, noItem];

          const edited = items.map((i) => (i.numItem === noItem ? item : i));

          UpdateSaleDetails({
            ...json_sale,
            cuerpoDocumento: edited,
            indexEdited: json_sale.indexEdited,
            itemsCopy: copy,
          });
        }
      }
    }
  };
  const validationBeforeSend = () => {
    const quantity = json_sale?.cuerpoDocumento.every((item, index) => {
      const itemCopy = json_sale.itemsCopy[index];

      return item.cantidad >= itemCopy.cantidad;
    });

    const price = json_sale?.cuerpoDocumento.every((item, index) => {
      const itemCopy = json_sale.itemsCopy[index];
      return item.precioUni <= itemCopy.precioUni;
    });
    return quantity && price;
  };
  const handleCreditNote = async () => {
    if (json_sale) {
      if (json_sale.cuerpoDocumento.length > 0) {
        const editedItems = json_sale.cuerpoDocumento.filter((item) =>
          json_sale.indexEdited.includes(item.numItem)
        );
        if (editedItems.length === 0) {
          ToastAndroid.show(
            "No se encontraron items editados o tines errores sin resolver",
            ToastAndroid.LONG
          );
          return;
        }
        if (!validationBeforeSend()) {
          ToastAndroid.show(
            "No se encontraron items editados o tines errores sin resolver",
            ToastAndroid.LONG
          );
          return;
        }
        const correlatives = await get_find_by_correlative(
          transmitter.id,
          "05"
        );
        if (!correlatives.data.correlativo) {
          ToastAndroid.show(
            "No se encontraron correlativos",
            ToastAndroid.SHORT
          );
          return;
        }
        setsCreenChange(true);

        const credit_note = generateNotaCredito(
          transmitter,
          json_sale.receptor,
          correlatives.data.correlativo,
          editedItems,
          json_sale.identificacion
        );
        setMessage("Estamos firmando tu DTE...");
        setCurrentDTE(credit_note);
        firmarNotaCredito(credit_note)
          .then((firmador) => {
            const data_send: PayloadMH = {
              ambiente: ambiente,
              idEnvio: 1,
              version: 3,
              tipoDte: "05",
              documento: firmador.data.body,
            };
            return_token_mh()
              .then((token_mh) => {
                if (token_mh) {
                  setMessage(
                    "Se ah enviado a hacienda, esperando respuesta..."
                  );
                  const source = axios.CancelToken.source();
                  const timeout = setTimeout(() => {
                    source.cancel("El tiempo de espera ha expirado");
                    setsCreenChange(false);
                  }, 60000);
                  Promise.race([
                    send_to_mh(data_send, token_mh, source).then(async (ressponse) => {
                      clearTimeout(timeout);
                      if (ressponse.data.selloRecibido) {
                        setMessage("El DTE ah sido validado por hacienda...");
                        clearTimeout(timeout);
                        const DTE_FORMED = {
                          ...credit_note.dteJson,
                          respuestaMH: ressponse.data,
                          firma: firmador.data.body,
                        };
                        const DTE_FORMED_VERIFY = {
                          respuestaMH: ressponse.data,
                          firma: firmador.data.body,
                        };
                        setResponseMH(DTE_FORMED_VERIFY);
                        const doc = new jsPDF();

                        const QR = QR_URL(
                          DTE_FORMED.identificacion.codigoGeneracion,
                          DTE_FORMED.identificacion.fecEmi
                        );
                        const blobQR = await axios.get<ArrayBuffer>(QR, {
                          responseType: "arraybuffer",
                        });
                        const document_gen = makeNotaCreditoPDF(
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
                            credit_note.dteJson.identificacion.numeroControl +
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
                              const json_url = `CLIENTES/${
                                transmitter.nombre
                              }/${new Date().getFullYear()}/VENTAS/NOTAS_DE_CREDITO/${formatDate()}/${
                                credit_note.dteJson.identificacion
                                  .codigoGeneracion
                              }/${
                                credit_note.dteJson.identificacion.numeroControl
                              }.json`;
                              const pdf_url = `CLIENTES/${
                                transmitter.nombre
                              }/${new Date().getFullYear()}/VENTAS/NOTAS_DE_CREDITO/${formatDate()}/${
                                credit_note.dteJson.identificacion
                                  .codigoGeneracion
                              }/${
                                credit_note.dteJson.identificacion.numeroControl
                              }.pdf`;

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
                                setsCreenChange(false);
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
                                  setsCreenChange(false);
                                  ToastAndroid.show(
                                    "Error al generar la url del documento",
                                    ToastAndroid.LONG
                                  );
                                  return null;
                                });
                              if (!blobJSON) {
                                setsCreenChange(false);
                                return;
                              }

                              const jsonUploadParams = {
                                Bucket: "facturacion-seedcode",
                                Key: json_url,
                                Body: blobJSON!,
                              };
                              setMessage("Estamos guardando tus documentos");
                              s3Client
                                .send(new PutObjectCommand(pdfUploadParams))
                                .then((response) => {
                                  if (response.$metadata) {
                                    s3Client
                                      .send(
                                        new PutObjectCommand(jsonUploadParams)
                                      )
                                      .then((response) => {
                                        if (response.$metadata) {
                                          const payload = {
                                            dte: json_url,
                                            sello: true,
                                            pdf: pdf_url,
                                            saleId: saleId,
                                          };
                                          return_token()
                                            .then((token) => {
                                              axios
                                                .post(
                                                  `${API_URL}/nota-de-credito`,
                                                  payload,
                                                  {
                                                    headers: {
                                                      Authorization: `Bearer ${token}`,
                                                    },
                                                  }
                                                )
                                                .then(() => {
                                                  Alert.alert(
                                                    "Éxito",
                                                    "Se completaron todos los procesos"
                                                  );
                                                  setModalCreditNote(false);
                                                  setsCreenChange(false);
                                                })
                                                .catch(() => {
                                                  ToastAndroid.show(
                                                    "Error al guarda la venta",
                                                    ToastAndroid.LONG
                                                  );
                                                  setMessage(
                                                    "Se produjo un error al guardar la venta en nuestra base de datos"
                                                  );
                                                  setsCreenChange(false);
                                                });
                                            })
                                            .catch(() => {
                                              ToastAndroid.show(
                                                "No tienes el acceso necesario",
                                                ToastAndroid.LONG
                                              );
                                            });
                                        } else {
                                          setsCreenChange(false);
                                          ToastAndroid.show(
                                            "Error inesperado, contacte al equipo de soporte",
                                            ToastAndroid.LONG
                                          );
                                        }
                                      })
                                      .catch(() => {
                                        setsCreenChange(false);
                                        ToastAndroid.show(
                                          "Ocurrió un error en el Json",
                                          ToastAndroid.LONG
                                        );
                                      });
                                  } else {
                                    setsCreenChange(false);
                                    ToastAndroid.show(
                                      "Hubo un error al generar la información",
                                      ToastAndroid.LONG
                                    );
                                  }
                                })
                                .catch(() => {
                                  setsCreenChange(false);
                                  ToastAndroid.show(
                                    "Ocurrió un error al subir el PDF",
                                    ToastAndroid.LONG
                                  );
                                });
                            })
                            .catch(() => {
                              setsCreenChange(false);
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
                          setsCreenChange(false);
                        }
                      } else {
                        setsCreenChange(false);
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
                    clearTimeout(timeout);
                    if (error.response?.status === 401) {
                      ToastAndroid.show(
                        "No tienes los accesos necesarios",
                        ToastAndroid.LONG
                      );
                      setsCreenChange(false);
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
                              onPress: () => handleCreditNote(),
                            },
                            {
                              text: "Revisar",
                              onPress: () => handleVerify(),
                            },
                            {
                              text: "Enviar a contingencia",
                              onPress: () => handleContingence(),
                            },
                          ]
                        );
                        setsCreenChange(false);
                        return;
                      } else {
                        ToastAndroid.show(
                          "Ah ocurrido un error, consulte al equipo de soporte técnico",
                          ToastAndroid.LONG
                        );
                        setsCreenChange(false);
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
                          credit_note.dteJson.identificacion.codigoGeneracion,
                      });
                    }
                  });
                } else {
                  ToastAndroid.show(
                    "No se ha podido obtener el token de hacienda",
                    ToastAndroid.LONG
                  );
                  setsCreenChange(false);
                }
              })
              .catch(() => {
                ToastAndroid.show(
                  "Ocurrió un error al obtener el token",
                  ToastAndroid.LONG
                );
                setsCreenChange(false);
              });
          })
          .catch(() => {
            Alert.alert(
              "Error al firmar el documento",
              "Intenta firmar el documento mas tarde o contacta al equipo de soporte"
            );
            setsCreenChange(false);
          });
      } else {
        ToastAndroid.show(
          "El DTE no tiene un cuerpo al que se pueda modificar",
          ToastAndroid.LONG
        );
        setsCreenChange(false);
      }
    } else {
      ToastAndroid.show("No se encontró el DTE", ToastAndroid.LONG);
      setsCreenChange(false);
    }
  };
  const handleContingence = async () => {
    setsCreenChange(true);
    setMessage(
      "Estamos realizando el evento\n de contingencia, Espera un momento..."
    );
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
          const json_url = `CLIENTES/${
            transmitter.nombre
          }/${new Date().getFullYear()}/VENTAS/NOTAS_DE_CREDITO/${formatDate()}/${
            currentDTE.dteJson.identificacion.codigoGeneracion
          }/${currentDTE.dteJson.identificacion.numeroControl}.json`;

          const blobJSON = await fetch(JSON_uri)
            .then((res) => res.blob())
            .catch(() => {
              ToastAndroid.show(
                "Error al generar la url del documento",
                ToastAndroid.LONG
              );
              return null;
            });

          if (!blobJSON) {
            setsCreenChange(false);
            return;
          }
          const jsonUploadParams = {
            Bucket: "seedcode-facturacion",
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
                    sello: false,
                    saleId: saleId,
                  };
                  return_token()
                    .then((token) => {
                      axios
                        .post(`${API_URL}/nota-de-credito`, payload, {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        })
                        .then(() => {
                          Alert.alert(
                            "Éxito",
                            "Se completaron todos los procesos"
                          );
                          setModalCreditNote(false);
                          setsCreenChange(false);
                        })
                        .catch(() => {
                          ToastAndroid.show(
                            "Error al guarda la venta",
                            ToastAndroid.LONG
                          );
                          setMessage(
                            "Se produjo un error al guardar la venta en nuestra base de datos"
                          );
                          setsCreenChange(false);
                        });
                    })
                    .catch(() => {
                      setsCreenChange(false);
                      ToastAndroid.show(
                        "No tienes el acceso necesario",
                        ToastAndroid.LONG
                      );
                    });
                } else {
                  setsCreenChange(false);
                  ToastAndroid.show(
                    "Error inesperado, contacte al equipo de soporte",
                    ToastAndroid.LONG
                  );
                }
              })
              .catch(() => {
                setsCreenChange(false);
                ToastAndroid.show(
                  "Ocurrió un error al subir el archivo",
                  ToastAndroid.LONG
                );
              });
          } else {
            setsCreenChange(false);
            ToastAndroid.show(
              "Ocurrió un error al crear el Json",
              ToastAndroid.LONG
            );
          }
        })
        .catch(() => {
          setsCreenChange(false);
          ToastAndroid.show("Ocurrió un error en el Json", ToastAndroid.LONG);
        });
    } else {
      ToastAndroid.show(
        "Hubo un error al generar la información",
        ToastAndroid.LONG
      );
      setsCreenChange(false);
    }
  };
  const handleVerify = () => {
    setLoadingRevision(true);
    if (currentDTE?.dteJson.identificacion && transmitter) {
      const payload = {
        nitEmisor: transmitter.nit,
        tdte: currentDTE.dteJson.identificacion.tipoDte ?? "05",
        codigoGeneracion:
          currentDTE.dteJson.identificacion.codigoGeneracion ?? "",
      };
      return_token_mh()
        .then((token_mh) => {
          check_dte(payload, String(token_mh))
            .then(async (response) => {
              if (response.data.selloRecibido) {
                setLoadingRevision(false);
                setsCreenChange(true);
                const DTE_FORMED = {
                  ...currentDTE.dteJson,
                  ...responseMH,
                };
                setMessage(
                  "El DTE se encontró en hacienda,\n se están generando los documentos..."
                );
                const doc = new jsPDF();
                const QR = QR_URL(
                  DTE_FORMED.identificacion.codigoGeneracion,
                  DTE_FORMED.identificacion.fecEmi
                );
                const blobQR = await axios.get<ArrayBuffer>(QR, {
                  responseType: "arraybuffer",
                });
                const document_gen = makeNotaCreditoPDF(
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
                  )
                    .then(async () => {
                      const json_url = `CLIENTES/${
                        transmitter.nombre
                      }/${new Date().getFullYear()}/VENTAS/NOTAS_DE_CREDITO/${formatDate()}/${
                        currentDTE.dteJson.identificacion.codigoGeneracion
                      }/${
                        currentDTE.dteJson.identificacion.numeroControl
                      }.json`;
                      const pdf_url = `CLIENTES/${
                        transmitter.nombre
                      }/${new Date().getFullYear()}/VENTAS/NOTAS_DE_CREDITO/${formatDate()}/${
                        currentDTE.dteJson.identificacion.codigoGeneracion
                      }/${currentDTE.dteJson.identificacion.numeroControl}.pdf`;

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
                        setsCreenChange(false);
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
                          setsCreenChange(false);
                          ToastAndroid.show(
                            "Error al generar la url del documento",
                            ToastAndroid.LONG
                          );
                          return null;
                        });
                      if (!blobJSON) {
                        setsCreenChange(false);
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
                                      dte: json_url,
                                      sello: true,
                                      pdf: pdf_url,
                                      saleId: saleId,
                                    };
                                    return_token()
                                      .then((token) => {
                                        axios
                                          .post(
                                            `${API_URL}/nota-de-credito`,
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
                                            setModalCreditNote(false);
                                            setsCreenChange(false);
                                          })
                                          .catch(() => {
                                            ToastAndroid.show(
                                              "Error al guarda la venta",
                                              ToastAndroid.LONG
                                            );
                                            setMessage(
                                              "Se produjo un error al guardar la venta en nuestra base de datos"
                                            );
                                            setsCreenChange(false);
                                          });
                                      })
                                      .catch(() => {
                                        setsCreenChange(false);
                                        ToastAndroid.show(
                                          "No tienes el acceso necesario",
                                          ToastAndroid.LONG
                                        );
                                      });
                                  } else {
                                    setsCreenChange(false);
                                    ToastAndroid.show(
                                      "Error inesperado, contacte al equipo de soporte1",
                                      ToastAndroid.LONG
                                    );
                                  }
                                })
                                .catch(() => {
                                  setsCreenChange(false);
                                  ToastAndroid.show(
                                    "Ocurrió un error al subir el PDF",
                                    ToastAndroid.LONG
                                  );
                                });
                            } else {
                              setsCreenChange(false);
                              ToastAndroid.show(
                                "Error inesperado, contacte al equipo de soporte",
                                ToastAndroid.LONG
                              );
                            }
                          })
                          .catch(() => {
                            setsCreenChange(false);
                            ToastAndroid.show(
                              "Ocurrió un error al subir el Json",
                              ToastAndroid.LONG
                            );
                          });
                      } else {
                        setsCreenChange(false);
                        ToastAndroid.show(
                          "No tienes los documentos",
                          ToastAndroid.LONG
                        );
                      }
                    })
                    .catch(() => {
                      setsCreenChange(false);
                      ToastAndroid.show(
                        "Ocurrió un error en el Json",
                        ToastAndroid.LONG
                      );
                    });
                } else {
                  setsCreenChange(false);
                  ToastAndroid.show(
                    "Hubo un error al generar la información",
                    ToastAndroid.LONG
                  );
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
    <View></View>
  )
};

export default CreditNote;

const styles = StyleSheet.create({
  card: {
    height: "auto",
    marginBottom: 25,
    padding: 5,
    width: "95%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  icon: {
    position: "absolute",
    left: 7,
    top: "30%",
    transform: [{ translateY: -15 }],
  },
  textTitle: {
    fontSize: 20,
    marginTop: 10,
    marginLeft: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  textSubTitle: {
    fontSize: 20,
    marginTop: 10,
    marginLeft: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 5,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    width: "50%",
    height: 40,
    paddingLeft: 10,
  },
});
