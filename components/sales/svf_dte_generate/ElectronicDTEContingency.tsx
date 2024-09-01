import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Dropdown } from "react-native-element-dropdown";
import { useBillingStore } from "@/store/billing/billing.store";
import { ITiposDeContingencia } from "@/types/billing/cat-005-tipos-de-contigencia.types";
import { AntDesign } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DatePickerModal } from "react-native-paper-dates";
import { getElSalvadorDateTimeParam } from "@/utils/date";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { return_token_mh } from "@/plugins/secure_store";
import {
  get_configuration,
  get_user,
} from "@/plugins/async_storage";
import { get_find_by_correlative } from "@/services/point_of_sale.service";
import { ContingencySalesGenerator } from "@/plugins/DTE/ContingencySalesGenerator";
import { generate_uuid } from "@/plugins/random/random";
import { useTransmitterStore } from "@/store/transmitter.store";
import {
  firmarDocumentoContingencia,
  send_to_mh_contingencia,
} from "@/services/ministry_of_finance.service";
import axios, { AxiosError } from "axios";
import { useSaleStore } from "@/store/sale.store";
import { showAlertAndWait } from "@/plugins/DTE/make_generator/make-dte";
import { SendMHFailed } from "@/types/svf_dte/responseMH/responseMH.types";

const ElectronicDTEContingency = ({
  infoContingency,
  setModalContingency,
}: {
  infoContingency: {
    saleDTE: string;
    pathJson: string;
    box_id: number;
    customer_id: number;
    employee: number;
  };
  setModalContingency: Dispatch<SetStateAction<boolean>>;
}) => {
  const [isFocus, setIsFocus] = useState(false);
  const [typeConting, setTypeConting] = useState<ITiposDeContingencia>();
  const [contingReason, setContingReason] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showCalendarStart, setShowCalendarStart] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [screenChange, setsCreenChange] = useState(false);
  const [message, setMessage] = useState("Esperando");
  const { cat_005_tipo_de_contingencia, OnGetCat005TipoDeContingencia } =
    useBillingStore();
  const { OnGetTransmitter, transmitter } = useTransmitterStore();
  const { OnPressAllSalesConting } = useSaleStore();
  const { OnImgPDF, img_invalidation, img_logo } = useSaleStore();
  const handleConfirmTime = (date: Date) => {
    setTime(date);
    setTimePickerVisibility(false);
  };

  useEffect(() => {
    OnGetCat005TipoDeContingencia();
    OnGetTransmitter();
  }, []);
  useEffect(() => {
    (async () => {
      await get_configuration().then((data) => {
        OnImgPDF(String(data?.logo));
      });
    })();
  }, []);

  const handleContingencySubtraction = async () => {
    if (!infoContingency) {
      ToastAndroid.show("Vuelve a seleccionar la venta", ToastAndroid.SHORT);
    }
    let currentOperation = Promise.resolve<boolean | void>(false);
    const token_mh = await return_token_mh();
    const user = await get_user();
    if (!user) {
      ToastAndroid.show("No se encontró el usuario", ToastAndroid.SHORT);
      return;
    }
    const correlatives = await get_find_by_correlative(
      user.id,
      infoContingency.saleDTE === "03" ? "CCF" : "F"
    );
    if (!correlatives.data.correlativo) {
      ToastAndroid.show("No se encontraron correlativos", ToastAndroid.SHORT);
      return;
    }
    setsCreenChange(true);
    const infoSale = [
      {
        noItem: 1,
        codigoGeneracion: generate_uuid().toUpperCase(),
        tipoDoc: String(infoContingency.saleDTE),
      },
    ];

    const generateContingency = ContingencySalesGenerator(
      transmitter,
      startDate,
      time,
      Number(typeConting?.codigo),
      contingReason,
      infoSale,
      correlatives.data.correlativo
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
          //   setIsProcessing(false);
        }, 60000);

        Promise.race([
          send_to_mh_contingencia(send, token_mh ?? "").then(
            async (resspon) => {
              clearTimeout(timeout);
              if (resspon.data.estado === "RECIBIDO") {
                currentOperation = currentOperation
                  .then(async () => {
                    await OnPressAllSalesConting(
                      transmitter,
                      infoContingency.box_id,
                      infoContingency.saleDTE,
                      infoContingency.pathJson,
                      String(token_mh),
                      infoContingency.employee,
                      img_logo,
                      img_invalidation,
                      infoContingency.customer_id
                    ).then(async (response) => {
                      if (response?.isErrorMh) {
                        await showAlertAndWait(
                          response.title,
                          response.message
                        );
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
                    });
                  })
                  .catch(() => {
                    return false;
                  });
                currentOperation.then(() => {
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
            }
          ),
          new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error("El tiempo de espera ha expirado"));
              setsCreenChange(false);
            }, 60000);
          }),
        ]).catch((error: AxiosError<SendMHFailed>) => {
          clearTimeout(timeout);
          setsCreenChange(false);
          if (error.response?.status === 401) {
            ToastAndroid.show(
              "No tienes los accesos necesarios",
              ToastAndroid.SHORT
            );
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
        <View
          style={{
            paddingHorizontal: 40,
          }}
        >
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
                setModalContingency(false);
              }}
            />
          </Pressable>
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
              }}
            >
              Tipo de contingencia
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
                padding: 12,
                borderRadius: 5,
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
          <View>
            <Text
              style={{
                fontSize: 16,
                marginTop: 25,
                fontWeight: "400",
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
           
          </View>
          <View
            style={{
              flexDirection: "column",
              width: "100%",
              marginTop: 25,
            }}
          >
            <Text
              style={{
                color: "#2C3377",
                fontSize: 16,
                fontWeight: "400",
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

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 10,
                width: "100%",
                backgroundColor: "#FFFFFF",
              }}
            >
              <View style={styles.inputWrapper}>
              
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
          </View>
          <View style={{ marginTop: 18 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "400",
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
              onCancel={() => setTimePickerVisibility(false)}
            />
          </View>

        </View>
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
    position: "absolute",
    right: 20,
    top: "50%",
    transform: [{ translateY: -15 }],
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
