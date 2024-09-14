import {
  ToastAndroid,
  Alert,
  View,
  StyleSheet,
  Animated,
} from "react-native";
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
import { get_box_data, get_user } from "../../../plugins/async_storage";
import { save_logs } from "@/services/logs.service";
import { formatDate } from "@/utils/date";
import * as FileSystem from "expo-file-system";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/plugins/s3";
import { return_token_mh } from "@/plugins/secure_store";
import { return_token } from "@/plugins/async_storage";
import { ICheckResponse } from "@/types/dte/Check.types";
import { usePointOfSaleStore } from "@/store/point_of_sale.store";
import { generateURL } from "@/utils/utils";
import { IBox } from "@/types/box/box.types";
import * as Sharing from "expo-sharing";
import { Blob } from "buffer";
import { useBranchProductStore } from "@/store/branch_product.store";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import Button from "@/components/Global/components_app/Button";
import { ThemeContext } from "@/hooks/useTheme";
import ErrorAlert from "@/components/Global/manners/ErrorAlert";
import { IEmployee } from "@/types/employee/employee.types";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import LoadingSales from "@/components/Global/components_app/LoadingSales";

const ElectronicInvoice = ({
  customer,
  typeDocument,
  transmitter,
  cart_products,
  setShowModalSale,
  clearAllData,
  setLoadingRevision,
  pays,
  conditionPayment,
  totalUnformatted,
  focusButton,
  onePercentRetention,
  employee,
}: {
  customer: ICustomer | undefined;
  employee: IEmployee | undefined;
  transmitter: ITransmitter;
  typeDocument: ICat002TipoDeDocumento;
  cart_products: ICartProduct[];
  pays: IFormasDePagoResponse[];
  conditionPayment: number;
  totalUnformatted: number;
  focusButton: boolean;
  onePercentRetention: number;
  setShowModalSale: Dispatch<SetStateAction<boolean>>;
  setLoadingRevision: Dispatch<SetStateAction<boolean>>;
  clearAllData: () => void;
}) => {
  const { emptyCart } = useBranchProductStore();
  const { OnGetCorrelativesByDte } = usePointOfSaleStore();
  const [modalError, setModalError] = useState(false);
  const [title, setTitle] = useState<string>("");
  const [loadingSale, setLoadingSale] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [savedUrls, setSavedUrls] = useState({ json: Blob, urlJSon: "" });
  const [currentDTE, setCurrentDTE] = useState<SVFE_FC_SEND>();
  const [step, setStep] = useState(0);
  const progress = new Animated.Value(step);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: step,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [step]);

  const [detailSale, setDetailSale] = useState({
    box: 0,
    codEmployee: 0,
  });
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
    const correlatives = await OnGetCorrelativesByDte(user.id, "FE");

    if (!correlatives) {
      ToastAndroid.show("No se encontraron correlativos", ToastAndroid.SHORT);
      return;
    }
    const box = await get_box_data();

    if (box?.id === 0 || !box) {
      ToastAndroid.show("No se encontró la caja", ToastAndroid.SHORT);
      return;
    }
    if (!employee) {
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
      setLoadingSale(true);
      setCurrentDTE(generate);
      setDetailSale({
        box: box.id,
        codEmployee: employee.id,
      });
      firmarDocumentoFactura(generate)
        .then(async (firma) => {
          if (firma.data.status === "ERROR") {
            const new_data = firma.data as unknown as ErrorFirma;

            setTitle("Error en el firmador " + new_data.body.codigo);
            setErrorMessage(new_data.body.mensaje);
            setLoadingSale(false);
            await save_logs({
              title: new_data.body.codigo ?? "Error al procesar venta",
              message: new_data.body.mensaje
                ? new_data.body.mensaje
                : "Error al firmar el documento",
              generationCode: generate.dteJson.identificacion.codigoGeneracion,
            });
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
              String(employee.id)
            );
          } else {
            setTitle("Error en el firmador");
            setErrorMessage("Error al firmar el documento");
            setModalError(true);
            return;
          }
        })
        .catch(() => {
          Alert.alert(
            "Error al firmar el documento",
            "Intenta firmar el documento mas tarde o contacta al equipo de soporte"
          );
          setLoadingSale(false);
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

    const token_mh = await return_token_mh();

    if (!token_mh) {
      ToastAndroid.show(
        "Fallo al obtener las credenciales del Ministerio de Hacienda",
        ToastAndroid.LONG
      );
      setLoadingSale(false);
      return;
    }
    setStep(1);
    Promise.race([
      send_to_mh(data, token_mh!, source).then(({ data }) => {
        clearTimeout(timeout);
        handleUploadFile(json, firma, data, box, codeEmployee);
      }),
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("El tiempo de espera ha expirado"));
          setLoadingSale(false);
          setModalError(true);
        }, 25000);
      }),
    ]).catch(async (error: AxiosError<SendMHFailed>) => {
      clearTimeout(timeout);
      if (axios.isCancel(error)) {
        setTitle("Tiempo de espera agotado");
        setErrorMessage("El tiempo limite de espera ha expirado");
        setLoadingSale(false);
        setModalError(true);
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
        setModalError(true);
        setLoadingSale(false);
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
        setModalError(true);
        setLoadingSale(false);
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
    setStep(2);
    const DTE_FORMED = {
      ...json.dteJson,
      respuestaMH: respuestaMH,
      firma: firma,
    };
    setResponseMH({ respuestaMH, firma });
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
          setLoadingSale(false);
          return null;
        });
      if (!blobJSON) {
        setLoadingSale(false);
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
          .catch(() => {
            ToastAndroid.show(
              "Error al subir el archivo JSON",
              ToastAndroid.LONG
            );
            setLoadingSale(false);
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
        setLoadingSale(false);
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
    setStep(4);
    return_token()
      .then((token) => {
        axios
          .post(API_URL + "/sales/factura-sale", payload, {
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
            setLoadingSale(false);
            false;
            setShowModalSale(false);
            emptyCart();
            clearAllData();
          })
          .catch(() => {
            ToastAndroid.show("Error al guarda la venta", ToastAndroid.LONG);
            setLoadingSale(false);
            false;
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
        setLoadingSale(false);
        ToastAndroid.show("No tienes el acceso necesario", ToastAndroid.LONG);
      });
  };
  const handleDownload = async (json: string, JSON_uri: string) => {
    try {
      await FileSystem.writeAsStringAsync(JSON_uri, json);
      await Sharing.shareAsync(JSON_uri);
    } catch (error) {
      ToastAndroid.show(`Error al descargar el JSON`, ToastAndroid.LONG);
    }
  };
  const handleContigence = async (
    DTE: SVFE_FC_SEND,
    box: number,
    codeEmployee: string
  ) => {
    if (!DTE) {
      ToastAndroid.show("No se obtuvo la venta", ToastAndroid.SHORT);
      return;
    }

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
                          Toast.show({
                            type: ALERT_TYPE.SUCCESS,
                            title: "Éxito",
                            textBody: "Se completaron todos los procesos",
                          });
                          setShowModalSale(false);
                          emptyCart();
                          clearAllData();
                        })
                        .catch(() => {
                          ToastAndroid.show(
                            "Error al guardarlo en nuestra base de datos",
                            ToastAndroid.LONG
                          );
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
              .catch(() => {
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
    } else {
      ToastAndroid.show(
        "Hubo un error al generar la información",
        ToastAndroid.LONG
      );
    }
  };

  const handleVerify = async (
    DTE: SVFE_FC_SEND,
    box: number,
    empleado: string
  ) => {
    if (!DTE) {
      ToastAndroid.show("No se obtuvo la venta", ToastAndroid.SHORT);
      setLoadingSale(false);
      false;
      return;
    }

    setLoadingRevision(true);

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
                setLoadingSale(false);
                true;
                const DTE_FORMED = {
                  ...DTE.dteJson,
                  ...responseMH,
                };

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

                    const blobJSON = await fetch(JSON_uri)
                      .then((res) => res.blob())
                      .catch(() => {
                        ToastAndroid.show(
                          "Error al generar la url del documento",
                          ToastAndroid.LONG
                        );
                        setLoadingSale(false);
                        false;
                        return null;
                      });
                    if (!blobJSON) {
                      setLoadingSale(false);
                      false;
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
                        .then((response) => {
                          if (response.$metadata) {
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
                                    Toast.show({
                                      type: ALERT_TYPE.SUCCESS,
                                      title: "Éxito",
                                      textBody:
                                        "Se completaron todos los procesos",
                                    });
                                    setLoadingSale(false);
                                    false;
                                    setShowModalSale(false);
                                    clearAllData();
                                  })
                                  .catch(() => {
                                    ToastAndroid.show(
                                      "Error al guarda la venta",
                                      ToastAndroid.LONG
                                    );

                                    setLoadingSale(false);
                                    false;
                                  });
                              })
                              .catch(() => {
                                setLoadingSale(false);
                                false;
                                ToastAndroid.show(
                                  "No tienes el acceso necesario",
                                  ToastAndroid.LONG
                                );
                              });
                          } else {
                            setLoadingSale(false);
                            false;
                            ToastAndroid.show(
                              "Error inesperado, contacte al equipo de soporte",
                              ToastAndroid.LONG
                            );
                          }
                        })
                        .catch(() => {
                          setLoadingSale(false);
                          false;
                          ToastAndroid.show(
                            "Ocurrió un error al subir el Json",
                            ToastAndroid.LONG
                          );
                        });
                    } else {
                      setLoadingSale(false);
                      false;
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
        <>
          {loadingSale ? (
            <LoadingSales step={step} />
          ) : (
            <>
              <ErrorAlert
                visible={modalError}
                title={title}
                message={errorMessage}
                onPressSendContingency={() =>
                  handleContigence(
                    currentDTE!,
                    detailSale.box,
                    String(detailSale.codEmployee)
                  )
                }
                onPressVerify={() =>
                  handleVerify(
                    currentDTE!,
                    detailSale.box,
                    String(detailSale.codEmployee)
                  )
                }
                onPressRetry={() => generateFactura()}
                onClose={() => {
                  setModalError(false);
                  setStep(0);
                }}
              />

              <View style={stylesGlobals.viewBotton}>
                <Button
                  withB={390}
                  onPress={generateFactura}
                  Title="Generar la factura"
                  color={theme.colors.dark}
                />
              </View>
            </>
          )}
        </>
      )}
    </>
  );
};

export default ElectronicInvoice;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 5 },
  },
  processingText: {
    fontSize: 21,
    color: "#4b5563",
    fontWeight: "600",
    marginBottom: 20,
  },
  stepsContainer: {
    flexDirection: "column",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },

  stepInfo: {
    marginLeft: 16,
  },
  stepLabel: {
    fontSize: 19,
    fontWeight: "600",
  },
  activeStepLabel: {
    color: "#16a34a",
  },
  inactiveStepLabel: {
    color: "#6b7280",
  },
  stepDescription: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
});
