import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";
import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Dropdown } from "react-native-element-dropdown";
import { useBillingStore } from "@/store/billing/billing.store";
import { ITiposDeContingencia } from "@/types/billing/cat-005-tipos-de-contigencia.types";
import { AntDesign } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DatePickerModal } from "react-native-paper-dates";
import {
  formatDate,
  getElSalvadorDateTimeParam,
  returnDate,
} from "@/utils/date";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { return_token_mh } from "@/plugins/secure_store";
import { get_user } from "@/plugins/async_storage";
import { get_find_by_correlative } from "@/services/point_of_sale.service";
import { ContingencySalesGenerator } from "@/plugins/DTE/ContingencySalesGenerator";
import { useTransmitterStore } from "@/store/transmitter.store";
import {
  firmarDocumentoContingencia,
  send_to_mh_contingencia,
} from "@/services/ministry_of_finance.service";
import axios, { AxiosError } from "axios";
import { useSaleStore } from "@/store/sale.store";
import { showAlertAndWait } from "@/plugins/DTE/make_generator/make-dte";
import { SendMHFailed } from "@/types/svf_dte/responseMH/responseMH.types";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import { useEmployeeStore } from "@/store/employee.store";
import { IEmployee } from "@/types/employee/employee.types";
import Input from "@/components/Global/components_app/Input";
import Button from "@/components/Global/components_app/Button";
import { ThemeContext } from "@/hooks/useTheme";

