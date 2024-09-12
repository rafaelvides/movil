import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ToastAndroid,
  Alert,
} from "react-native";
import React, { Dispatch, SetStateAction, useContext, useMemo } from "react";
import { SVFE_FC } from "@/types/svf_dte/fc.types";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { formatCurrency } from "@/utils/dte";
import * as FileSystem from "expo-file-system";
import { generateURL } from "@/utils/utils";
import { API_URL, SPACES_BUCKET } from "@/utils/constants";
import { s3Client } from "@/plugins/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { get_box_data, get_employee_id } from "@/plugins/async_storage";
import { useCustomerStore } from "@/store/customer.store";
import { return_token } from "@/plugins/async_storage";
import axios from "axios";
import Button from "@/components/Global/components_app/Button";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import { ThemeContext } from "@/hooks/useTheme";
import Card from "@/components/Global/components_app/Card";

const SaleContingenceF = ({
  jsonSaleF,
  resetSaleForJson,
  setSalesProgress,
  setMessage,
}: {
  jsonSaleF: SVFE_FC;
  resetSaleForJson: () => void;
  setSalesProgress: Dispatch<SetStateAction<boolean>>;
  setMessage: Dispatch<SetStateAction<string>>;
}) => {
  const { customer_list } = useCustomerStore();
  const { theme } = useContext(ThemeContext);

  const customer = useMemo(() => {
    if (jsonSaleF) {
      const customer_credito = jsonSaleF.receptor;

      return customer_list.find((customer) => {
        if (
          customer.nombre === customer_credito.nombre &&
          customer.correo === customer_credito.correo
        ) {
          return customer;
        }
      });
    }
  }, [jsonSaleF, customer_list]);

  const handleProgressJson = async () => {
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
    if (jsonSaleF) {
      setSalesProgress(true);
      setMessage("Estamos subiendo los archivos...");
      const JSON_uri =
        FileSystem.documentDirectory +
        jsonSaleF.identificacion.numeroControl +
        ".json";

      FileSystem.writeAsStringAsync(
        JSON_uri,
        JSON.stringify({
          ...jsonSaleF,
        }),
        {
          encoding: FileSystem.EncodingType.UTF8,
        }
      ).then(async () => {
        const json_url = generateURL(
          jsonSaleF.emisor.nombre,
          jsonSaleF.identificacion.codigoGeneracion,
          "json",
          "01",
          jsonSaleF.identificacion.fecEmi
        );
        const blobJSON = await fetch(JSON_uri)
          .then((res) => res.blob())
          .catch(() => {
            ToastAndroid.show(
              "Error al generar la url del documento",
              ToastAndroid.LONG
            );
            resetSaleForJson();
            return null;
          });
        if (!blobJSON) {
          resetSaleForJson();
          return;
        }
        const jsonUploadParams = {
          Bucket: SPACES_BUCKET,
          Key: json_url,
          Body: blobJSON!,
        };
        if (jsonUploadParams) {
          s3Client.send(new PutObjectCommand(jsonUploadParams)).then(() => {
            setMessage("Estamos guardando tus documentos...");
            const payload = {
              pdf: "pdf_url",
              dte: json_url,
              cajaId: box.id,
              codigoEmpleado: codeEmployee,
              sello: true,
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
                    Alert.alert("Éxito", "Se completaron todos los procesos");
                    resetSaleForJson();
                  });
              })
              .catch(() => {
                resetSaleForJson();
                ToastAndroid.show(
                  "No tienes el acceso necesario",
                  ToastAndroid.LONG
                );
              });
          });
        }
      });
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        width: "100%",
        backgroundColor: "#fff",
        paddingHorizontal: 8,
      }}
    >
      <StatusBar style="dark" />
      <Text
        style={{
          fontWeight: "600",
          color: "#4B5563",
          textAlign: "center",
          marginTop: "5%",
          fontSize: 18,
        }}
      >
        Venta a generar
      </Text>
      <View
        style={{
          marginHorizontal: "5%",
          marginTop: "6%",
        }}
      >
        <View
          style={{
            width: "100%",
          }}
        >
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "2%",
            }}
          >
            <Text
              style={{
                fontWeight: "600",
                color: "#4B5563",
              }}
            >
              Código Generación
            </Text>
            <MaterialCommunityIcons
              color={"#AFB0B1"}
              name="card-text-outline"
              size={30}
              style={styles.icon}
            />
          </View>
          <Text
            style={{
              fontWeight: "600",
              color: "#4B5563",
              textAlign: "center",
            }}
          >
            {jsonSaleF.identificacion.codigoGeneracion.slice(0, 50)}
          </Text>
        </View>
        <View
          style={{
            width: "100%",
            marginTop: "8%",
          }}
        >
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "2%",
            }}
          >
            <Text
              style={{
                fontWeight: "600",
                color: "#4B5563",
              }}
            >
              Numero Control
            </Text>
            <MaterialCommunityIcons
              color={"#AFB0B1"}
              name="clipboard-minus-outline"
              size={30}
              style={styles.icon}
            />
          </View>
          <Text
            style={{
              fontWeight: "600",
              color: "#4B5563",
              textAlign: "center",
            }}
          >
            {jsonSaleF.identificacion.numeroControl.slice(0, 50)}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignContent: "center",
            marginTop: "8%",
            gap: 100,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              color={"#AFB0B1"}
              name="calendar-month"
              size={30}
              style={styles.iconClock}
            />
            <Text
              style={{
                marginLeft: 40,
                fontWeight: "600",
                color: "#4B5563",
              }}
            >
              {jsonSaleF.identificacion.fecEmi.toLocaleString()}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              color={"#AFB0B1"}
              name="clipboard-clock-outline"
              size={30}
              style={styles.iconClock}
            />
            <Text
              style={{
                marginLeft: 40,
                fontWeight: "600",
                color: "#4B5563",
              }}
            >
              {jsonSaleF.identificacion.horEmi.toLocaleString()}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignContent: "center",
            marginTop: "8%",
            marginBottom: "5%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: "30%",
              right: 20,
            }}
          >
            <MaterialCommunityIcons
              color={"#AFB0B1"}
              name="ticket-percent"
              size={30}
              style={styles.iconClock}
            />
            <Text
              style={{
                marginLeft: 40,
                fontWeight: "600",
                color: "#4B5563",
              }}
            >
              {jsonSaleF.resumen.totalDescu}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              width: "50%",
              left: "15%",
            }}
          >
            <MaterialCommunityIcons
              color={"#AFB0B1"}
              name="currency-usd"
              size={30}
              style={{
                alignSelf: "center",
              }}
            />
            <Text
              style={{
                fontWeight: "600",
                color: "#4B5563",
              }}
            >
              {formatCurrency(jsonSaleF.resumen.totalPagar)}
            </Text>
          </View>
        </View>
        <ScrollView
          style={{
            height: "50%",
          }}
        >
          <View style={stylesGlobals.viewScroll}>
            {jsonSaleF.cuerpoDocumento.map((cd, index) => (
              <Card key={index} style={stylesGlobals.styleCard}>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: "5%",
                    width: "100%",
                  }}
                >
                  <Text>Index: #{index}</Text>
                </View>
                <View
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Text>Nombre:</Text>
                    <Text
                      style={{
                        marginLeft: 44,
                        fontWeight: "400",
                        color: "#4B5563",
                      }}
                    >
                      {cd.descripcion.slice(0, 30)}
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
                    <Text>Código:</Text>
                    <Text
                      style={{
                        marginLeft: 44,
                        fontWeight: "400",
                        color: "#4B5563",
                      }}
                    >
                      {cd.codigo}
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
                    <Text>Descuento:</Text>
                    <Text
                      style={{
                        marginLeft: 44,
                        fontWeight: "400",
                        color: "#4B5563",
                      }}
                    >
                      {cd.montoDescu}
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
                    <Text>Precio:</Text>
                    <Text
                      style={{
                        marginLeft: 44,
                        fontWeight: "400",
                        color: "#4B5563",
                      }}
                    >
                      {formatCurrency(cd.precioUni)}
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
                    <Text>Código:</Text>
                    <Text
                      style={{
                        marginLeft: 44,
                        fontWeight: "400",
                        color: "#4B5563",
                      }}
                    >
                      {cd.codigo}
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
                    <Text>Descuento:</Text>
                    <Text
                      style={{
                        marginLeft: 44,
                        fontWeight: "400",
                        color: "#4B5563",
                      }}
                    >
                      {cd.montoDescu}
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
                    <Text>Precio:</Text>
                    <Text
                      style={{
                        marginLeft: 44,
                        fontWeight: "400",
                        color: "#4B5563",
                      }}
                    >
                      {formatCurrency(cd.precioUni)}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </ScrollView>
        <View style={stylesGlobals.viewBotton}>
          <Button
            withB={390}
            onPress={handleProgressJson}
            Title="Filtrar"
            color={theme.colors.dark}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SaleContingenceF;

const styles = StyleSheet.create({
  icon: {
    position: "absolute",
    left: "20%",
    top: "30%",
    transform: [{ translateY: -15 }],
  },
  iconClock: {
    position: "absolute",
    left: 7,
    top: "30%",
    transform: [{ translateY: -15 }],
  },
  card: {
    height: "auto",
    marginBottom: 25,
    padding: 5,
    width: "95%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
});
