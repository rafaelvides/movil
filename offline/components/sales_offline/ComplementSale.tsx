import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    ToastAndroid,
    View,
  } from "react-native";
  import React, { Dispatch, SetStateAction, useState } from "react";
  import { AntDesign } from "@expo/vector-icons";
//   import { Button } from "@/~/components/ui/button";
  import DateTimePickerModal from "react-native-modal-datetime-picker";
//   import { Input } from "@/~/components/ui/input";
//   import { Textarea } from "@/~/components/ui/textarea";
  import { getElSalvadorDateTimeParam } from "@/utils/date";
  import { DatePickerModal } from "react-native-paper-dates";
  import { Dropdown } from "react-native-element-dropdown";
  import { MaterialCommunityIcons } from "@expo/vector-icons";
  import { useBillingStore } from "@/store/billing/billing.store";
  import { ITiposDeContingencia } from "@/types/billing/cat-005-tipos-de-contigencia.types";
  import { return_token, return_token_mh } from "@/plugins/secure_store";
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
    const [isFocusE, setIsFocusE] = useState(false);
    const [contingReason, setContingReason] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [employee, setEmployee] = useState<IEmployee>();
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
    const [typeConting, setTypeConting] = useState<ITiposDeContingencia>();
    const [showCalendarStart, setShowCalendarStart] = useState(false);
    const { OnGetCorrelativesByDte } = usePointOfSaleStore();
    const { employee_list } = useEmployeeStore();
  
    const { OnPressAllSalesConting, OnGetSalesOfflinePagination } =
      useSalesOfflineStore();
    const { cat_005_tipo_de_contingencia } = useBillingStore();
  
    const hideTimePicker = () => {
      setTimePickerVisibility(false);
    };
    const handleConfirmTime = (date: Date) => {
      setTime(date);
      hideTimePicker();
    };
    const handleReset = () => {
      setTypeConting(undefined);
      setContingReason("");
      setStartDate(new Date());
      setTime(new Date());
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
      const correlatives = await OnGetCorrelativesByDte(user.id, "F");
  
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
      let currentOperation = Promise.resolve<boolean | void>(false);
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
            send_to_mh_contingencia(send, token_mh ?? "").then((respond) => {
              if (respond.data.estado === "RECHAZADO") {
                Alert.alert(
                  respond?.data.descripcionMsg,
                  respond.data.observaciones &&
                    respond.data.observaciones.length > 0
                    ? respond?.data.observaciones.join("\n\n")
                    : ""
                );
                clearTimeout(timeout);
              } else {
                clearTimeout(timeout);
                processed_sales.map(async (sale, index) => {
                  if (sale.tipoDte) {
                    const correlativeF = await OnGetCorrelativesByDte(
                      user.id,
                      "F"
                    );
                    if (!correlativeF) {
                      ToastAndroid.show(
                        "No tienes correlativos",
                        ToastAndroid.LONG
                      );
                      return;
                    }
                    currentOperation = currentOperation
                      .then(async () => {
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
                              await showAlertAndWait(
                                result.title,
                                result.message
                              );
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
                      })
                      .catch(() => {
                        return false;
                      });
                  } else {
                    const correlativeCCF = await OnGetCorrelativesByDte(
                      user.id,
                      "CCF"
                    );
                    if (!correlativeCCF) {
                      ToastAndroid.show(
                        "No tienes correlativos",
                        ToastAndroid.LONG
                      );
                      return;
                    }
                    currentOperation = currentOperation
                      .then(async () => {
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
                              await showAlertAndWait(
                                result.title,
                                result.message
                              );
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
                      })
                      .catch(() => {
                        return false;
                      });
                  }
                });
                currentOperation.then(async () => {
                  UpdatePagingProcess();
                  ToastAndroid.show(
                    "Procesamiento finalizado",
                    ToastAndroid.SHORT
                  );
                  handleReset();
                });
              }
            }),
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
        <View
          style={{
            paddingHorizontal: 20,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              marginTop: 10,
              fontWeight: "400",
            }}
          >
            Nuevo evento de contingencia
          </Text>
  
          <View style={{ width: "100%", marginTop: 10 }}>
            <Text
              style={{
                fontSize: 16,
                marginTop: 25,
                fontWeight: "400",
                marginLeft: "3%",
              }}
            >
              Motivo de contingencia
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
                marginTop: 10,
                borderWidth: 1,
                borderColor: "#D1D5DB",
                padding: 14,
                borderRadius: 16,
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
          <View style={{ width: "100%", marginTop: 10 }}>
            <Text
              style={{
                fontSize: 16,
                marginTop: 10,
                fontWeight: "400",
                marginLeft: "3%",
              }}
            >
              Responsable
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
                padding: 14,
                borderRadius: 16,
                marginTop: 10,
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
                value={typeConting?.valores}
                onFocus={() => setIsFocusE(true)}
                onBlur={() => setIsFocusE(false)}
                onChange={(item) => {
                  setEmployee(item);
                  setIsFocusE(false);
                }}
                renderLeftIcon={() => (
                  <AntDesign
                    style={{ marginRight: 5 }}
                    color={isFocusE ? "green" : "black"}
                    name="Safety"
                    size={20}
                  />
                )}
              />
            </SafeAreaView>
          </View>
          <View>
            <Text
              style={{
                fontSize: 16,
                marginTop: 20,
                fontWeight: "400",
                marginLeft: "3%",
              }}
            >
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
            {/* <Textarea
              className="rounded-2xl"
              style={{
                borderBlockColor: "#D9D9DA",
                borderColor: "#D9D9DA",
                marginTop: 10,
              }}
              placeholder="Ingresa tus observaciones e información adicional"
              onChangeText={(text) => {
                setContingReason(text);
              }}
            /> */}
          </View>
          <View
            style={{
              flexDirection: "column",
              width: "100%",
              marginTop: 20,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "400",
                marginLeft: "3%",
              }}
            >
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
            <View style={styles.inputWrapper}>
              {/* <Input
                className="rounded-3xl"
                style={styles.input}
                value={startDate.toLocaleString("es", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
                onPress={() => setShowCalendarStart(true)}
                aria-labelledbyledBy="inputLabel"
                aria-errormessage="inputError"
              /> */}
              <MaterialCommunityIcons
                color={"#1359"}
                name="calendar-edit"
                size={27}
                style={styles.icon}
                onPress={() => setShowCalendarStart(true)}
              />
            </View>
            <DatePickerModal
              locale="es"
              mode="single"
              date={startDate}
              visible={showCalendarStart}
              onConfirm={({ date }) => {
                setShowCalendarStart(false);
                if (date) {
                  setStartDate(date);
                }
              }}
              onDismiss={() => setShowCalendarStart(false)}
            />
          </View>
          <View style={{ marginTop: 10 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "400",
                marginLeft: "3%",
              }}
            >
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
            <View style={styles.inputWrapper}>
              {/* <Input
                className="rounded-3xl"
                style={styles.input}
                placeholder="Nombre del producto..."
                value={getElSalvadorDateTimeParam(time).horEmi}
                onPress={() => setTimePickerVisibility(true)}
                aria-labelledbyledBy="inputLabel"
                aria-errormessage="inputError"
              /> */}
              <MaterialCommunityIcons
                color={"#1359"}
                name="clock-edit-outline"
                size={27}
                style={styles.icon}
                onPress={() => setTimePickerVisibility(true)}
              />
            </View>
            <DateTimePickerModal
              isVisible={isTimePickerVisible}
              mode="time"
              onConfirm={handleConfirmTime}
              onCancel={hideTimePicker}
            />
          </View>
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
              {/* <Button
                style={{
                  backgroundColor: "#1359",
                  height: 50,
                  width: "100%",
                  marginTop: 10,
                }}
                className="rounded-3xl"
                onPress={() => handle_process_all_sales()}
              >
                <Text style={{ color: "#fff" }}>Enviar</Text>
              </Button> */}
            </>
          )}
        </View>
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
      position: "absolute",
      right: 20,
      top: "50%",
      transform: [{ translateY: -15 }],
    },
  });
  