const ElectronicDTEContingency = ({
  setModalContingency,
}: {
  setModalContingency: Dispatch<SetStateAction<boolean>>;
}) => {
  const [isFocus, setIsFocus] = useState(false);
  const [typeConting, setTypeConting] = useState<ITiposDeContingencia>({
    codigo: "2",
    id: 2,
    isActivated: true,
    valores: "No disponibilidad de sistema del emisor",
  });
  const { OnImgPDF, img_invalidation, img_logo, contingence_sales } =
    useSaleStore();
  const [contingReason, setContingReason] = useState("");
  const [startDate, setStartDate] = useState(formatDate());
  const [time, setTime] = useState(contingence_sales[0]?.horEmi);
  const [showCalendarStart, setShowCalendarStart] = useState(false);
  const [showCalendarEnd, setShowCalendarEnd] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [screenChange, setsCreenChange] = useState(false);
  const [message, setMessage] = useState("Esperando");
  const [isFocusEmp, setIsFocusEmp] = useState(false);
  const [employee, setEmployee] = useState<IEmployee>();
  const { theme } = useContext(ThemeContext);
  const [endDate, setEndDate] = useState(formatDate());
  const [endTime, setEndTime] = useState(
    contingence_sales[contingence_sales.length - 1]?.horEmi
  );
  const { cat_005_tipo_de_contingencia, OnGetCat005TipoDeContingencia } =
    useBillingStore();
  const { OnGetTransmitter, transmitter } = useTransmitterStore();
  const { OnPressAllSalesConting } = useSaleStore();
  const { employee_list, OnGetEmployeesList } = useEmployeeStore();

  const timeStart = useMemo(() => {
    if (contingence_sales.length > 0) {
      setTime(contingence_sales[0]?.horEmi);
      return contingence_sales[0]?.horEmi;
    }
    return "";
  }, [contingence_sales]);

  const timeEnd = useMemo(() => {
    if (contingence_sales.length > 0) {
      setEndTime(contingence_sales[contingence_sales.length - 1]?.horEmi);
      return contingence_sales[contingence_sales.length - 1]?.horEmi;
    }
    return "";
  }, [contingence_sales]);

  const handleConfirmTime = (date: Date) => {
    setTime(getElSalvadorDateTimeParam(date).horEmi);
    setTimePickerVisibility(false);
  };

  useEffect(() => {
    OnGetCat005TipoDeContingencia();
    OnGetEmployeesList();
    OnGetTransmitter();
  }, []);

  const handleContingencySubtraction = async () => {
    const token_mh = await return_token_mh();
    const user = await get_user();
    if (!user) {
      ToastAndroid.show("No se encontró el usuario", ToastAndroid.SHORT);
      return;
    }
    const correlatives = await get_find_by_correlative(user.id, "FE");
    if (!correlatives.data.correlativo) {
      ToastAndroid.show("No se encontraron correlativos", ToastAndroid.SHORT);
      return;
    }
    if (!employee) {
      ToastAndroid.show("No se encontró al responsable", ToastAndroid.SHORT);
      return;
    }
    setsCreenChange(true);

    const correlativesDTE = contingence_sales.map((sale, index) => ({
      noItem: index + 1,
      codigoGeneracion: sale.codigoGeneracion,
      tipoDoc: sale.tipoDte,
    }));

    const generateContingency = ContingencySalesGenerator(
      transmitter,
      startDate,
      time,
      endDate,
      endTime,
      Number(typeConting?.codigo),
      contingReason,
      correlativesDTE,
      correlatives.data.correlativo,
      employee
    );
    firmarDocumentoContingencia(generateContingency)
      .then(async(result) => {
        const send = {
          nit: transmitter.nit,
          documento: result.data.body,
        };
        const source = axios.CancelToken.source();
        const timeout = setTimeout(() => {
          source.cancel("El tiempo de espera ha expirado");
        }, 25000);

        Promise.race([
          await send_to_mh_contingencia(send, token_mh ?? "", source).then(
            async (resspon) => {
              clearTimeout(timeout);
              if (resspon.data.estado === "RECHAZADO") {
                Alert.alert(
                  resspon?.data.descripcionMsg
                    ? resspon?.data.descripcionMsg
                    : "El Ministerio de Hacienda no pudo procesar la solicitud",
                  resspon.data.observaciones &&
                    resspon.data.observaciones.length > 0
                    ? resspon?.data.observaciones.join("\n\n")
                    : ""
                );
                setsCreenChange(false);
              }
              if (resspon.data.estado === "RECIBIDO") {
                const promises = contingence_sales.map((sale, index) =>
                  OnPressAllSalesConting(
                    transmitter,
                    sale.tipoDte,
                    sale.pathJson,
                    String(token_mh)
                  ).then(async (response) => {
                    if (response?.isErrorMh) {
                      await showAlertAndWait(response.title, response.message);
                      return true;
                    } else {
                      await showAlertAndWait(
                        response?.title
                          ? response.title
                          : "Ocurrió un error inesperado",
                        response?.message
                          ? response.title
                          : "Inténtelo mas tarde o contacta al equipo de soporte"
                      );
                    }
                  })
                );
                await Promise.all(promises).then(() => {
                  setsCreenChange(false);
                  ToastAndroid.show(
                    "Procesamiento finalizado",
                    ToastAndroid.SHORT
                  );
                });
              } else {
                setsCreenChange(false);
                ToastAndroid.show(
                  "Hacienda no respondió con el sello",
                  ToastAndroid.LONG
                );
              }
            }
          ),
          new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error("El tiempo de espera ha expirado"));
              setsCreenChange(false);
            }, 25000);
          }),
        ]).catch((error: AxiosError<SendMHFailed>) => {
          clearTimeout(timeout);
          setsCreenChange(false);
          if (error.response?.status === 401) {
            ToastAndroid.show(
              "No tienes los accesos necesarios",
              ToastAndroid.SHORT
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
                  : ""
              );
              setsCreenChange(false);
              return;
            } else {
              ToastAndroid.show(
                "No tienes los accesos necesarios",
                ToastAndroid.SHORT
              );
              setsCreenChange(false);
              return;
            }
          }
        });
      })
      .catch(() => {
        ToastAndroid.show(
          "Error al firmar el documento de contingencia",
          ToastAndroid.SHORT
        );
        setsCreenChange(false);
      });
  };
  return (
    <>
      {screenChange ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size={"large"} />
          <Text
            style={{
              fontSize: 18,
              marginTop: 12,
            }}
          >
            {message}
          </Text>
        </View>
      ) : (
        <>
          <View
            style={{
              borderRadius: 25,
              width: "100%",
              top: -5,
              height: 130,
              backgroundColor: theme.colors.third,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Pressable
              style={{
                position: "absolute",
                right: 20,
                top: 20,
              }}
            >
              <MaterialCommunityIcons
                color={"white"}
                name="close"
                size={30}
                onPress={() => {
                  setModalContingency(false);
                }}
              />
            </Pressable>
            <Text style={{ fontSize: 20, top: 15, color: "white" }}>
              Nuevo evento de contingencia
            </Text>
          </View>
          <SafeAreaView style={stylesGlobals.safeAreaViewStyle}>
            <ScrollView>
              <View style={{ width: "100%", marginTop: 20 }}>
                <Text style={stylesGlobals.textInput}>
                  Motivo
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#ef4444",
                      fontWeight: "700",
                    }}
                  >
                    *
                  </Text>
                </Text>
                <SafeAreaView
                  style={{
                    width: "100%",
                    borderWidth: 1,
                    borderColor: "#D1D5DB",
                    padding: 12,
                    borderRadius: 15,
                  }}
                >
                  <Dropdown
                    style={[isFocus && { borderColor: "blue" }]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={cat_005_tipo_de_contingencia}
                    itemTextStyle={{
                      fontSize: 16,
                    }}
                    search
                    maxHeight={250}
                    labelField="valores"
                    valueField="id"
                    placeholder={!isFocus ? "Selecciona un item " : "..."}
                    searchPlaceholder="Escribe para buscar..."
                    value={typeConting}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={(item) => {
                      setTypeConting(item);
                      setIsFocus(false);
                    }}
                    renderLeftIcon={() => (
                      <AntDesign
                        style={{ marginRight: 5 }}
                        color={isFocus ? "green" : "black"}
                        name="Safety"
                        size={20}
                      />
                    )}
                  />
                </SafeAreaView>
              </View>
              <View style={{ width: "100%", marginTop: 20 }}>
                <Text style={stylesGlobals.textInput}>Responsable</Text>
                <SafeAreaView
                  style={{
                    width: "100%",
                    borderWidth: 1,
                    borderColor: "#D1D5DB",
                    padding: 12,
                    borderRadius: 15,
                  }}
                >
                  <Dropdown
                    style={[isFocusEmp && { borderColor: "blue" }]}
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
                    placeholder={!isFocusEmp ? "Selecciona un item " : "..."}
                    searchPlaceholder="Escribe para buscar..."
                    value={employee}
                    onFocus={() => setIsFocusEmp(true)}
                    onBlur={() => setIsFocusEmp(false)}
                    onChange={(item) => {
                      setEmployee(item);
                      setIsFocusEmp(false);
                    }}
                    renderLeftIcon={() => (
                      <AntDesign
                        style={styles.icon}
                        color={isFocusEmp ? "blue" : "black"}
                        name="Safety"
                        size={20}
                      />
                    )}
                  />
                </SafeAreaView>
              </View>
              <View style={{ marginTop: 20 }}>
                <Text style={stylesGlobals.textInput}>
                  Información adicional
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#ef4444",
                      fontWeight: "700",
                    }}
                  >
                    *
                  </Text>
                </Text>
                <TextInput
                  editable
                  multiline
                  numberOfLines={3}
                  placeholder={`Ingresa tus observaciones e información adicional`}
                  onChangeText={(text) => {
                    setContingReason(text);
                  }}
                  style={{
                    padding: 10,
                    borderRadius: 15,
                    borderColor: "#D9D9DA",
                    borderWidth: 1,
                    color: "black",
                  }}
                />
              </View>
              <View style={{ flexDirection: "row", width: "100%", gap: 30 }}>
                <View style={{ marginTop: 20, width: "45%" }}>
                  <Text style={stylesGlobals.textInput}>
                    Fecha de Inicio
                    <Text
                      style={{
                        fontSize: 16,
                        color: "#ef4444",
                        fontWeight: "700",
                      }}
                    >
                      *
                    </Text>
                  </Text>
                  <Input
                    keyboardType="numeric"
                    placeholder="0.0"
                    defaultValue={startDate}
                    onPress={() => setShowCalendarStart(true)}
                    icon="calendar-edit"
                    aria-labelledbyledBy="inputLabel"
                  />
                  <DatePickerModal
                    locale="es"
                    mode="single"
                    date={new Date()}
                    visible={showCalendarStart}
                    onConfirm={({ date }) => {
                      setShowCalendarStart(false);
                      if (date) {
                        setStartDate(returnDate(date));
                      }
                    }}
                    onDismiss={() => setShowCalendarStart(false)}
                  />
                </View>
                <View style={{ marginTop: 20, width: "45%" }}>
                  <Text style={stylesGlobals.textInput}>
                    Hora de Inicio
                    <Text
                      style={{
                        fontSize: 16,
                        color: "#ef4444",
                        fontWeight: "700",
                      }}
                    >
                      *
                    </Text>
                  </Text>
                  <Input
                    showSoftInputOnFocus={false}
                    caretHidden={true}
                    keyboardType="numeric"
                    placeholder="0.0"
                    defaultValue={timeStart}
                    // onPress={() => setTimePickerVisibility(true)}
                    icon="calendar-edit"
                    aria-labelledbyledBy="inputLabel"
                  />
                  <DateTimePickerModal
                    isVisible={isTimePickerVisible}
                    mode="time"
                    onConfirm={handleConfirmTime}
                    onCancel={() => setTimePickerVisibility(false)}
                  />
                </View>
              </View>
              <View style={{ flexDirection: "row", width: "100%", gap: 30 }}>
                <View style={{ marginTop: 20, width: "45%" }}>
                  <Text style={stylesGlobals.textInput}>
                    Fecha de Fin
                    <Text
                      style={{
                        fontSize: 16,
                        color: "#ef4444",
                        fontWeight: "700",
                      }}
                    >
                      *
                    </Text>
                  </Text>
                  <Input
                    keyboardType="numeric"
                    placeholder="0.0"
                    defaultValue={endDate}
                    onPress={() => setShowCalendarStart(true)}
                    icon="calendar-edit"
                    aria-labelledbyledBy="inputLabel"
                  />
                  <DatePickerModal
                    locale="es"
                    mode="single"
                    date={new Date()}
                    visible={showCalendarEnd}
                    onConfirm={({ date }) => {
                      setShowCalendarEnd(false);
                      if (date) {
                        setEndDate(returnDate(date));
                      }
                    }}
                    onDismiss={() => setShowCalendarEnd(false)}
                  />
                </View>
                <View style={{ marginTop: 20, width: "45%" }}>
                  <Text style={stylesGlobals.textInput}>
                    Hora de Fin
                    <Text
                      style={{
                        fontSize: 16,
                        color: "#ef4444",
                        fontWeight: "700",
                      }}
                    >
                      *
                    </Text>
                  </Text>
                  <Input
                    showSoftInputOnFocus={false}
                    caretHidden={true}
                    keyboardType="numeric"
                    placeholder="0.0"
                    defaultValue={timeEnd}
                    // onPress={() => setTimePickerVisibility(true)}
                    icon="calendar-edit"
                    aria-labelledbyledBy="inputLabel"
                  />
                  <DateTimePickerModal
                    isVisible={isTimePickerVisible}
                    mode="time"
                    onConfirm={handleConfirmTime}
                    onCancel={() => setTimePickerVisibility(false)}
                  />
                </View>
              </View>
              <View
                style={{
                  ...stylesGlobals.viewBotton,
                  marginBottom: 20,
                  marginTop: 20,
                }}
              >
                <Button
                  withB={390}
                  onPress={() => handleContingencySubtraction()}
                  Title="Filtrar"
                  color={theme.colors.third}
                />
              </View>
            </ScrollView>
          </SafeAreaView>
        </>
      )}
    </>
  );
};

export default ElectronicDTEContingency;

const styles = StyleSheet.create({
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
  inputWrapper: {
    position: "relative",
    width: "100%",
    height: 50,
    justifyContent: "center",
    marginBottom: 15,
  },
  icon: {
    marginRight: 5,
  },
  input: {
    height: "100%",
    paddingLeft: 15,
    borderColor: "#D9D9DA",
    borderWidth: 1,
    borderRadius: 15,
    fontSize: 16,
  },
});
