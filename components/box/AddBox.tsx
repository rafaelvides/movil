import { useBoxStore } from "@/store/box.store";
import { IBoxPayload } from "@/types/box/box.types";
import * as yup from "yup";
import { Formik } from "formik";
import {
  SafeAreaView,
  Text,
  ToastAndroid,
  View,
  StyleSheet,
  Button,
} from "react-native";
import { get_point_sale_Id, save_employee_id } from "@/plugins/async_storage";
import React, { useContext, useEffect, useState } from "react";

import { Dropdown } from "react-native-element-dropdown";
import { AntDesign } from "@expo/vector-icons";
import { useEmployeeStore } from "@/store/employee.store";
import { useFocusEffect } from "expo-router";
import { IEmployee } from "@/types/employee/employee.types";
import { useAuthStore } from "@/store/auth.store";
import { ThemeContext } from "@/hooks/useTheme";

const AddBox = ({ closeModal }: { closeModal: () => void }) => {
  const [isFocus, setIsFocus] = useState(false);
  const [employee, setEmployee] = useState<IEmployee>();
  const [refreshing, setRefreshing] = useState(false);
  const { OnGetEmployeesList, employee_list } = useEmployeeStore();
  const { theme } = useContext(ThemeContext);
  const validationSchema = yup.object().shape({
    start: yup.number().required("El monto inicial es requerido"),
  });
  const { OnPostBox } = useBoxStore();
  const { token } = useAuthStore();
  const handleSubmit = async (start: IBoxPayload) => {
    get_point_sale_Id().then(async (pointId) => {
      if (pointId !== null && pointId !== "") {
        const payload: IBoxPayload = {
          start: Number(start.start),
          pointOfSaleId: Number(pointId),
        };
        await save_employee_id(String(employee?.id));

        OnPostBox(payload, token);
      } else {
        ToastAndroid.show("Error en credenciales de ventas", ToastAndroid.LONG);
      }
      closeModal();
    });
  };
  useFocusEffect(
    React.useCallback(() => {
      setRefreshing(true);
    }, [])
  );
  useEffect(() => {
    OnGetEmployeesList();
    setRefreshing(false);
  }, [refreshing]);

  return (
    <>
      <View
        style={{
          width: 300,
          height: 260,
        }}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 18, marginBottom: 5 }}>Abrir una caja</Text>
          <Formik
            initialValues={{
              start: 0,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleSubmit }) => (
              <>
                <View
                  style={{
                    justifyContent: "center",
                    width: "100%",
                    marginTop: 20,
                  }}
                >
                  <View style={{ width: "100%" }}>
                    <Text>
                      Monto inicial
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
                    <View
                      style={{
                        position: "relative",
                        width: "100%",
                        height: 50,
                        justifyContent: "center",
                        marginBottom: 15,
                      }}
                    >
                      <Text style={{ position: "absolute", left: 10 }}>$</Text>
                    </View>

                    {errors.start && touched.start && (
                      <Text style={{ color: "red", marginTop: 5 }}>
                        {errors.start}
                      </Text>
                    )}
                  </View>
                  <View style={{ width: "100%" }}>
                    <Text style={{ fontWeight: "500" }}>
                      Empleado para venta
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
                        data={employee_list}
                        itemTextStyle={{
                          fontSize: 16,
                        }}
                        search
                        maxHeight={250}
                        labelField="fullName"
                        valueField="id"
                        placeholder={!isFocus ? "Selecciona un item " : "..."}
                        searchPlaceholder="Escribe para buscar..."
                        value={employee}
                        onFocus={() => setIsFocus(true)}
                        onBlur={() => setIsFocus(false)}
                        onChange={(item) => {
                          setEmployee(item);
                          setIsFocus(false);
                        }}
                        renderLeftIcon={() => (
                          <AntDesign
                            style={styles.icon}
                            color={isFocus ? "blue" : "black"}
                            name="Safety"
                            size={20}
                          />
                        )}
                      />
                    </SafeAreaView>
                  </View>
                  <View
                    style={{
                      marginBottom: 20,
                      padding: 20,
                    }}
                  >
                    <Button
                      title="Guardar"
                      color="#f194ff"
                      onPress={() => handleSubmit()}
                    />
                  </View>
                </View>
              </>
            )}
          </Formik>
        </View>
      </View>
    </>
  );
};

export default AddBox;

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
  icon: {
    marginRight: 5,
  },
});
