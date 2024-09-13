import {
  ActivityIndicator,
  Alert,
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
  useMemo,
  useState,
} from "react";
import { AntDesign } from "@expo/vector-icons";
//   import { Button } from "@/~/components/ui/button";
import DateTimePickerModal from "react-native-modal-datetime-picker";
//   import { Input } from "@/~/components/ui/input";
//   import { Textarea } from "@/~/components/ui/textarea";
import {
  formatDate,
  getElSalvadorDateTimeParam,
  returnDate,
} from "@/utils/date";
import { DatePickerModal } from "react-native-paper-dates";
import { Dropdown } from "react-native-element-dropdown";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useBillingStore } from "@/store/billing/billing.store";
import { ITiposDeContingencia } from "@/types/billing/cat-005-tipos-de-contigencia.types";
import { return_token_mh } from "@/plugins/secure_store";
import { return_token } from "@/plugins/async_storage";
import { Sale } from "@/offline/entity/sale.entity";
import { generate_uuid } from "@/plugins/random/random";
import { ContingencySalesGenerator } from "@/plugins/DTE/ContingencySalesGenerator";
import { ITransmitter } from "@/types/transmitter/transmiter.types";
import {
  firmarDocumentoContingencia,
  send_to_mh_contingencia,
} from "@/services/ministry_of_finance.service";
import axios, { AxiosError } from "axios";
import { useSalesOfflineStore } from "@/offline/store/sale_offline.store";
import { showAlertAndWait } from "@/plugins/DTE/make_generator/make-dte";
import { SendMHFailed } from "@/types/svf_dte/responseMH/responseMH.types";
import { get_box_data, get_user } from "@/plugins/async_storage";
import { usePointOfSaleStore } from "@/store/point_of_sale.store";
import { useEmployeeStore } from "@/store/employee.store";
import { IEmployee } from "@/types/employee/employee.types";
import Button from "@/components/Global/components_app/Button";
import { ThemeContext } from "@/hooks/useTheme";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import Input from "@/components/Global/components_app/Input";

