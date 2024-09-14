import {
  Alert,
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
  useContext,
  useMemo,
  useState,
} from "react";
import { useCustomerStore } from "@/store/customer.store";
import { ThemeContext } from "@/hooks/useTheme";
import { get_box_data, return_token } from "@/plugins/async_storage";
import { generateURL } from "@/utils/utils";
import * as FileSystem from "expo-file-system";
import { API_URL, SPACES_BUCKET } from "@/utils/constants";
import { s3Client } from "@/plugins/s3";
import axios from "axios";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { formatCurrency } from "@/utils/dte";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import Card from "@/components/Global/components_app/Card";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { StatusBar } from "expo-status-bar";
import Button from "@/components/Global/components_app/Button";
import { SVFE_CF } from "@/types/svf_dte/cf.types";
import { useEmployeeStore } from "@/store/employee.store";
import { Dropdown } from "react-native-element-dropdown";
import { IEmployee } from "@/types/employee/employee.types";
import { AntDesign } from "@expo/vector-icons";

const SaleContingenceCCF = ({
  jsonSaleCCF,
  resetSaleForJson,
  setSalesProgress,
  setMessage,
}: {
  jsonSaleCCF: SVFE_CF;
  resetSaleForJson: () => void;
  setSalesProgress: Dispatch<SetStateAction<boolean>>;
  setMessage: Dispatch<SetStateAction<string>>;
}) => {
  const { customer_list } = useCustomerStore();
  const { theme } = useContext(ThemeContext);
  const { employee_list } = useEmployeeStore();
  const [employeId, setEmployeId] = useState(0);
  const [employee] = useState<IEmployee | undefined>();
  const [isFocusEmp, setIsFocusEmp] = useState(false);

  const customer = useMemo(() => {
    if (jsonSaleCCF) {
      const customer_credito = jsonSaleCCF.receptor;

      return customer_list.find((customer) => {
        if (
          customer.nombre === customer_credito.nombre &&
          customer.correo === customer_credito.correo
        ) {
          return customer;
        }
      });
    }
  }, [jsonSaleCCF, customer_list]);

  const handleProgressJson = async () => {
    const box = await get_box_data();

    if (box?.id === 0 || !box) {
      ToastAndroid.show("No se encontró la caja", ToastAndroid.SHORT);
      return;
    }

    if (!employeId) {
      ToastAndroid.show("No se encontró el empleado", ToastAndroid.SHORT);
      return;
    }
    if (jsonSaleCCF) {
      setSalesProgress(true);
      setMessage("Estamos subiendo los archivos...");
      const JSON_uri =
        FileSystem.documentDirectory +
        jsonSaleCCF.identificacion.numeroControl +
        ".json";

      FileSystem.writeAsStringAsync(
        JSON_uri,
        JSON.stringify({
          ...jsonSaleCCF,
        }),
        {
          encoding: FileSystem.EncodingType.UTF8,
        }
      ).then(async () => {
        const json_url = generateURL(
          jsonSaleCCF.emisor.nombre,
          jsonSaleCCF.identificacion.codigoGeneracion,
          "json",
          "03",
          jsonSaleCCF.identificacion.fecEmi
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
            const customer_found = customer;
            const payload = {
              pdf: "N/A",
              dte: json_url,
              cajaId: box.id,
              codigoEmpleado: employeId,
              sello: true,
              clienteId: customer_found?.id ?? 0,
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
      <View style={{ width: "100%", marginTop: 20, paddingHorizontal: 14 }}>
        <Text style={stylesGlobals.textInput}>Selecciona un empleado</Text>
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
              setEmployeId(item.id);
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
      <View
        style={{
          marginHorizontal: "5%",
          marginTop: "6%",
        }}
      >
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons
            color={"#AFB0B1"}
            name="card-text-outline"
            size={30}
            style={styles.icon}
          />
          <Text
            style={{
              fontWeight: "600",
              color: "#4B5563",
              textAlign: "center",
              flex: 1,
            }}
          >
            {jsonSaleCCF.identificacion.codigoGeneracion.slice(0, 50)}
          </Text>
        </View>
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            marginTop: "6%",
          }}
        >
          <MaterialCommunityIcons
            color={"#AFB0B1"}
            name="clipboard-minus-outline"
            size={30}
            style={styles.icon}
          />
          <Text
            style={{
              fontWeight: "600",
              color: "#4B5563",
              textAlign: "center",
              flex: 1,
            }}
          >
            {jsonSaleCCF.identificacion.numeroControl.slice(0, 50)}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignContent: "center",
            marginTop: "8%",
            gap: 100,
            justifyContent: "space-between",
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
              {jsonSaleCCF.identificacion.fecEmi.toLocaleString()}
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
              {jsonSaleCCF.identificacion.horEmi.toLocaleString()}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignContent: "center",
            justifyContent: "space-between",
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
              {jsonSaleCCF.resumen.totalDescu}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "5%",
            }}
          >
            <MaterialCommunityIcons
              color={"#AFB0B1"}
              name="currency-usd"
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
              {formatCurrency(jsonSaleCCF.resumen.totalPagar)}
            </Text>
          </View>
        </View>
        <ScrollView
          style={{
            height: "48%",
          }}
        >
          <View style={stylesGlobals.viewScroll}>
            {jsonSaleCCF.cuerpoDocumento.map((cd, index) => (
              <Card key={index} style={stylesGlobals.styleCard}>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: "5%",
                    width: "100%",
                  }}
                >
                  <Text>Index: #{index + 1}</Text>
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
            onPress={handleProgressJson}
            Title="Filtrar"
            color={theme.colors.dark}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SaleContingenceCCF;

const styles = StyleSheet.create({
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  iconClock: {
    position: "absolute",
    left: 0,
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
