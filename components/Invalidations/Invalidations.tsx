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
  TextInput,
  ActivityIndicator,
  Animated,
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
import { useSaleStore } from "../../store/sale.store";
import { ICat022TipoDeDocumentoDeIde } from "@/types/billing/cat-022-tipo-de-documento-de-ide.types";
import {
  IInvalidationToMH,
  SVFE_Invalidacion_SEND,
} from "@/types/svf_dte/invalidation.types";
import { useTransmitterStore } from "@/store/transmitter.store";
import { ambiente, API_URL, version } from "@/utils/constants";
import { generate_uuid } from "@/plugins/random/random";
import { getElSalvadorDateTime } from "@/utils/date";
import {
  firmarDocumentoInvalidacion,
  send_to_mh_invalidation,
} from "@/services/ministry_of_finance.service";
import { return_token_mh } from "@/plugins/secure_store";
import axios, { AxiosError } from "axios";
import { SeedcodeCatalogosMhService } from "seedcode-catalogos-mh";
import { useEmployeeStore } from "@/store/employee.store";
import { IEmployee } from "@/types/employee/employee.types";
import Button from "@/components/Global/components_app/Button";
import Input from "@/components/Global/components_app/Input";
import { useAuthStore } from "@/store/auth.store";
import { FC_Receptor } from "@/types/svf_dte/fc.types";
import { useCorrelativesDteStore } from "@/store/correlatives_dte.store";
import LoadingInvalidation from "../Global/LoadingInvalidation";

