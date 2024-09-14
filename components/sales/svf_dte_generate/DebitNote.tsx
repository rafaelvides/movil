import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSaleStore } from "@/store/sale.store";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTransmitterStore } from "@/store/transmitter.store";
import { SVFE_ND_SEND } from "@/types/svf_dte/nd.types";
import { generateNotaDebito } from "@/plugins/DTE/ElectronicDebitMemo";
import {
  check_dte,
  firmarDocumentoNotaDebito,
  send_to_mh,
} from "@/services/ministry_of_finance.service";
import { PayloadMH } from "@/types/dte/DTE.types";
import { API_URL, SPACES_BUCKET, ambiente } from "@/utils/constants";
import { return_token_mh } from "@/plugins/secure_store";
import { return_token } from "@/plugins/async_storage";
import axios, { AxiosError } from "axios";
import { s3Client } from "@/plugins/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { formatDate } from "@/utils/date";
import { get_configuration, get_user } from "@/plugins/async_storage";
import jsPDF from "jspdf";
import { makeNotaDebitoPDF } from "@/plugins/templates/template_MemoDebit";
import * as FileSystem from "expo-file-system";
import {
  ErrorFirma,
  ResponseMHSuccess,
  SendMHFailed,
} from "@/types/svf_dte/responseMH/responseMH.types";
import { save_logs } from "@/services/logs.service";
import { ICheckResponse } from "@/types/dte/Check.types";
import { QR_URL } from "@/plugins/DTE/make_generator/qr_generate";
import { usePointOfSaleStore } from "@/store/point_of_sale.store";
import { generateNoteURL } from "@/utils/utils";
import * as Sharing from "expo-sharing";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import Card from "@/components/Global/components_app/Card";
import { formatCurrency } from "@/utils/dte";
import { ThemeContext } from "@/hooks/useTheme";
import Button from "@/components/Global/components_app/Button";
import LoadingSales from "@/components/Global/components_app/LoadingSales";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";