const ComplementSale = ({
  isProcessing,
  setIsProcessing,
  processed_sales,
  transmitter,
  UpdatePagingProcess,
}: {
  isProcessing: boolean;
  setIsProcessing: Dispatch<SetStateAction<boolean>>;
  UpdatePagingProcess: () => void;
  processed_sales: Sale[];
  transmitter: ITransmitter;
}) => {
  const [isFocus, setIsFocus] = useState(false);
  const [showCalendarEnd, setShowCalendarEnd] = useState(false);
  const [isFocusE, setIsFocusE] = useState(false);
  const [contingReason, setContingReason] = useState("");
  const [startDate, setStartDate] = useState(formatDate());
  const [time, setTime] = useState(processed_sales[0]?.horEmi);
  const [endDate, setEndDate] = useState(formatDate());
  const [endTime, setEndTime] = useState(
    processed_sales[processed_sales.length - 1]?.horEmi
  );
  const [employee, setEmployee] = useState<IEmployee>();
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [typeConting, setTypeConting] = useState<ITiposDeContingencia>({
    codigo: "3",
    id: 3,
    isActivated: true,
    valores: "Falla en el suministro de servicio de Internet del Emisor",
  });
  const [showCalendarStart, setShowCalendarStart] = useState(false);
  const { OnGetCorrelativesByDte } = usePointOfSaleStore();
  const { employee_list } = useEmployeeStore();
  const { theme } = useContext(ThemeContext);
  const { OnPressAllSalesConting, OnGetSalesOfflinePagination } =
    useSalesOfflineStore();
  const { cat_005_tipo_de_contingencia } = useBillingStore();
  const timeStart = useMemo(() => {
    if (processed_sales.length > 0) {
      setTime(processed_sales[0]?.horEmi);
      return processed_sales[0]?.horEmi;
    }
    return "";
  }, [processed_sales]);

  const timeEnd = useMemo(() => {
    if (processed_sales.length > 0) {
      setEndTime(processed_sales[processed_sales.length - 1]?.horEmi);
      return processed_sales[processed_sales.length - 1]?.horEmi;
    }
    return "";
  }, [processed_sales]);
  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };
  const handleConfirmTime = (date: Date) => {
    setTime(returnDate(date));
    hideTimePicker();
  };
  const handleReset = () => {
    setTypeConting({
      codigo: "3",
      id: 3,
      isActivated: true,
      valores: "Falla en el suministro de servicio de Internet del Emisor",
    });
    setContingReason("");
  };

  const handle_process_all_sales = async () => {
    const user = await get_user();
    if (!user) {
      ToastAndroid.show("No se encontró el usuario", ToastAndroid.LONG);
      return;
    }
    if (!employee) {
      ToastAndroid.show("Seleccionar al responsable", ToastAndroid.LONG);
      return;
    }
    if (!typeConting) {
      ToastAndroid.show("Debes rellenar la inf. adicional", ToastAndroid.LONG);
      return;
    }
    if (!typeConting) {
      ToastAndroid.show("No se encontró el usuario", ToastAndroid.LONG);
      return;
    }
    // const correlatives = await get_find_by_correlative(user.id, "F");
    const correlatives = await OnGetCorrelativesByDte(user.id, "FE");

    if (!correlatives) {
      ToastAndroid.show("No se encontraron correlativos", ToastAndroid.LONG);
      return;
    }
    const token = await return_token();
    if (!token) {
      ToastAndroid.show("No tienes los accesos necesarios", ToastAndroid.LONG);
      return;
    }

    setIsProcessing(true);
    ToastAndroid.show("Procesando ventas", ToastAndroid.SHORT);
    const token_mh = await return_token_mh();
    const infoSales = processed_sales.map((sale, index) => {
      return {
        noItem: index + 1,
        codigoGeneracion: generate_uuid().toUpperCase(),
        tipoDoc: sale.tipoDte,
      };
    });
    const generateContingency = ContingencySalesGenerator(
      transmitter,
      startDate,
      time,
      endDate,
      endTime,
      Number(typeConting?.codigo),
      contingReason,
      infoSales,
      correlatives,
      employee
    );
    firmarDocumentoContingencia(generateContingency)
      .then((result) => {
        const send = {
          nit: transmitter.nit,
          documento: result.data.body,
        };
        const source = axios.CancelToken.source();
        const timeout = setTimeout(() => {
          source.cancel("El tiempo de espera ha expirado");
          setIsProcessing(false);
        }, 25000);

        Promise.race([
          send_to_mh_contingencia(send, token_mh ?? "", source).then(
            async (respond) => {
              if (respond.data.estado === "RECHAZADO") {
                Alert.alert(
                  respond?.data.descripcionMsg
                    ? respond?.data.descripcionMsg
                    : "El Ministerio de Hacienda no pudo procesar la solicitud",
                  respond.data.observaciones &&
                    respond.data.observaciones.length > 0
                    ? respond?.data.observaciones.join("\n\n")
                    : "El ministerio de hacienda no tiene observaciones para el DTE"
                );
                clearTimeout(timeout);
              }
              if (respond.data.estado === "RECIBIDO") {
                console.log("a venta");
                clearTimeout(timeout);
                const promises = processed_sales.map(async (sale, index) => {
                  if (sale.tipoDte) {
                    const correlativeF = await OnGetCorrelativesByDte(
                      user.id,
                      "FE"
                    );
                    if (!correlativeF) {
                      ToastAndroid.show(
                        "No tienes correlativos",
                        ToastAndroid.LONG
                      );
                      return;
                    }

                    try {
                      const result = await OnPressAllSalesConting(
                        sale,
                        infoSales[index].codigoGeneracion,
                        String(token_mh),
                        employee.id,
                        correlativeF,
                        token
                      ).then(async (result) => {
                        if (result?.isErrorMh) {
                          await showAlertAndWait(result.title, result.message);
                          return true;
                        } else {
                          ToastAndroid.show(
                            result!.message,
                            ToastAndroid.SHORT
                          );
                          return false;
                        }
                      });
                      return result;
                    } catch (error) {
                      ToastAndroid.show(
                        "Error al procesar la venta",
                        ToastAndroid.SHORT
                      );
                      return false;
                    }
                  } else {
                    const correlativeCCF = await OnGetCorrelativesByDte(
                      user.id,
                      "CCFE"
                    );
                    if (!correlativeCCF) {
                      ToastAndroid.show(
                        "No tienes correlativos",
                        ToastAndroid.LONG
                      );
                      return;
                    }

                    try {
                      const result = await OnPressAllSalesConting(
                        sale,
                        infoSales[index].codigoGeneracion,
                        String(token_mh),
                        employee.id,
                        correlativeCCF,
                        token
                      ).then(async (result) => {
                        if (result?.isErrorMh) {
                          await showAlertAndWait(result.title, result.message);
                          return true;
                        } else {
                          ToastAndroid.show(
                            result!.message,
                            ToastAndroid.SHORT
                          );
                          return false;
                        }
                      });
                      return result;
                    } catch (error) {
                      ToastAndroid.show(
                        "Error al procesar la venta",
                        ToastAndroid.SHORT
                      );
                      return false;
                    }
                  }
                });
                await Promise.all(promises).then(() => {
                  UpdatePagingProcess();
                  ToastAndroid.show(
                    "Procesamiento finalizado",
                    ToastAndroid.SHORT
                  );
                });
              } else {
                UpdatePagingProcess();
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
            }, 25000);
          }),
        ]).catch((error: AxiosError<SendMHFailed>) => {
          clearTimeout(timeout);
          if (error.response?.status === 401) {
            ToastAndroid.show(
              "No tienes los accesos necesarios",
              ToastAndroid.SHORT
            );
            return;
          } else {
            //////-----------------------
            if (error.response?.data) {
              Alert.alert(
                error.response?.data.descripcionMsg,
                error.response.data.observaciones &&
                  error.response.data.observaciones.length > 0
                  ? error.response?.data.observaciones.join("\n\n")
                  : ""
              );
              return;
            } else {
              ToastAndroid.show(
                "No tienes los accesos necesarios",
                ToastAndroid.SHORT
              );
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
      });
  };
  return (
    <>
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
                style={[isFocusE && { borderColor: "blue" }]}
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
                placeholder={!isFocusE ? "Selecciona un item " : "..."}
                searchPlaceholder="Escribe para buscar..."
                value={employee}
                onFocus={() => setIsFocusE(true)}
                onBlur={() => setIsFocusE(false)}
                onChange={(item) => {
                  setEmployee(item);
                  setIsFocusE(false);
                }}
                renderLeftIcon={() => (
                  <AntDesign
                    style={styles.icon}
                    color={isFocusE ? "blue" : "black"}
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
        </ScrollView>
        {isProcessing ? (
          <View
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              marginTop: 40,
            }}
          >
            <ActivityIndicator size="large"></ActivityIndicator>
            <Text>Sincronizando...</Text>
          </View>
        ) : (
          <>
            <View
              style={{
                ...stylesGlobals.viewBotton,
                marginBottom: 20,
                marginTop: 20,
              }}
            >
              <Button
                withB={390}
                onPress={() => handle_process_all_sales()}
                Title="Enviar"
                color={theme.colors.third}
              />
            </View>
          </>
        )}
      </SafeAreaView>
    </>
  );
};

export default ComplementSale;

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
  input: {
    height: "100%",
    paddingLeft: 15,
    borderColor: "#D9D9DA",
    borderWidth: 1,
    borderRadius: 15,
    fontSize: 16,
  },
  inputWrapper: {
    position: "relative",
    width: "100%",
    height: 50,
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  icon: {
    marginRight: 20,
  },
});
