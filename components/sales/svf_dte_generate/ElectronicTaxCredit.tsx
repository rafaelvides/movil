import { View, Text, ToastAndroid, Alert, Pressable } from "react-native";
import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { ICustomer } from "@/types/customer/customer.types";
import { ITransmitter } from "@/types/transmitter/transmiter.types";
import { ICat002TipoDeDocumento } from "@/types/billing/cat-002-tipo-de-documento.types";
import { ICartProduct } from "@/types/branch_product/branch_product.types";
import { IFormasDePagoResponse } from "@/types/billing/cat-017-forma-de-pago.types";
import { ITipoTributo } from "@/types/billing/cat-015-tipo-de-tributo.types";
import {
  get_box_data,
  get_configuration,
  get_employee_id,
  get_user,
} from "@/plugins/async_storage";
import { generate_credito_fiscal } from "@/plugins/DTE/ElectronicTaxCreditGenerator";
import { SVFE_CF_SEND } from "@/types/svf_dte/cf.types";
import {
  check_dte,
  firmarDocumentoFiscal,
  send_to_mh,
} from "@/services/ministry_of_finance.service";
import { return_token, return_token_mh } from "@/plugins/secure_store";
import { ambiente, API_URL, SPACES_BUCKET } from "@/utils/constants";
import axios, { AxiosError } from "axios";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/plugins/s3";
import { formatDate } from "@/utils/date";
import * as FileSystem from "expo-file-system";
import {
  ErrorFirma,
  ResponseMHSuccess,
  SendMHFailed,
} from "@/types/svf_dte/responseMH/responseMH.types";
import { ICheckResponse } from "@/types/dte/Check.types";
import jsPDF from "jspdf";
import { generateCreditoFiscal } from "@/plugins/templates/template_cf";
import { useSaleStore } from "@/store/sale.store";
import { QR_URL } from "@/plugins/DTE/make_generator/qr_generate";
import { save_logs } from "@/services/logs.service";
import { PayloadMH } from "@/types/dte/DTE.types";
import { validateCustomerFiscal, validationTransmitter } from "@/utils/filters";
import { usePointOfSaleStore } from "@/store/point_of_sale.store";
import { IBox } from "@/types/box/box.types";
import { generateURL } from "@/utils/utils";
import * as Sharing from "expo-sharing";
import Button from "@/components/Global/components_app/Button";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import { ThemeContext } from "@/hooks/useTheme";

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
  onePercentRetention: number;
  setLoadingSave: Dispatch<SetStateAction<boolean>>;
  setMessage: Dispatch<SetStateAction<string>>;
  setShowModalSale: Dispatch<SetStateAction<boolean>>;
  setLoadingRevision: Dispatch<SetStateAction<boolean>>;
  clearAllData: () => void;
}
const ElectronicTaxCredit = (props: Props) => {
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
    typeTribute,
    focusButton,
    totalUnformatted,
    onePercentRetention,
  } = props;
  const [title, setTitle] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");
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

  // const { OnImgPDF, img_invalidation, img_logo } = useSaleStore();
  const { OnGetCorrelativesByDte } = usePointOfSaleStore();

  // useEffect(() => {
  //   (async () => {
  //     await get_configuration().then((data) => {
  //       OnImgPDF(String(data?.logo));
  //     });
  //   })();
  // }, []);

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
    if (!typeTribute) {
      ToastAndroid.show(
        "Debes seleccionar el tipo de tributo",
        ToastAndroid.SHORT
      );
      return;
    }

    if (!validateCustomerFiscal(customer)) return;
    if (!validationTransmitter(transmitter)) return;

    const user = await get_user();
    if (!user) {
      ToastAndroid.show("No se encontró el usuario", ToastAndroid.SHORT);
      return;
    }
    const correlatives = await OnGetCorrelativesByDte(user.id, "CCF");

    if (!correlatives) {
      ToastAndroid.show("No se encontraron correlativos", ToastAndroid.SHORT);
      return;
    }
    if (
      customer.nit === "N/A" ||
      customer.nrc === "N/A" ||
      customer.codActividad === "N/A" ||
      customer.descActividad === "N/A" ||
      customer.correo === "N/A"
    ) {
      ToastAndroid.show(
        "No tienes los datos necesarios para el crédito fiscal",
        ToastAndroid.LONG
      );
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
    if (cart_products.some((product) => product.monto_descuento < 0)) {
      ToastAndroid.show(
        "No se puede facturar un descuento negativo",
        ToastAndroid.LONG
      );
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
      const generate = generate_credito_fiscal(
        transmitter,
        typeDocument,
        correlatives,
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
        typeTribute,
        conditionPayment,
        totalUnformatted,
        onePercentRetention
      );
      setLoadingSave(true);
      setMessage("Estamos firmando tu documento");

      firmarDocumentoFiscal(generate)
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
              version: 3,
              tipoDte: "03",
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
          // const token_mh = await return_token_mh();
          // if (firma.data.body) {
          //   const data_send: PayloadMH = {
          //     ambiente: ambiente,
          //     idEnvio: 1,
          //     version: 3,
          //     tipoDte: "03",
          //     documento: firma.data.body,
          //   };
          //   setMessage("Se ah enviado a hacienda, esperando respuesta...");
          //   if (token_mh) {
          //     const source = axios.CancelToken.source();
          //     const timeoutId = setTimeout(() => {
          //       source.cancel("El tiempo de espera ha expirado");
          //       setLoadingSave(false);
          //     }, 60000);
          //     Promise.race([
          //       send_to_mh(data_send, token_mh).then(async ({ data }) => {
          //         clearTimeout(timeoutId);
          //         if (data.selloRecibido) {
          //           setMessage("El DTE ah sido validado por hacienda");
          //           const DTE_FORMED = {
          //             ...generate.dteJson,
          //             respuestaMH: data,
          //             firma: firma.data.body,
          //           };
          //           const DTE_FORMED_VERIFY = {
          //             respuestaMH: data,
          //             firma: firma.data.body,
          //           };
          //           setResponseMH(DTE_FORMED_VERIFY);
          //           const doc = new jsPDF();
          //           const QR = QR_URL(
          //             DTE_FORMED.identificacion.codigoGeneracion,
          //             DTE_FORMED.identificacion.fecEmi
          //           );

          //           const blobQR = await axios.get<ArrayBuffer>(QR, {
          //             responseType: "arraybuffer",
          //           });
          //           const document_gen = generateCreditoFiscal(
          //             doc,
          //             DTE_FORMED,
          //             new Uint8Array(blobQR.data),
          //             img_invalidation,
          //             img_logo,
          //             false
          //           );
          //           if (document_gen) {
          //             const JSON_uri =
          //               FileSystem.documentDirectory +
          //               generate.dteJson.identificacion.numeroControl +
          //               ".json";

          //             FileSystem.writeAsStringAsync(
          //               JSON_uri,
          //               JSON.stringify({
          //                 ...DTE_FORMED,
          //               }),
          //               {
          //                 encoding: FileSystem.EncodingType.UTF8,
          //               }
          //             )
          //               .then(async () => {
          //                 const json_url = `CLIENTES/${
          //                   transmitter.nombre
          //                 }/${new Date().getFullYear()}/VENTAS/CRÉDITO_FISCAL/${formatDate()}/${
          //                   generate.dteJson.identificacion.codigoGeneracion
          //                 }/${
          //                   generate.dteJson.identificacion.numeroControl
          //                 }.json`;
          //                 const pdf_url = `CLIENTES/${
          //                   transmitter.nombre
          //                 }/${new Date().getFullYear()}/VENTAS/CRÉDITO_FISCAL/${formatDate()}/${
          //                   generate.dteJson.identificacion.codigoGeneracion
          //                 }/${
          //                   generate.dteJson.identificacion.numeroControl
          //                 }.pdf`;
          //                 setMessage("Estamos generando los documentos");

          //                 const filePath = `${FileSystem.documentDirectory}example.pdf`;
          //                 await FileSystem.writeAsStringAsync(
          //                   filePath,
          //                   document_gen.replace(
          //                     /^data:application\/pdf;filename=generated\.pdf;base64,/,
          //                     ""
          //                   ),
          //                   {
          //                     encoding: FileSystem.EncodingType.Base64,
          //                   }
          //                 );
          //                 const response = await fetch(filePath);

          //                 if (!response) {
          //                   setLoadingSave(false);
          //                   return;
          //                 }

          //                 const blob = await response.blob();
          //                 const pdfUploadParams = {
          //                   Bucket: "facturacion-seedcode",
          //                   Key: pdf_url,
          //                   Body: blob,
          //                 };

          //                 const blobJSON = await fetch(JSON_uri)
          //                   .then((res) => res.blob())
          //                   .catch(() => {
          //                     ToastAndroid.show(
          //                       "Error al generar la url del documento",
          //                       ToastAndroid.LONG
          //                     );
          //                     setLoadingSave(false);
          //                     return null;
          //                   });
          //                 if (!blobJSON) {
          //                   setLoadingSave(false);
          //                   return;
          //                 }

          //                 const jsonUploadParams = {
          //                   Bucket: "facturacion-seedcode",
          //                   Key: json_url,
          //                   Body: blobJSON!,
          //                 };

          //                 if (jsonUploadParams && pdfUploadParams) {
          //                   s3Client
          //                     .send(new PutObjectCommand(jsonUploadParams))
          //                     .then((response) => {
          //                       if (response.$metadata) {
          //                         s3Client
          //                           .send(new PutObjectCommand(pdfUploadParams))
          //                           .then((response) => {
          //                             if (response.$metadata) {
          //                               setMessage(
          //                                 "Estamos guardando tus documentos"
          //                               );
          //                               const payload = {
          //                                 pdf: pdf_url,
          //                                 dte: json_url,
          //                                 cajaId: box.id,
          //                                 codigoEmpleado: codeEmployee,
          //                                 sello: true,
          //                                 clienteId: customer?.id,
          //                               };
          //                               return_token()
          //                                 .then((token) => {
          //                                   axios
          //                                     .post(
          //                                       API_URL +
          //                                         "/sales/sale-fiscal-transaction",
          //                                       payload,
          //                                       {
          //                                         headers: {
          //                                           Authorization: `Bearer ${token}`,
          //                                         },
          //                                       }
          //                                     )
          //                                     .then(() => {
          //                                       setMessage("");
          //                                       Alert.alert(
          //                                         "Éxito",
          //                                         "Se completaron todos los procesos"
          //                                       );
          //                                       setLoadingSave(false);
          //                                       setShowModalSale(false);
          //                                       clearAllData();
          //                                     })
          //                                     .catch(() => {
          //                                       ToastAndroid.show(
          //                                         "Error al guarda la venta",
          //                                         ToastAndroid.LONG
          //                                       );
          //                                       setMessage(
          //                                         "Se produjo un error al guardar la venta en nuestra base de datos"
          //                                       );
          //                                       setLoadingSave(false);
          //                                     });
          //                                 })
          //                                 .catch(() => {
          //                                   setLoadingSave(false);
          //                                   ToastAndroid.show(
          //                                     "No tienes el acceso necesario",
          //                                     ToastAndroid.LONG
          //                                   );
          //                                 });
          //                             } else {
          //                               setLoadingSave(false);
          //                               ToastAndroid.show(
          //                                 "Error inesperado, contacte al equipo de soporte1",
          //                                 ToastAndroid.LONG
          //                               );
          //                             }
          //                           })
          //                           .catch(() => {
          //                             setLoadingSave(false);
          //                             ToastAndroid.show(
          //                               "Ocurrió un error al subir el PDF",
          //                               ToastAndroid.LONG
          //                             );
          //                           });
          //                       } else {
          //                         setLoadingSave(false);
          //                         ToastAndroid.show(
          //                           "Error inesperado, contacte al equipo de soporte",
          //                           ToastAndroid.LONG
          //                         );
          //                       }
          //                     })
          //                     .catch(() => {
          //                       ToastAndroid.show(
          //                         "Ocurrió un error al subir el Json",
          //                         ToastAndroid.LONG
          //                       );
          //                     });
          //                 } else {
          //                   setLoadingSave(false);
          //                   ToastAndroid.show(
          //                     "No tienes los documentos",
          //                     ToastAndroid.LONG
          //                   );
          //                 }
          //               })
          //               .catch(() => {
          //                 setLoadingSave(false);
          //                 ToastAndroid.show(
          //                   "Ocurrió un error en el Json",
          //                   ToastAndroid.LONG
          //                 );
          //               });
          //           } else {
          //             ToastAndroid.show(
          //               "Hubo un error al generar la información",
          //               ToastAndroid.LONG
          //             );
          //             setLoadingSave(false);
          //           }
          //         } else {
          //           ToastAndroid.show(
          //             "Hacienda no respondió con el sello",
          //             ToastAndroid.LONG
          //           );
          //         }
          //       }),
          //     ]).catch(async (error: AxiosError<SendMHFailed>) => {
          //       clearTimeout(timeoutId);
          //       if (error.response?.status === 401) {
          //         ToastAndroid.show(
          //           "No tienes los accesos necesarios",
          //           ToastAndroid.LONG
          //         );
          //         setLoadingSave(false);
          //         return;
          //       } else {
          //         if (error.response?.data) {
          //           Alert.alert(
          //             error.response?.data.descripcionMsg
          //               ? error.response?.data.descripcionMsg
          //               : "El Ministerio de Hacienda no pudo procesar la solicitud",
          //             error.response.data.observaciones &&
          //               error.response.data.observaciones.length > 0
          //               ? error.response?.data.observaciones.join("\n\n")
          //               : error.response?.data.descripcionMsg
          //               ? ""
          //               : "El Ministerio de Hacienda no pudo responder a la solicitud. Por favor, inténtalo de nuevo más tarde.",
          //             [
          //               {
          //                 text: "Reintentar",
          //                 onPress: () => generateTaxCredit(),
          //               },
          //               {
          //                 text: "Revisar",
          //                 onPress: () => {
          //                   handleVerify(generate, box.id, codeEmployee);
          //                 },
          //               },
          //               {
          //                 text: "Enviar a contingencia",
          //                 onPress: () =>
          //                   handleContigence(generate, box.id, codeEmployee),
          //               },
          //             ]
          //           );
          //           setLoadingSave(false);
          //           return;
          //         } else {
          //           ToastAndroid.show(
          //             "Ah ocurrido un error, consulte al equipo de soporte técnico",
          //             ToastAndroid.LONG
          //           );
          //           setLoadingSave(false);
          //         }
          //       }
          //       if (error.response?.data) {
          //         await save_logs({
          //           title:
          //             error.response.data.descripcionMsg ??
          //             "Error al procesar venta",
          //           message:
          //             error.response.data.observaciones &&
          //             error.response.data.observaciones.length > 0
          //               ? error.response?.data.observaciones.join("\n\n")
          //               : "",
          //           generationCode:
          //             generate.dteJson.identificacion.codigoGeneracion,
          //         });
          //       }
          //     });
          //   } else {
          //     ToastAndroid.show(
          //       "No se ha podido obtener el token de hacienda",
          //       ToastAndroid.LONG
          //     );
          //     setLoadingSave(false);
          //   }
          // } else {
          //   ToastAndroid.show(
          //     "No se proporciono la firma necesaria",
          //     ToastAndroid.LONG
          //   );
          //   setLoadingSave(false);
          // }
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
    json: SVFE_CF_SEND,
    firma: string,
    box: IBox,
    codeEmployee: string
  ) => {
    const source = axios.CancelToken.source();
    const timeout = setTimeout(() => {
      source.cancel("El tiempo de espera ha expirado");
    }, 25000);
    const token_mh = await return_token_mh();
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
    json: SVFE_CF_SEND,
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
        "03",
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
          .post(API_URL + "/sales/sale-fiscal-transaction", payload, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then(() => {
            setMessage("");
            Alert.alert("Éxito", "Se completaron todos los procesos");
            setLoadingSave(false);
            setShowModalSale(false);
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
    DTE: SVFE_CF_SEND,
    box: number,
    employee: string
  ) => {
    if (!DTE) {
      ToastAndroid.show("No se obtuvo la venta", ToastAndroid.LONG);
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
          }/${new Date().getFullYear()}/VENTAS/CREDITOS-FISCALES/${formatDate()}/${
            DTE.dteJson.identificacion.codigoGeneracion
          }/${DTE.dteJson.identificacion.numeroControl}.json`;

          const blobJSON = await fetch(JSON_uri)
            .then((res) => res.blob())
            .catch(() => {
              setLoadingSave(false);
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
                    codigoEmpleado: employee,
                    sello: false,
                    clienteId: customer?.id,
                  };
                  return_token()
                    .then((token) => {
                      axios
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
      setLoadingSave(false);
      ToastAndroid.show(
        "Hubo un error al generar la información",
        ToastAndroid.LONG
      );
    }
  };
  const handleVerify = (DTE: SVFE_CF_SEND, box: number, employee: string) => {
    setLoadingRevision(true);
    if (DTE?.dteJson.identificacion && transmitter) {
      const payload = {
        nitEmisor: transmitter.nit,
        tdte: DTE.dteJson.identificacion.tipoDte ?? "03",
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
                // const document_gen = generateCreditoFiscal(
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
                  )
                    .then(async () => {
                      const json_url = `CLIENTES/${
                        transmitter.nombre
                      }/${new Date().getFullYear()}/VENTAS/CRÉDITO_FISCAL/${formatDate()}/${
                        DTE.dteJson.identificacion.codigoGeneracion
                      }/${DTE.dteJson.identificacion.numeroControl}.json`;
                      // const pdf_url = `CLIENTES/${
                      //   transmitter.nombre
                      // }/${new Date().getFullYear()}/VENTAS/CRÉDITO_FISCAL/${formatDate()}/${
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
                      //   Bucket: "facturacion-seedcode",
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
                                      "Se esta guardando el DTE en nuestra base de datos..."
                                    );
                                    const payload = {
                                      pdf: "pdf_url",
                                      dte: json_url,
                                      cajaId: box,
                                      codigoEmpleado: employee,
                                      sello: true,
                                      clienteId: customer?.id,
                                    };
                                    return_token()
                                      .then((token) => {
                                        axios
                                          .post(
                                            API_URL +
                                              "/sales/sale-fiscal-transaction",
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
        //     onPress={() => {
        //       generateTaxCredit();
        //     }}
        //     style={{
        //       width: "84%",
        //       padding: 16,
        //       borderRadius: 4,
        //       backgroundColor: "#1d4ed8",
        //       display: "flex",
        //       justifyContent: "center",
        //       alignItems: "center",
        //       marginTop: 10,
        //     }}
        //   >
        //     <Text
        //       style={{
        //         color: "#fff",
        //         fontWeight: "bold",
        //       }}
        //     >
        //       Generar el crédito fiscal
        //     </Text>
        //   </Pressable>

        // </View>
         <View style={stylesGlobals.viewBotton}>
         <Button
           withB={390}
           onPress={() =>
             {}
           }
           Title="Generar el crédito fiscal"
           color={theme.colors.dark}
         />
       </View>
      )}
    </>
  );
};

export default ElectronicTaxCredit;
