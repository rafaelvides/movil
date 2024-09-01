import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
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
  useEffect,
  useMemo,
  useState,
} from "react";
import { ISale } from "@/types/sale/sale.types";
import * as yup from "yup";
import { StatusBar } from "expo-status-bar";
import { Formik } from "formik";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Dropdown } from "react-native-element-dropdown";
import { AntDesign } from "@expo/vector-icons";
import { useBillingStore } from "@/store/billing/billing.store";
import {
  Invalidation,
  InvalidationType,
} from "@/types/dte/sub_interface/invalidation-type.types";
import { useSaleStore } from "../../../store/sale.store";
import { ICat022TipoDeDocumentoDeIde } from "@/types/billing/cat-022-tipo-de-documento-de-ide.types";
import {
  IInvalidationToMH,
  SVFE_Invalidacion_SEND,
} from "@/types/svf_dte/invalidation.types";
import { useTransmitterStore } from "@/store/transmitter.store";
import { ambiente, version } from "@/utils/constants";
import { generate_uuid } from "@/plugins/random/random";
import { getElSalvadorDateTime } from "@/utils/date";
import {
  firmarDocumentoInvalidacion,
  send_to_mh_invalidation,
} from "@/services/ministry_of_finance.service";
import { return_token_mh } from "@/plugins/secure_store";
import axios, { AxiosError } from "axios";
import { invalidation_of_sales } from "@/services/sale.service";
import { SendMHFailed } from "@/types/svf_dte/responseMH/responseMH.types";
import { save_logs } from "@/services/logs.service";
import { get_find_by_correlative } from "@/services/point_of_sale.service";
// import { type_document } from "@/offline/global/document_to_be_issued";
interface Props {
  sale: ISale | undefined;
  setModal: Dispatch<SetStateAction<boolean>>;
  setRefreshing: Dispatch<SetStateAction<boolean>>;
  setMessage: Dispatch<SetStateAction<string>>;
  setsCreenChange: Dispatch<SetStateAction<boolean>>;
}
const Invalidations = (props: Props) => {
  const { sale, setModal, setRefreshing, setMessage, setsCreenChange } = props;
  const [isFocus1, setIsFocus1] = useState(false);
  const [isFocus2, setIsFocus2] = useState(false);
  const [isFocus3, setIsFocus3] = useState(false);
  const [isFocus4, setIsFocus4] = useState(false);

  const [valueTypeDocument, setValueTypeDocument] =
    useState<ICat022TipoDeDocumentoDeIde>();
  const [valueTypeDocumentApplicant, setValueTypeDocumentApplicant] =
    useState<ICat022TipoDeDocumentoDeIde>();
  const [generationCodeR, setGenerationCodeR] = useState("");
  const [valueReasonInvalidation, setValueReasonInvalidation] =
    useState<InvalidationType>();
  const validationsSchema = yup.object().shape({
    nameResponsible: yup.string().required("**El nombre es requerido**"),
    nameApplicant: yup.string().required("**El nombre es requerido**"),
    docNumberResponsible: yup
      .string()
      .required("**El documento es requerido**"),
    docNumberApplicant: yup.string().required("**El documento es requerido**"),
    typeDocResponsible: yup
      .string()
      .required("**El tipo de documento es requerido**"),
    typeDocApplicant: yup
      .string()
      .required("**El tipo de documento es requerido**"),
  });
  const {
    OnGetCat022TipoDeDocumentoDeIde,
    cat_022_tipo_de_documento_de_ide,
    OnGetCat024TipoDeLaInvalidacion,
    cat_024_tipos_de_invalidacion,
  } = useBillingStore();
  const { OnGetTransmitter, transmitter } = useTransmitterStore();
  const { GetRecentSales, recentSales } = useSaleStore();
  useEffect(() => {
    OnGetCat022TipoDeDocumentoDeIde();
    OnGetCat024TipoDeLaInvalidacion();
    GetRecentSales(Number(sale?.id));
    OnGetTransmitter();
  }, [sale?.id]);

  const onSubmit = async (value: Invalidation) => {
    if (valueReasonInvalidation?.codigo !== "2" && generationCodeR !== "") {
      ToastAndroid.show(
        "Debes de seleccionar la venta a remplazar",
        ToastAndroid.LONG
      );
      return;
    }

    if (valueReasonInvalidation?.codigo === "0") {
      ToastAndroid.show("Debes de seleccionar el motivo", ToastAndroid.LONG);
    }
    const correlatives = await get_find_by_correlative(transmitter.id, "03");
    if (!correlatives.data.correlativo) {
      ToastAndroid.show("No se encontraron correlativos", ToastAndroid.SHORT);
      return;
    }
    setsCreenChange(true);
    const generate: SVFE_Invalidacion_SEND = {
      nit: transmitter.nit,
      passwordPri: transmitter.clavePublica,
      dteJson: {
        identificacion: {
          version: version,
          ambiente: ambiente,
          codigoGeneracion: generate_uuid().toUpperCase(),
          fecAnula: getElSalvadorDateTime().fecEmi,
          horAnula: getElSalvadorDateTime().horEmi,
        },
        emisor: {
          nit: transmitter.nit,
          nombre: transmitter.nombre,
          tipoEstablecimiento:
            correlatives.data.correlativo.tipoEstablecimiento,
          correo: transmitter.correo,
          codEstable:
            correlatives.data.correlativo.codEstable !== "N/A" &&
            correlatives.data.correlativo.codEstable !== "0"
              ? correlatives.data.correlativo.codEstable
              : null,
          codPuntoVenta:
            correlatives.data.correlativo.codPuntoVenta !== "N/A" &&
            correlatives.data.correlativo.codPuntoVenta !== "0"
              ? correlatives.data.correlativo.codPuntoVenta
              : null,
          nomEstablecimiento: transmitter.nombre,
          telefono: transmitter.telefono,
        },
        documento: {
          tipoDte: sale?.tipoDte!,
          codigoGeneracion: sale?.codigoGeneracion!,
          codigoGeneracionR: generationCodeR !== "" ? generationCodeR : null,
          selloRecibido: sale?.selloRecibido!,
          numeroControl: sale?.numeroControl!,
          fecEmi: sale?.fecEmi!,
          montoIva: 0.0,
          tipoDocumento: sale?.customer.tipoDocumento!,
          numDocumento: sale?.customer.numDocumento!,
          nombre: sale?.customer.nombre!,
        },
        motivo: {
          tipoAnulacion: Number(valueReasonInvalidation?.codigo),
          motivoAnulacion: valueReasonInvalidation?.valores!,
          nombreResponsable: value.nameResponsible,
          tipDocResponsable: value.typeDocResponsible,
          numDocResponsable: value.docNumberResponsible,
          nombreSolicita: value.nameApplicant,
          tipDocSolicita: value.typeDocApplicant,
          numDocSolicita: value.docNumberApplicant,
        },
      },
    };
    setMessage("Estamos firmando tu DTE...");
    firmarDocumentoInvalidacion(generate).then((firma) => {
      return_token_mh().then((token_mh) => {
        if (firma.data.body) {
          const dataMH: IInvalidationToMH = {
            ambiente: ambiente,
            version: version,
            idEnvio: 1,
            documento: firma.data.body,
          };
          //------
          if (token_mh) {
            const source = axios.CancelToken.source();
            const timeout = setTimeout(() => {
              source.cancel("El tiempo de espera ha expirado");
            }, 60000);
            setMessage("Se ah enviado a hacienda, esperando respuesta...");
            Promise.race([
              send_to_mh_invalidation(dataMH, token_mh).then((ressponce) => {
                setMessage(
                  "La invalidación ah sido aprobada por hacienda, se ah procedido a guardar el registro, tomara un momento..."
                );
                clearTimeout(timeout);
                invalidation_of_sales(sale?.id!, ressponce.data.selloRecibido)
                  .then((ress) => {
                    if (ress.data.ok) {
                      setModal(false);
                      ToastAndroid.show("Venta invalidada", ToastAndroid.LONG);
                      setRefreshing(true);
                      setsCreenChange(false);
                    } else {
                      ToastAndroid.show(
                        "Ocurrió un error al guardar los datos <500>",
                        ToastAndroid.LONG
                      );
                      setsCreenChange(false);
                    }
                  })
                  .catch(async () => {
                    ToastAndroid.show(
                      "Error al guarda la invalidación",
                      ToastAndroid.LONG
                    );
                    setsCreenChange(false);
                  });
              }),
              new Promise((_, reject) => {
                setTimeout(() => {
                  reject(new Error("El tiempo de espera ha expirado"));
                }, 60000);
              }),
            ]).catch(async (error: AxiosError<SendMHFailed>) => {
              clearTimeout(timeout);
              setsCreenChange(false);
              if (error.response?.data) {
                Alert.alert(
                  error?.response?.data?.descripcionMsg!,
                  error?.response?.data.observaciones &&
                    error.response.data.observaciones.length > 0
                    ? error.response?.data.observaciones.join("\n\n")
                    : ""
                );
                await save_logs({
                  title:
                    error.response.data.descripcionMsg ??
                    "Error al procesar la invalidacion",
                  message:
                    error.response.data.observaciones &&
                    error.response.data.observaciones.length > 0
                      ? error.response.data.observaciones.join("\n\n")
                      : "",
                  generationCode:
                    generate.dteJson.identificacion.codigoGeneracion,
                });
              } else {
                ToastAndroid.show("Error inesperado", ToastAndroid.LONG);
              }
            });
          }
        }
      });
    });
  };
  // const title = useMemo(() => {
  //   const responce = type_document.find((obj) => obj.codigo === sale?.tipoDte);
  //   return responce ? responce.valores : "Documento DTE";
  // }, [sale?.id]);

  return (
    <>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.container} behavior="height">
        <>
          <Pressable
            style={{
              position: "absolute",
              right: 10,
              top: 10,
              marginBottom: 40,
            }}
          >
            <MaterialCommunityIcons
              name="close"
              size={30}
              onPress={() => {
                setModal(false);
              }}
            />
          </Pressable>
          {/* <Text style={styles.textTitle}>{title}</Text> */}
          <Formik
            onSubmit={onSubmit}
            validationSchema={validationsSchema}
            initialValues={{
              nameResponsible: "",
              nameApplicant: "",
              docNumberResponsible: "",
              docNumberApplicant: "",
              typeDocResponsible: "",
              typeDocApplicant: "",
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <ScrollView style={{ width: "100%", flex: 1, marginTop: 10 }}>
                <View
                  style={{
                    width: "100%",
                    display: "flex",
                    marginTop: 5,
                    marginBottom: 15,
                  }}
                >
                  <View
                    style={{
                      width: "100%",
                      display: "flex",
                      marginTop: 5,
                    }}
                  >
                    <Text style={styles.textInput}>
                      Nombre del responsable
                      <Text
                        style={{
                          fontSize: 18,
                          color: "#EF4444",
                          fontWeight: "bold",
                        }}
                      >
                        *
                      </Text>
                    </Text>
                    
                    {errors.nameResponsible && touched.nameResponsible && (
                      <Text style={{ color: "red", marginTop: 5 }}>
                        {errors.nameResponsible}
                      </Text>
                    )}
                  </View>
                  <View
                    style={{
                      width: "100%",
                      display: "flex",
                      marginTop: 10,
                    }}
                  >
                    <Text style={styles.textInput}>Tipo de documento</Text>
                    <SafeAreaView
                      style={{
                        width: "100%",
                        borderWidth: 1,
                        borderColor: "#D1D5DB",
                        borderRadius: 15,
                        padding: 12,
                      }}
                    >
                      <Dropdown
                        style={[isFocus1 && { borderColor: "blue" }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={cat_022_tipo_de_documento_de_ide}
                        search
                        maxHeight={200}
                        labelField="valores"
                        valueField="id"
                        placeholder={!isFocus1 ? "Selecciona un item " : "..."}
                        searchPlaceholder="Escribe para..."
                        value={valueTypeDocument}
                        onFocus={() => setIsFocus1(true)}
                        onBlur={() => setIsFocus1(false)}
                        onChange={(item) => {
                          setIsFocus1(false);
                          setValueTypeDocument(item);
                          let event = {
                            target: {
                              name: "typeDocResponsible",
                              value: item.codigo,
                            },
                          };
                          handleChange(event);
                        }}
                        renderLeftIcon={() => (
                          <AntDesign
                            style={styles.icon}
                            color={isFocus1 ? "blue" : "black"}
                            name="Safety"
                            size={20}
                          />
                        )}
                      />
                    </SafeAreaView>
                    {errors.typeDocResponsible &&
                      touched.typeDocResponsible && (
                        <Text style={{ color: "red", marginTop: 5 }}>
                          {errors.typeDocResponsible}
                        </Text>
                      )}
                  </View>
                  <View
                    style={{
                      width: "100%",
                      display: "flex",
                      marginTop: 5,
                    }}
                  >
                    <Text style={styles.textInput}>
                      Numero de documento
                      <Text
                        style={{
                          fontSize: 18,
                          color: "#EF4444",
                          fontWeight: "bold",
                        }}
                      >
                        *
                      </Text>
                    </Text>
                   
                    {errors.docNumberResponsible &&
                      touched.docNumberResponsible && (
                        <Text style={{ color: "red", marginTop: 5 }}>
                          {errors.docNumberResponsible}
                        </Text>
                      )}
                  </View>
                  <View
                    style={{
                      width: "100%",
                      display: "flex",
                      marginTop: 5,
                    }}
                  >
                    <Text style={styles.textInput}>
                      Nombre del solicitante
                      <Text
                        style={{
                          fontSize: 18,
                          color: "#EF4444",
                          fontWeight: "bold",
                        }}
                      >
                        *
                      </Text>
                    </Text>
                    
                    {errors.nameApplicant && touched.nameApplicant && (
                      <Text style={{ color: "red", marginTop: 5 }}>
                        {errors.nameApplicant}
                      </Text>
                    )}
                  </View>
                  <View
                    style={{
                      width: "100%",
                      display: "flex",
                      marginTop: 10,
                    }}
                  >
                    <Text style={styles.textInput}>Tipo de documento</Text>
                    <SafeAreaView
                      style={{
                        width: "100%",
                        borderWidth: 1,
                        borderColor: "#D1D5DB",
                        borderRadius: 15,
                        padding: 12,
                      }}
                    >
                      <Dropdown
                        style={[isFocus2 && { borderColor: "blue" }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={cat_022_tipo_de_documento_de_ide}
                        search
                        maxHeight={200}
                        labelField="valores"
                        valueField="id"
                        placeholder={!isFocus2 ? "Selecciona un item " : "..."}
                        searchPlaceholder="Escribe para..."
                        value={valueTypeDocumentApplicant}
                        onFocus={() => setIsFocus2(true)}
                        onBlur={() => setIsFocus2(false)}
                        onChange={(item) => {
                          setIsFocus2(false);
                          setValueTypeDocumentApplicant(item);
                          let event = {
                            target: {
                              name: "typeDocApplicant",
                              value: item.codigo,
                            },
                          };
                          handleChange(event);
                        }}
                        renderLeftIcon={() => (
                          <AntDesign
                            style={styles.icon}
                            color={isFocus2 ? "blue" : "black"}
                            name="Safety"
                            size={20}
                          />
                        )}
                      />
                    </SafeAreaView>
                    {errors.typeDocApplicant && touched.typeDocApplicant && (
                      <Text style={{ color: "red", marginTop: 5 }}>
                        {errors.typeDocApplicant}
                      </Text>
                    )}
                  </View>
                  <View
                    style={{
                      width: "100%",
                      display: "flex",
                      marginTop: 5,
                    }}
                  >
                    <Text style={styles.textInput}>
                      Numero de documento
                      <Text
                        style={{
                          fontSize: 18,
                          color: "#EF4444",
                          fontWeight: "bold",
                        }}
                      >
                        *
                      </Text>
                    </Text>
                   
                    {errors.docNumberApplicant &&
                      touched.docNumberApplicant && (
                        <Text style={{ color: "red", marginTop: 5 }}>
                          {errors.docNumberApplicant}
                        </Text>
                      )}
                  </View>
                  {/* {isEnabled === true && (
                  <> */}
                  <View
                    style={{
                      width: "100%",
                      display: "flex",
                      marginTop: 10,
                    }}
                  >
                    <Text style={styles.textInput}>
                      Motivo de la invalidación
                    </Text>
                    <SafeAreaView
                      style={{
                        width: "100%",
                        borderWidth: 1,
                        borderColor: "#D1D5DB",
                        borderRadius: 15,
                        padding: 12,
                      }}
                    >
                      <Dropdown
                        style={[isFocus3 && { borderColor: "blue" }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={cat_024_tipos_de_invalidacion}
                        search
                        maxHeight={220}
                        labelField="valores"
                        valueField="id"
                        placeholder={!isFocus3 ? "Selecciona un item " : "..."}
                        searchPlaceholder="Escribe para..."
                        value={valueReasonInvalidation}
                        onFocus={() => setIsFocus3(true)}
                        onBlur={() => setIsFocus3(false)}
                        onChange={(item) => {
                          setIsFocus3(false);
                          setValueReasonInvalidation(item);
                          let event = {
                            target: {
                              name: "reasonInvalidation",
                              value: item.id,
                            },
                          };
                          handleChange(event);
                        }}
                        renderLeftIcon={() => (
                          <AntDesign
                            style={styles.icon}
                            color={isFocus3 ? "blue" : "black"}
                            name="Safety"
                            size={20}
                          />
                        )}
                      />
                    </SafeAreaView>
                  </View>
                  {valueReasonInvalidation?.codigo !== "2" && (
                    <View
                      style={{
                        width: "100%",
                        display: "flex",
                        marginTop: 10,
                      }}
                    >
                      <Text style={styles.textInput}>Ventas recientes</Text>
                      <SafeAreaView
                        style={{
                          width: "100%",
                          borderWidth: 1,
                          borderColor: "#D1D5DB",
                          borderRadius: 15,
                          padding: 12,
                        }}
                      >
                        <Dropdown
                          style={[isFocus4 && { borderColor: "blue" }]}
                          placeholderStyle={styles.placeholderStyle}
                          selectedTextStyle={styles.selectedTextStyle}
                          inputSearchStyle={styles.inputSearchStyle}
                          iconStyle={styles.iconStyle}
                          data={recentSales}
                          search
                          maxHeight={200}
                          labelField="numeroControl"
                          valueField="id"
                          placeholder={
                            !isFocus4 ? "Selecciona un item " : "..."
                          }
                          searchPlaceholder="Escribe para..."
                          value={generationCodeR}
                          onFocus={() => setIsFocus4(true)}
                          onBlur={() => setIsFocus4(false)}
                          onChange={(item) => {
                            setIsFocus4(false);
                            setGenerationCodeR(item.codigoGeneracion);
                            let event = {
                              target: {
                                name: "reasonInvalidation",
                                value: item.id,
                              },
                            };
                            handleChange(event);
                          }}
                          renderLeftIcon={() => (
                            <AntDesign
                              style={styles.icon}
                              color={isFocus4 ? "blue" : "black"}
                              name="Safety"
                              size={20}
                            />
                          )}
                        />
                      </SafeAreaView>
                    </View>
                  )}
                  {/* </>
                )} */}

                  {/* <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 15,
                  }}
                >
                  <Text style={{ color: "#2C3377" }}>
                    ¿Motivo y reemplazar la venta?
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#3e3e3e", marginRight: 5 }}>No</Text>
                    <Switch
                      style={{
                        transform: [{ scaleX: 1.0 }, { scaleY: 1.0 }],
                      }}
                      trackColor={{
                        false: "#767577",
                        true: "#3D69B4",
                      }}
                      thumbColor={isEnabled ? "#f4f3f4" : "#f4f3f4"}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={toggleSwitch}
                      value={isEnabled}
                    />
                    <Text style={{ color: "#3D69B4", marginLeft: 8 }}>Si</Text>
                  </View>
                </View> */}
                </View>

                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 36,
                  }}
                >
                  
                </View>
              </ScrollView>
            )}
          </Formik>
        </>
      </KeyboardAvoidingView>
    </>
  );
};

export default Invalidations;

const styles = StyleSheet.create({
  icon: {
    marginRight: 5,
  },
  container: {
    flex: 1,
    width: "100%",
    display: "flex",
    padding: 32,
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  input: {
    height: 50,
    paddingLeft: 40,
    borderColor: "#D9D9DA",
    borderWidth: 1,
    borderRadius: 15,
  },
  inputWrapper: {
    position: "relative",
    width: "100%",
    height: 50,
    justifyContent: "center",
    marginBottom: 15,
  },
  textTitle: {
    fontSize: 20,
    marginTop: -10,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  textInput: {
    marginLeft: 10,
  },
});
