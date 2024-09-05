import { Pressable, Text, ToastAndroid, Alert, View } from "react-native";
import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { ICustomer } from "@/types/customer/customer.types";
import { ITransmitter } from "@/types/transmitter/transmiter.types";
import { IFormasDePagoResponse } from "@/types/billing/cat-017-forma-de-pago.types";
import { ICat002TipoDeDocumento } from "@/types/billing/cat-002-tipo-de-documento.types";
import { ICartProduct } from "@/types/branch_product/branch_product.types";
import { generate_factura } from "@/plugins/DTE/ElectronicInvoiceGenerator";
import { SVFE_FC_SEND } from "@/types/svf_dte/fc.types";
import {
  check_dte,
  firmarDocumentoFactura,
  send_to_mh,
} from "@/services/ministry_of_finance.service";
import { PayloadMH } from "@/types/dte/DTE.types";
import { API_URL, SPACES_BUCKET, ambiente } from "@/utils/constants";
import axios, { AxiosError } from "axios";
import {
  ErrorFirma,
  ResponseMHSuccess,
  SendMHFailed,
} from "@/types/svf_dte/responseMH/responseMH.types";
import {
  Dte_error,
  get_box_data,
  get_configuration,
  get_employee_id,
  get_user,
} from "../../../plugins/async_storage";
import { save_logs } from "@/services/logs.service";
import { formatDate } from "@/utils/date";
import * as FileSystem from "expo-file-system";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/plugins/s3";
import { return_token, return_token_mh } from "@/plugins/secure_store";
import jsPDF from "jspdf";
import { generateFacturaComercial } from "@/plugins/templates/template_fe";
import { ICheckResponse } from "@/types/dte/Check.types";
import { useSaleStore } from "@/store/sale.store";
import { QR_URL } from "@/plugins/DTE/make_generator/qr_generate";
import { usePointOfSaleStore } from "@/store/point_of_sale.store";
import { generateURL } from "@/utils/utils";
import { IBox } from "@/types/box/box.types";
import * as Sharing from "expo-sharing";
import { Blob } from "buffer";
import { useBranchProductStore } from "@/store/branch_product.store";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import Button from "@/components/Global/components_app/Button";
import { ThemeContext } from "@/hooks/useTheme";