interface Props {
  sale: ISale | undefined;
  setModal: Dispatch<SetStateAction<boolean>>;
  setRefreshing: Dispatch<SetStateAction<boolean>>;
  setMessage: Dispatch<SetStateAction<string>>;
  setsCreenChange: Dispatch<SetStateAction<boolean>>;
}
const Invalidations = (props: Props) => {
  const { user } = useAuthStore();
  const { setModal, setRefreshing, setMessage, setsCreenChange, sale } = props;
  const [isFocus1, setIsFocus1] = useState(false);
  const [isFocus3, setIsFocus3] = useState(false);
  const [isFocus4, setIsFocus4] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const services = new SeedcodeCatalogosMhService();
  const { employee_list, OnGetEmployeesList } = useEmployeeStore();
  const [employee] = useState<IEmployee>();
  const [docResponsible, setDocResponsible] = useState("00000000-0");
  const [typeDocResponsible, setTypeDocResponsible] = useState("13");
  const { getCorrelativesByDte } = useCorrelativesDteStore();

  const [valueTypeDocument, setValueTypeDocument] =
    useState<ICat022TipoDeDocumentoDeIde>();
  const [generationCodeR, setGenerationCodeR] = useState("");
  const [valueReasonInvalidation, setValueReasonInvalidation] =
    useState<InvalidationType>();
  const [selectedMotivo, setSelectedMotivo] = useState<1 | 2 | 3>(1);

  const {
    OnGetCat022TipoDeDocumentoDeIde,
    cat_022_tipo_de_documento_de_ide,
    OnGetCat024TipoDeLaInvalidacion,
    cat_024_tipos_de_invalidacion,
  } = useBillingStore();
  const { OnGetTransmitter, transmitter } = useTransmitterStore();
  const {
    GetSaleDetails,
    recentSales,
    json_sale,
    GetRecentSales,
    is_loading_details,
  } = useSaleStore();

  useEffect(() => {
    if (sale) {
      GetSaleDetails(+sale.id);
      GetRecentSales(Number(sale?.id));
    }
    OnGetTransmitter();
    OnGetEmployeesList();
  }, [sale && sale.id]);

  const nomEstable = useMemo(() => {
    if (json_sale) {
      return services
        .get009TipoDeEstablecimiento()
        .find((item) => item.codigo === json_sale.emisor.tipoEstablecimiento);
    }
    return undefined;
  }, [json_sale]);

  const motivo = useMemo(() => {
    if (selectedMotivo) {
      return services
        .get024TipoDeInvalidacion()
        .find((item) => item.codigo === selectedMotivo.toString());
    }
    return undefined;
  }, [selectedMotivo]);

  useEffect(() => {
    OnGetCat022TipoDeDocumentoDeIde();
    OnGetCat024TipoDeLaInvalidacion();
  }, []);

  const progress = new Animated.Value(step);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: step,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [step]);

  const handleAnnulation = async (values: Invalidation) => {
    console.log(values);
    if (selectedMotivo !== 2 && generationCodeR !== "") {
      ToastAndroid.show(
        "Debes seleccionar la venta a reemplazar",
        ToastAndroid.LONG
      );
      return;
    }

    if (!motivo) {
      ToastAndroid.show(
        "Debes seleccionar el motivo de la anulación",
        ToastAndroid.LONG
      );
      return;
    }

    const correlatives = await getCorrelativesByDte(Number(user?.id), "FE")
      .then((res: any) => res)
      .catch(() => {
        ToastAndroid.show(
          "Error al obtener los correlativos",
          ToastAndroid.LONG
        );
        return;
      });

    ToastAndroid.show(
      "Enviando anulación al ministerio de hacienda",
      ToastAndroid.LONG
    );

    const tipoDte = json_sale?.identificacion.tipoDte;

    const generate: SVFE_Invalidacion_SEND = {
      nit: transmitter.nit,
      passwordPri: transmitter.clavePrivada,
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
          tipoEstablecimiento: nomEstable!.codigo,
          telefono: transmitter.telefono,
          correo: transmitter.correo,
          codEstable: correlatives?.codEstable ?? null,
          codPuntoVenta: correlatives?.codPuntoVenta ?? null,
          nomEstablecimiento: nomEstable!.valores,
        },
        documento: {
          tipoDte: json_sale!.identificacion.tipoDte,
          codigoGeneracion: json_sale!.identificacion.codigoGeneracion,
          codigoGeneracionR: [1, 3].includes(selectedMotivo)
            ? generationCodeR || null
            : null,
          selloRecibido: json_sale!.respuestaMH.selloRecibido,
          numeroControl: json_sale!.identificacion.numeroControl,
          fecEmi: json_sale!.identificacion.fecEmi,
          montoIva: Number(json_sale!.resumen.ivaPerci1),
          tipoDocumento:
            tipoDte === "01"
              ? (json_sale!.receptor as unknown as FC_Receptor).tipoDocumento
              : "36",
          numDocumento:
            tipoDte === "01"
              ? (json_sale!.receptor as unknown as FC_Receptor).numDocumento
              : json_sale!.receptor.nit,
          nombre: json_sale!.receptor.nombre,
        },
        motivo: {
          tipoAnulacion: Number(valueReasonInvalidation?.codigo),
          motivoAnulacion: valueReasonInvalidation?.valores ?? "",
          nombreResponsable: values.nameResponsible,
          tipDocResponsable: values.typeDocResponsible,
          numDocResponsable: values.docNumberApplicant,
          nombreSolicita: values.nameApplicant,
          tipDocSolicita: values.typeDocApplicant,
          numDocSolicita: values.docNumberApplicant,
        },
      },
    };
    setLoading(true);
    firmarDocumentoInvalidacion(generate).then(async (firma) => {
      setStep(1);
      console.log(JSON.stringify(generate, null, 2));

      const token_mh = await return_token_mh();
      console.log("Token mh", token_mh);

      if (token_mh) {
        const source = axios.CancelToken.source();
        const timeout = setTimeout(() => {
          source.cancel("El tiempo de espera ha expirado");
        }, 25000);

        send_to_mh_invalidation(
          {
            ambiente,
            version: version,
            idEnvio: 1,
            documento: firma.data.body,
          },
          token_mh,
          source
        )
          .then((res) => {
            setStep(2);
            clearTimeout(timeout);

            axios
              .patch(API_URL + `/sales/invalidate/${sale?.id}`, {
                selloInvalidacion: res.data.selloRecibido,
              })
              .then(() => {
                ToastAndroid.show(
                  "Invalidado correctamente",
                  ToastAndroid.LONG
                );
                setLoading(false);
                setStep(0);
                setModal(false);
              })
              .catch(() => {
                ToastAndroid.show(
                  "Error al actualizar la nota de crédito",
                  ToastAndroid.LONG
                );
              });
          })
          .catch((error) => {
            clearTimeout(timeout);
            setLoading(false);
            setStep(0);

            console.log(
              "Detalles completos del error:",
              JSON.stringify(error.response.data, null, 2)
            );

            if (axios.isAxiosError(error) && error.response) {
              const errorMessage =
                error.response.data.observaciones?.length > 0
                  ? error.response.data.observaciones.join("\n\n")
                  : "Error desconocido";
              setLoading(false);
              setStep(0);

              ToastAndroid.show(
                error.response.data.descripcionMsg ??
                  "Error al procesar la anulación",
                ToastAndroid.LONG
              );
            } else {
              setLoading(false);
              setStep(0);
              ToastAndroid.show(
                "Fallo al enviar la anulación al Ministerio de Hacienda",
                ToastAndroid.LONG
              );
            }
          });
      }
    });
  };

  return (
    <>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.container} behavior="height">
        {is_loading_details && (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#16a34a" />
          </View>
        )}
        {loading && <LoadingInvalidation step={step} />}

        {!is_loading_details && json_sale && !loading && (
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

            <View
              style={{
                width: "100%",
                display: "flex",
                marginTop: 5,
              }}
            >
              <Text style={styles.textInput}>
                Fecha de emisión {json_sale?.identificacion.fecEmi}
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

              <Text style={styles.textInput}>
                Hora emisión {json_sale?.identificacion.horEmi}
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

              <Text style={styles.textInput}>
                Código de generación{" "}
                {json_sale?.identificacion.codigoGeneracion}
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

              <Text style={styles.textInput}>
                Numero de control {json_sale?.identificacion.numeroControl}
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
            </View>

            <View
              style={{
                width: "100%",
                display: "flex",
                marginTop: 10,
              }}
            >
              <Text style={styles.textInput}>Motivo de la invalidación</Text>
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
                    // handleChange(event);
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
                    placeholder={!isFocus4 ? "Selecciona un item " : "..."}
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
                      // handleChange(event);
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

            <Formik
              onSubmit={handleAnnulation}
              // validationSchema={validationsSchema}
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
                    <Text style={{ marginTop: 10, fontWeight: "bold" }}>
                      Responsable
                    </Text>

                    <View
                      style={{
                        width: "100%",
                        borderWidth: 1,
                        borderColor: "#D1D5DB",
                        borderRadius: 15,
                        padding: 12,
                      }}
                    >
                      <Text style={styles.textInput}>Nombre</Text>
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
                          data={employee_list}
                          itemTextStyle={{
                            fontSize: 16,
                          }}
                          search
                          maxHeight={250}
                          labelField="fullName"
                          valueField="id"
                          placeholder={
                            !isFocus1 ? "Selecciona un item " : "..."
                          }
                          searchPlaceholder="Escribe para buscar..."
                          value={employee}
                          onFocus={() => setIsFocus1(true)}
                          onBlur={() => setIsFocus1(false)}
                          onChange={(item) => {
                            if (!item) {
                              setDocResponsible("");
                              setTypeDocResponsible("");
                            } else {
                              setDocResponsible(item.numDocument);
                              setTypeDocResponsible(item.typeDocument);
                              handleChange("nameResponsible")(item.fullName);
                              handleChange("docNumberResponsible")(
                                item.numDocument
                              );
                              handleChange("typeDocResponsible")(
                                item.typeDocument
                              );
                            }
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

                      <Text style={styles.textInput}>Tipo de documento</Text>
                      <Input
                        values={
                          services
                            .get022TipoDeDocumentoDeIde()
                            .find((doc) => doc.codigo === typeDocResponsible)
                            ?.valores
                        }
                        icon="card-account-details-outline"
                      />

                      <Text style={styles.textInput}>Numero de documento</Text>
                      <Input
                        placeholder=""
                        values={docResponsible}
                        icon="card-bulleted-outline"
                      />
                    </View>

                    <Text style={{ marginTop: 10, fontWeight: "bold" }}>
                      Solicitante
                    </Text>

                    <View
                      style={{
                        width: "100%",
                        borderWidth: 1,
                        borderColor: "#D1D5DB",
                        borderRadius: 15,
                        padding: 12,
                      }}
                    >
                      <Text style={styles.textInput}>
                        Nombre de solicitante
                      </Text>
                      <Input
                        handleBlur={handleBlur("nameApplicant")}
                        onChangeText={handleChange("nameApplicant")}
                        values={values.nameApplicant}
                        icon={"account"}
                        placeholder="Juan Perez"
                      />

                      <Text style={styles.textInput}>
                        Tipo de documento de identificación
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
                          placeholder={
                            !isFocus1 ? "Selecciona un item " : "..."
                          }
                          searchPlaceholder="Escribe para..."
                          value={valueTypeDocument}
                          onFocus={() => setIsFocus1(true)}
                          onBlur={() => setIsFocus1(false)}
                          onChange={(item) => {
                            setIsFocus1(false);
                            setValueTypeDocument(item);
                            handleChange("typeDocApplicant");
                            handleChange("typeDocApplicant")(item.codigo);
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

                      <Text style={styles.textInput}>Numero de documento</Text>
                      <Input
                        handleBlur={handleBlur("docNumberApplicant")}
                        onChangeText={handleChange("docNumberApplicant")}
                        values={values.docNumberApplicant}
                        icon={"account"}
                        placeholder="0000000"
                      />
                    </View>
                  </View>

                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 36,
                    }}
                  >
                    <Button
                      withB={390}
                      onPress={() => handleSubmit()}
                      Title="Invalidar"
                      // color={theme.colors.dark}
                    />
                  </View>
                </ScrollView>
              )}
            </Formik>
          </>
        )}
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