const DebitNote = ({
  saleId,
  setModalDebitNote,
}: {
  saleId: number;
  setModalDebitNote: Dispatch<SetStateAction<boolean>>;
}) => {
  const { GetSaleDetails, json_sale, is_loading_details, UpdateSaleDetails } =
    useSaleStore();
  const [currentDTE, setCurrentDTE] = useState<SVFE_ND_SEND>();
  const { OnGetTransmitter, transmitter } = useTransmitterStore();
  const [screenChange, setsCreenChange] = useState(false);
  const [message, setMessage] = useState("Esperando");
  const [loadingRevision, setLoadingRevision] = useState(false);
  const [title, setTitle] = useState<string>("");
  const [step, setStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorQuantity, setErrorQuantity] = useState({ index: "", error: "" });
  const { theme } = useContext(ThemeContext);
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
  const { OnGetCorrelativesByDte } = usePointOfSaleStore();
  const { OnImgPDF, img_invalidation, img_logo } = useSaleStore();

  useEffect(() => {
    GetSaleDetails(saleId);
    OnGetTransmitter();
  }, [saleId]);

  useEffect(() => {
    (async () => {
      await get_configuration().then((data) => {
        OnImgPDF(String(data?.logo));
      });
    })();
  }, []);

  const updatePrice = (price: number, noItem: number, index: number) => {
    if (price < json_sale?.itemsCopy[index].precioUni!) {
      setErrorPrice({
        index: index.toString(),
        error: "El precio ingresada debe de ser mayor al inicial",
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
          const total = (item.precioUni - item.montoDescu) * item.cantidad;
          item.precioUni = price - item.montoDescu;
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
    if (quantity < json_sale?.itemsCopy[index].cantidad!) {
      setErrorQuantity({
        index: index.toString(),
        error: "La cantidad ingresada debe de ser mayor a la inicial",
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
          const total = (item.precioUni - item.montoDescu) * quantity;
          item.montoDescu = item.montoDescu * item.cantidad;
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
  const updateDiscunt = (discunt: number, noItem: number, index: number) => {
    if (discunt > json_sale?.itemsCopy[index].montoDescu!) {
      setErrorQuantity({
        index: index.toString(),
        error: "La cantidad ingresada debe de ser mayor a la inicial",
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
          const total = item.precioUni * item.cantidad - discunt;
          item.montoDescu = discunt;
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
      return item.precioUni >= itemCopy.precioUni;
    });

    return quantity && price;
  };
  const handleDebitNote = async () => {
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
        const user = await get_user();
        if (!user) {
          ToastAndroid.show("No se encontró el usuario", ToastAndroid.SHORT);
          return;
        }
        const correlatives = await OnGetCorrelativesByDte(user.id, "ND");
        if (!correlatives) {
          ToastAndroid.show(
            "No se encontraron correlativos",
            ToastAndroid.SHORT
          );
          return;
        }
        const debit_note = generateNotaDebito(
          transmitter,
          json_sale.receptor,
          correlatives,
          editedItems,
          json_sale.identificacion
        );
        setsCreenChange(true);
        setCurrentDTE(debit_note);
        firmarDocumentoNotaDebito(debit_note)
          .then(async (firma) => {
            if (firma.data.status === "ERROR") {
              const new_data = firma.data as unknown as ErrorFirma;
              setTitle("Error en el firmador " + new_data.body.codigo);
              setErrorMessage(new_data.body.mensaje);
              setsCreenChange(false);
              await save_logs({
                title: new_data.body.codigo ?? "Error al procesar venta",
                message: new_data.body.mensaje
                  ? new_data.body.mensaje
                  : "Error al firmar el documento",
                generationCode:
                  debit_note.dteJson.identificacion.codigoGeneracion,
              });
              return;
            }
            if (firma.data.body) {
              const data_send: PayloadMH = {
                ambiente: ambiente,
                idEnvio: 1,
                version: 3,
                tipoDte: "06",
                documento: firma.data.body,
              };
              handleSendToMh(data_send, debit_note, firma.data.body);
            } else {
              setTitle("Error en el firmador");
              setErrorMessage("Error al firmar el documento");
              setsCreenChange(false);
              return;
            }
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
  const handleSendToMh = async (
    data: PayloadMH,
    json: SVFE_ND_SEND,
    firma: string
  ) => {
    const source = axios.CancelToken.source();
    const timeout = setTimeout(() => {
      source.cancel("El tiempo de espera ha expirado");
    }, 25000);
    const token_mh = await return_token_mh();
    if (!token_mh) {
      setsCreenChange(false);
      ToastAndroid.show(
        "Fallo al obtener las credenciales del Ministerio de Hacienda",
        ToastAndroid.LONG
      );
      return;
    }
    setStep(1);
    Promise.race([
      send_to_mh(data, token_mh!, source).then(({ data }) => {
        clearTimeout(timeout);
        handleUploadFile(json, firma, data);
      }),
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("El tiempo de espera ha expirado"));
          setsCreenChange(false);
        }, 25000);
      }),
    ]).catch(async (error: AxiosError<SendMHFailed>) => {
      clearTimeout(timeout);
      if (axios.isCancel(error)) {
        setTitle("Tiempo de espera agotado");
        setErrorMessage("El tiempo limite de espera ha expirado");
        setsCreenChange(false);
      }

      if (error.response?.data) {
        setErrorMessage(
          error.response.data.observaciones &&
            error.response.data.observaciones.length > 0
            ? error.response?.data.observaciones.join("\n\n")
            : "No se pudo obtener una respuesta de hacienda, inténtelo de nuevo mas tarde..."
        );
        setTitle(
          error.response.data.descripcionMsg ?? "Error al procesar venta"
        );
        setsCreenChange(false);
        await save_logs({
          title:
            error.response.data.descripcionMsg ?? "Error al procesar venta",
          message:
            error.response.data.observaciones &&
            error.response.data.observaciones.length > 0
              ? error.response?.data.observaciones.join("\n\n")
              : "No se obtuvo respuesta del Ministerio de Hacienda",
          generationCode: json.dteJson.identificacion.codigoGeneracion,
        });
      } else {
        setTitle("No se obtuvo respuesta de hacienda");
        setErrorMessage(
          "Al enviar la venta, no se obtuvo respuesta de hacienda"
        );
        setsCreenChange(false);
      }
    });
  };
  const handleUploadFile = async (
    json: SVFE_ND_SEND,
    firma: string,
    respuestaMH: ResponseMHSuccess
  ) => {
    setStep(2);
    const DTE_FORMED = {
      ...json.dteJson,
      respuestaMH: respuestaMH,
      firma: firma,
    };

    const JSON_uri =
      FileSystem.documentDirectory +
      json.dteJson.identificacion.numeroControl +
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
      const json_url = generateNoteURL(
        json.dteJson.emisor.nombre,
        json.dteJson.identificacion.codigoGeneracion,
        "json",
        "06",
        json.dteJson.identificacion.fecEmi
      );

      const blobJSON = await fetch(JSON_uri)
        .then((res) => res.blob())
        .catch(() => {
          ToastAndroid.show(
            "Error al generar la url del documento",
            ToastAndroid.LONG
          );
          setsCreenChange(false);
          return null;
        });
      if (!blobJSON) {
        setsCreenChange(false);
        return;
      }
      const jsonUploadParams = {
        Bucket: SPACES_BUCKET,
        Key: json_url,
        Body: blobJSON!,
      };
      if (jsonUploadParams) {
        s3Client
          .send(new PutObjectCommand(jsonUploadParams))
          .then(() => {
            setStep(3);
            handleSave(
              json_url,
              "N/A",
              JSON_uri,
              JSON.stringify(DTE_FORMED, null, 2)
            );
            // setSavedUrls({
            //   json: json_url,
            //   pdf: "",
            // });
          })
          .catch(() => {
            ToastAndroid.show(
              "Error al subir el archivo JSON",
              ToastAndroid.LONG
            );
            setsCreenChange(false);
            Alert.alert(
              "Fallo la subida a nuestros servidores",
              "Puedes descargar el JSON e intentar subir la venta manualmente",
              [
                {
                  text: "Cancelar",
                  onPress: () => {},
                  style: "cancel",
                },
                {
                  text: "Descargar JSON",
                  onPress: () =>
                    handleDownload(
                      JSON.stringify(DTE_FORMED, null, 2),
                      JSON_uri
                    ),
                },
              ]
            );
          });
      } else {
        ToastAndroid.show("Error al generar el archivo", ToastAndroid.LONG);
        setsCreenChange(false);
        Alert.alert(
          "Fallo la subida a nuestros servidores",
          "Puedes descargar el JSON e intentar subir la venta manualmente",
          [
            {
              text: "Cancelar",
              onPress: () => {},
              style: "cancel",
            },
            {
              text: "Descargar JSON",
              onPress: () =>
                handleDownload(JSON.stringify(DTE_FORMED, null, 2), JSON_uri),
            },
          ]
        );
      }
    });
  };
  const handleSave = (
    json_url: string,
    pdf_url: string,
    JSON_uri: string,
    json: string
  ) => {
    const payload = {
      pdf: pdf_url,
      dte: json_url,
      sello: true,
    };
    setStep(4);
    return_token()
      .then((token) => {
        axios
          .post(API_URL + "/nota-de-debitos`", payload, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then(() => {
            Toast.show({
              type: ALERT_TYPE.SUCCESS,
              title: "Éxito",
              textBody: "Se completaron todos los procesos",
            });
            setModalDebitNote(false);
            setsCreenChange(false);
          })
          .catch((error) => {
            ToastAndroid.show("Error al guarda la venta", ToastAndroid.LONG);
            setsCreenChange(false);
            Alert.alert(
              "Fallo al guardarlo en nuestra base de datos",
              "¿Quieres volver a intentarlo?",
              [
                {
                  text: "Cancelar",
                  onPress: () => {},
                  style: "cancel",
                },
                {
                  text: "Descargar JSON",
                  onPress: () => handleDownload(json, JSON_uri),
                },
                {
                  text: "Si, Re-intentar",
                  onPress: () => handleSave(json_url, pdf_url, JSON_uri, json),
                },
              ]
            );
          });
      })
      .catch(() => {
        setsCreenChange(false);
        ToastAndroid.show("No tienes el acceso necesario", ToastAndroid.LONG);
      });
  };
  const handleDownload = async (json: string, JSON_uri: string) => {
    try {
      await FileSystem.writeAsStringAsync(JSON_uri, json);
      await Sharing.shareAsync(JSON_uri);
    } catch (error) {
      ToastAndroid.show(`Error: ${error}`, ToastAndroid.LONG);
    }
  };
  const handleContingence = () => {
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
          }/${new Date().getFullYear()}/VENTAS/NOTAS_DE_DEBITO/${formatDate()}/${
            currentDTE.dteJson.identificacion.codigoGeneracion
          }/${currentDTE.dteJson.identificacion.codigoGeneracion}.json`;
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
                  };
                  return_token()
                    .then((token) => {
                      axios
                        .post(`${API_URL}/nota-de-debitos`, payload, {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        })
                        .then(() => {
                          Alert.alert(
                            "Éxito",
                            "Se completaron todos los procesos"
                          );
                          setModalDebitNote(false);
                          setsCreenChange(false);
                        })
                        .catch((error: AxiosError) => {
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
      setsCreenChange(false);
      ToastAndroid.show(
        "Hubo un error al generar la información",
        ToastAndroid.LONG
      );
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
                const document_gen = makeNotaDebitoPDF(
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
                      }/${new Date().getFullYear()}/VENTAS/NOTAS_DE_DEBITO/${formatDate()}/${
                        currentDTE.dteJson.identificacion.codigoGeneracion
                      }/${
                        currentDTE.dteJson.identificacion.numeroControl
                      }.json`;
                      const pdf_url = `CLIENTES/${
                        transmitter.nombre
                      }/${new Date().getFullYear()}/VENTAS/NOTAS_DE_DEBITO/${formatDate()}/${
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
                        Bucket: SPACES_BUCKET,
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
                                      sello: false,
                                    };
                                    return_token()
                                      .then((token) => {
                                        axios
                                          .post(
                                            `${API_URL}/nota-de-debitos`,
                                            payload,
                                            {
                                              headers: {
                                                Authorization: `Bearer ${token}`,
                                              },
                                            }
                                          )
                                          .then(() => {
                                            setMessage("");
                                            Toast.show({
                                              type: ALERT_TYPE.SUCCESS,
                                              title: "Éxito",
                                              textBody:
                                                "Se completaron todos los procesos",
                                            });
                                            setModalDebitNote(false);
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
    <>
      <SafeAreaView style={stylesGlobals.safeAreaViewStyle}>
        {screenChange ? (
          <LoadingSales step={step} />
        ) : (
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 12,
                width: "100%",
              }}
            >
              <Text
                style={{
                  marginLeft: 10,
                  fontWeight: "600",
                  color: "#4B5563",
                }}
              >
                Cod. generacion:
                {` ${json_sale?.identificacion.codigoGeneracion.slice(
                  0,
                  26
                )}...`}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 12,
                width: "100%",
              }}
            >
              <Text
                style={{
                  marginLeft: 10,
                  fontWeight: "600",
                  color: "#4B5563",
                }}
              >
                N. Control:
                {` ${json_sale?.identificacion.numeroControl.slice(0, 30)}...`}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 12,
                width: "100%",
              }}
            >
              <Text
                style={{
                  marginLeft: 10,
                  fontWeight: "600",
                  color: "#4B5563",
                }}
              >
                Cliente:
                {` ${json_sale?.receptor.nombre.slice(0, 30)}...`}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 12,
                width: "100%",
              }}
            >
              <Text
                style={{
                  marginLeft: 10,
                  fontWeight: "600",
                  color: "#4B5563",
                }}
              >
                Fecha/hora:
                {` ${json_sale?.identificacion.fecEmi} - ${json_sale?.identificacion.horEmi}`}
              </Text>
            </View>
            <ScrollView
              style={{
                marginTop: 15,
              }}
            >
              <View style={{ ...stylesGlobals.viewScroll, marginBottom: 90 }}>
                {json_sale !== undefined && (
                  <>
                    {!is_loading_details &&
                      json_sale.cuerpoDocumento.map((dt, index) => (
                        <Card key={index} style={stylesGlobals.styleCard}>
                          <View
                            style={{
                              justifyContent: "center",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <Text>Index: #{index}</Text>
                          </View>
                          <View style={stylesGlobals.ViewCard}>
                            <MaterialCommunityIcons
                              color={theme.colors.secondary}
                              name="inbox-full-outline"
                              size={22}
                              style={{
                                position: "absolute",
                                left: 20,
                              }}
                            />
                            <Text
                              style={{
                                ...stylesGlobals.textCard,
                                width: "80%",
                              }}
                            >
                              {`Nombre:  ${dt.descripcion}`}
                            </Text>
                          </View>
                          <View style={stylesGlobals.ViewCard}>
                            <MaterialCommunityIcons
                              color={theme.colors.secondary}
                              name="barcode-scan"
                              size={22}
                              style={{
                                position: "absolute",
                                left: 20,
                              }}
                            />
                            <Text style={stylesGlobals.textCard}>
                              {`Codigo:  ${dt.codigo}`}
                            </Text>
                          </View>
                          <View style={stylesGlobals.ViewCard}>
                            <MaterialCommunityIcons
                              color={theme.colors.secondary}
                              name="tag-multiple-outline"
                              size={22}
                              style={{
                                position: "absolute",
                                left: 20,
                              }}
                            />
                            <Text style={stylesGlobals.textCard}>
                              {`Descuento:  ${dt.montoDescu}`}
                            </Text>
                          </View>
                          <View style={stylesGlobals.ViewCard}>
                            <MaterialCommunityIcons
                              color={theme.colors.secondary}
                              name="currency-usd"
                              size={22}
                              style={{
                                position: "absolute",
                                left: 20,
                              }}
                            />
                            <Text style={stylesGlobals.textCard}>
                              {`Precio:  ${formatCurrency(dt.precioUni)}`}
                            </Text>
                          </View>
                        </Card>
                      ))}
                  </>
                )}
              </View>
            </ScrollView>
            <View
              style={{
                position: "absolute",
                backgroundColor: "#fff",
                bottom: 0,
                height: "12%",
                borderTopWidth: 1,
                borderColor: "#ddd",
              }}
            >
              <View style={stylesGlobals.viewBotton}>
                <Button
                  withB={390}
                  onPress={handleDebitNote}
                  Title="Procesar la nota"
                  color={theme.colors.dark}
                />
              </View>
            </View>
          </>
        )}
      </SafeAreaView>
    </>
  );
};

export default DebitNote;

const styles = StyleSheet.create({});