const ElectronicInvoice = ({
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
  totalUnformatted,
  focusButton,
  onePercentRetention,
}: {
  customer: ICustomer | undefined;
  transmitter: ITransmitter;
  typeDocument: ICat002TipoDeDocumento;
  cart_products: ICartProduct[];
  pays: IFormasDePagoResponse[];
  conditionPayment: number;
  totalUnformatted: number;
  focusButton: boolean;
  onePercentRetention: number;
  setLoadingSave: Dispatch<SetStateAction<boolean>>;
  setMessage: Dispatch<SetStateAction<string>>;
  setShowModalSale: Dispatch<SetStateAction<boolean>>;
  setLoadingRevision: Dispatch<SetStateAction<boolean>>;
  clearAllData: () => void;
}) => {
  const { emptyCart } = useBranchProductStore();
  const { OnGetCorrelativesByDte } = usePointOfSaleStore();
  // const { OnImgPDF, img_invalidation, img_logo } = useSaleStore();
  const [title, setTitle] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");
  const [savedUrls, setSavedUrls] = useState({ json: Blob, urlJSon: "" });
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
  const { theme } = useContext(ThemeContext);

  // useEffect(() => {
  //   (async () => {
  //     await get_configuration().then((data) => {
  //       OnImgPDF(String(data?.logo));
  //     });
  //   })();
  // }, []);

  const generateFactura = async () => {
    if (!conditionPayment) {
      ToastAndroid.show("Debes seleccionar una condición", ToastAndroid.SHORT);
      return;
    }
    if (cart_products.some((item) => item.monto_descuento < 0)) {
      ToastAndroid.show(
        "No se puede facturar un descuento negativo",
        ToastAndroid.LONG
      );
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

    const total_filteres = Number(
      tipo_pago
        .map((a) => a.monto)
        .reduce((a, b) => a + b, 0)
        .toFixed(2)
    );

    if (total_filteres !== Number(totalUnformatted.toFixed(2))) {
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
    const user = await get_user();
    if (!user) {
      ToastAndroid.show("No se encontró el usuario", ToastAndroid.SHORT);
      return;
    }
    const correlatives = await OnGetCorrelativesByDte(user.id, "F");

    if (!correlatives) {
      ToastAndroid.show("No se encontraron correlativos", ToastAndroid.SHORT);
      return;
    }
    const box = await get_box_data();

    if (box?.id === 0 || !box) {
      ToastAndroid.show("No se encontró la caja", ToastAndroid.SHORT);
      return;
    }

    const codeEmployee = await get_employee_id();

    if (!codeEmployee) {
      ToastAndroid.show("No se encontró el empleado", ToastAndroid.SHORT);
      return;
    }

    if (cart_products.some((product) => Number(product.price) <= 0)) {
      ToastAndroid.show(
        "No se puede facturar un precio negativo o cero",
        ToastAndroid.LONG
      );
      return;
    }
    try {
      const generate = generate_factura(
        transmitter,
        correlatives,
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
        onePercentRetention
      );
      setLoadingSave(true);
      setMessage("Estamos firmando tu documento...");

      firmarDocumentoFactura(generate)
        .then(async (firma) => {
          if (firma.data.status === "ERROR") {
            const new_data = firma.data as unknown as ErrorFirma;

            setTitle("Error en el firmador " + new_data.body.codigo);
            setErrorMessage(new_data.body.mensaje);
            setLoadingSave(false);
            return;
          }
          if (firma.data.body) {
            const data_send: PayloadMH = {
              ambiente: ambiente,
              idEnvio: 1,
              version: 1,
              tipoDte: "01",
              documento: firma.data.body,
            };
            handleSendToMh(
              data_send,
              generate,
              firma.data.body,
              box,
              codeEmployee
            );
            setMessage("Se ah enviado a hacienda, esperando respuesta...");
          } else {
            setTitle("Error en el firmador");
            setErrorMessage("Error al firmar el documento");
            setLoadingSave(false);
            return;
          }
        })
        .catch(() => {
          Alert.alert(
            "Error al firmar el documento",
            "Intenta firmar el documento mas tarde o contacta al equipo de soporte"
          );
          setLoadingSave(false);
        });
    } catch (error) {
      ToastAndroid.show(`Error: ${error}`, ToastAndroid.LONG);
    }
  };

  const handleSendToMh = async (
    data: PayloadMH,
    json: SVFE_FC_SEND,
    firma: string,
    box: IBox,
    codeEmployee: string
  ) => {
    const source = axios.CancelToken.source();
    const timeout = setTimeout(() => {
      source.cancel("El tiempo de espera ha expirado");
    }, 25000);
    console.log("first");
    const token_mh = await return_token_mh();
    console.log("12", token_mh);
    if (!token_mh) {
      setLoadingSave(false);
      ToastAndroid.show(
        "Fallo al obtener las credenciales del Ministerio de Hacienda",
        ToastAndroid.LONG
      );
      return;
    }
    send_to_mh(data, token_mh!, source)
      .then(({ data }) => {
        setMessage("Estamos subiendo los archivos...");
        handleUploadFile(json, firma, data, box, codeEmployee);
      })
      .catch((error: AxiosError<SendMHFailed>) => {
        clearTimeout(timeout);
        if (axios.isCancel(error)) {
          setTitle("Tiempo de espera agotado");
          setErrorMessage("El tiempo limite de espera ha expirado");
          setLoadingSave(false);
        }

        if (error.response?.data) {
          setErrorMessage(
            error.response.data.observaciones &&
              error.response.data.observaciones.length > 0
              ? error.response?.data.observaciones.join("\n\n")
              : ""
          );
          setTitle(
            error.response.data.descripcionMsg ?? "Error al procesar venta"
          );
          setLoadingSave(false);
        } else {
          setTitle("No se obtuvo respuesta de hacienda");
          setErrorMessage(
            "Al enviar la venta, no se obtuvo respuesta de hacienda"
          );
          setLoadingSave(false);
        }
      });
  };
  const handleUploadFile = async (
    json: SVFE_FC_SEND,
    firma: string,
    respuestaMH: ResponseMHSuccess,
    box: IBox,
    codeEmployee: string
  ) => {
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
      const json_url = generateURL(
        json.dteJson.emisor.nombre,
        json.dteJson.identificacion.codigoGeneracion,
        "json",
        "01",
        json.dteJson.identificacion.fecEmi
      );
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
        Bucket: SPACES_BUCKET,
        Key: json_url,
        Body: blobJSON!,
      };

      if (jsonUploadParams) {
        s3Client
          .send(new PutObjectCommand(jsonUploadParams))
          .then(() => {
            console.log("bueno");
            setMessage("Estamos guardando tus documentos...");
            handleSave(
              json_url,
              "pdf_url",
              box,
              codeEmployee,
              JSON_uri,
              JSON.stringify(DTE_FORMED, null, 2)
            );
            // setSavedUrls({
            //   json: json_url,
            //   pdf: "",
            // });
          })
          .catch((error) => {
            console.log(error);
            ToastAndroid.show(
              "Error al subir el archivo JSON",
              ToastAndroid.LONG
            );
            setLoadingSave(false);
            Alert.alert(
              "Fallo la subida a nuestros servidores",
              "Puedes descargar el JSON e intentar subir la venta manualmente",
              [
                {
                  text: "Cancelar",
                  onPress: () => console.log("Cancel Pressed"),
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
        setLoadingSave(false);
        Alert.alert(
          "Fallo la subida a nuestros servidores",
          "Puedes descargar el JSON e intentar subir la venta manualmente",
          [
            {
              text: "Cancelar",
              onPress: () => console.log("Cancel Pressed"),
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
    box: IBox,
    codeEmployee: string,
    JSON_uri: string,
    json: string
  ) => {
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
          .post(API_URL + "/sales/factura-salesvv", payload, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then(() => {
            setMessage("");
            Alert.alert("Éxito", "Se completaron todos los procesos");
            setLoadingSave(false);
            setShowModalSale(false);
            emptyCart();
            clearAllData();
          })
          .catch((error) => {
            console.log("el error", error);
            ToastAndroid.show("Error al guarda la venta", ToastAndroid.LONG);
            setLoadingSave(false);
            Alert.alert(
              "Fallo al guardarlo en nuestra base de datos",
              "¿Quieres volver a intentarlo?",
              [
                {
                  text: "Cancelar",
                  onPress: () => console.log("Cancel Pressed"),
                  style: "cancel",
                },
                {
                  text: "Descargar JSON",
                  onPress: () => handleDownload(json, JSON_uri),
                },
                {
                  text: "Si, Re-intentar",
                  onPress: () =>
                    handleSave(
                      json_url,
                      pdf_url,
                      box,
                      codeEmployee,
                      JSON_uri,
                      json
                    ),
                },
              ]
            );
          });
      })
      .catch(() => {
        setLoadingSave(false);
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
  const handleContigence = async (
    DTE: SVFE_FC_SEND,
    box: number,
    codeEmployee: string
  ) => {
    if (!DTE) {
      ToastAndroid.show("No se obtuvo la venta", ToastAndroid.SHORT);
      setLoadingSave(false);
      return;
    }

    setLoadingSave(true);
    setMessage(
      "Estamos realizando el evento\n de contingencia, Espera un momento..."
    );
    if (DTE) {
      const JSON_uri =
        FileSystem.documentDirectory +
        DTE.dteJson.identificacion.numeroControl +
        ".json";

      FileSystem.writeAsStringAsync(
        JSON_uri,
        JSON.stringify({
          ...DTE.dteJson,
        }),
        {
          encoding: FileSystem.EncodingType.UTF8,
        }
      )
        .then(async () => {
          setMessage("Estamos procesando la información, Espera un momento...");
          const json_url = `CLIENTES/${
            transmitter.nombre
          }/${new Date().getFullYear()}/VENTAS/FACTURAS/${formatDate()}/${
            DTE.dteJson.identificacion.codigoGeneracion
          }/${DTE.dteJson.identificacion.numeroControl}.json`;

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
            setLoadingSave(false);
            return;
          }

          const jsonUploadParams = {
            Bucket: SPACES_BUCKET,
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
                    cajaId: box,
                    codigoEmpleado: codeEmployee,
                    sello: false,
                    clienteId: customer?.id,
                  };
                  return_token()
                    .then((token) => {
                      axios
                        .post(API_URL + "/sales/factura-sale", payload, {
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
                      ToastAndroid.show(
                        "No tienes el acceso necesario",
                        ToastAndroid.LONG
                      );
                    });
                } else {
                  ToastAndroid.show(
                    "Error inesperado, contacte al equipo de soporte",
                    ToastAndroid.LONG
                  );
                }
              })
              .catch((error) => {
                ToastAndroid.show(
                  "Ocurrió un error al subir el archivo",
                  ToastAndroid.LONG
                );
              });
          } else {
            ToastAndroid.show(
              "Ocurrió un error al crear el Json",
              ToastAndroid.LONG
            );
          }
        })
        .catch(() => {
          ToastAndroid.show("Ocurrió un error en el Json", ToastAndroid.LONG);
        });
    }
  };

  const handleVerify = async (
    DTE: SVFE_FC_SEND,
    box: number,
    empleado: string
  ) => {
    setLoadingRevision(true);
    const user = await get_user();

    if (DTE?.dteJson.identificacion && transmitter) {
      const payload = {
        nitEmisor: transmitter.nit,
        tdte: DTE.dteJson.identificacion.tipoDte ?? "01",
        codigoGeneracion: DTE.dteJson.identificacion.codigoGeneracion ?? "",
      };
      return_token_mh()
        .then((token_mh) => {
          check_dte(payload, String(token_mh))
            .then(async (response) => {
              if (response.data.selloRecibido) {
                setLoadingRevision(false);
                setLoadingSave(true);
                const DTE_FORMED = {
                  ...DTE.dteJson,
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
                // const document_gen = generateFacturaComercial(
                //   doc,
                //   DTE_FORMED,
                //   new Uint8Array(blobQR.data),
                //   img_invalidation,
                //   img_logo,
                //   false
                // );
                if (DTE_FORMED) {
                  const JSON_uri =
                    FileSystem.documentDirectory +
                    DTE.dteJson.identificacion.numeroControl +
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
                    const json_url = `CLIENTES/${
                      transmitter.nombre
                    }/${new Date().getFullYear()}/VENTAS/FACTURAS/${formatDate()}/${
                      DTE.dteJson.identificacion.codigoGeneracion
                    }/${DTE.dteJson.identificacion.numeroControl}.json`;

                    // const pdf_url = `CLIENTES/${
                    //   transmitter.nombre
                    // }/${new Date().getFullYear()}/VENTAS/FACTURAS/${formatDate()}/${
                    //   DTE.dteJson.identificacion.codigoGeneracion
                    // }/${DTE.dteJson.identificacion.numeroControl}.pdf`;

                    // const filePath = `${FileSystem.documentDirectory}example.pdf`;
                    // await FileSystem.writeAsStringAsync(
                    //   filePath,
                    //   document_gen.replace(
                    //     /^data:application\/pdf;filename=generated\.pdf;base64,/,
                    //     ""
                    //   ),
                    //   {
                    //     encoding: FileSystem.EncodingType.Base64,
                    //   }
                    // );
                    // const response = await fetch(filePath);

                    // if (!response) {
                    //   setLoadingSave(false);
                    //   return;
                    // }

                    // const blob = await response.blob();
                    // const pdfUploadParams = {
                    //   Bucket: SPACES_BUCKET,
                    //   Key: pdf_url,
                    //   Body: blob,
                    // };
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
                      Bucket: SPACES_BUCKET,
                      Key: json_url,
                      Body: blobJSON!,
                    };
                    setMessage("Se están subiendo los documentos...");
                    if (jsonUploadParams) {
                      s3Client
                        .send(new PutObjectCommand(jsonUploadParams))
                        .then((response) => {
                          if (response.$metadata) {
                            // s3Client
                            //   .send(new PutObjectCommand(pdfUploadParams))
                            //   .then((response) => {
                            //     if (response.$metadata) {
                                  setMessage(
                                    "Estamos guardando tus documentos"
                                  );

                                  const payload = {
                                    pdf: "pdf_url",
                                    dte: json_url,
                                    cajaId: box,
                                    codigoEmpleado: empleado,
                                    sello: true,
                                    clienteId: customer?.id,
                                  };
                                  return_token()
                                    .then((token) => {
                                      axios
                                        .post(
                                          API_URL + "/sales/factura-sale",
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
                              //   } else {
                              //     setLoadingSave(false);
                              //     ToastAndroid.show(
                              //       "Error inesperado, contacte al equipo de soporte1",
                              //       ToastAndroid.LONG
                              //     );
                              //   }
                              // })
                              // .catch(() => {
                              //   setLoadingSave(false);
                              //   ToastAndroid.show(
                              //     "Ocurrió un error al subir el PDF",
                              //     ToastAndroid.LONG
                              //   );
                              // });
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
        // <View style={{ justifyContent: "center", alignItems: "center" }}>
        //   <Pressable
        //     onPress={generateFactura}
        //     style={{
        //       width: "84%",
        //       padding: 16,
        //       borderRadius: 4,
        //       marginTop: 12,
        //       backgroundColor: "#1d4ed8",
        //       display: "flex",
        //       justifyContent: "center",
        //       alignItems: "center",
        //     }}
        //   >
        //     <Text
        //       style={{
        //         color: "#fff",
        //         fontWeight: "bold",
        //       }}
        //     >
        //       Generar la factura
        //     </Text>
        //   </Pressable>
        // </View>
        <View style={stylesGlobals.viewBotton}>
          <Button
            withB={390}
            onPress={() => {}}
            Title="Generar la factura"
            color={theme.colors.dark}
          />
        </View>
      )}
    </>
  );
};

export default ElectronicInvoice;
