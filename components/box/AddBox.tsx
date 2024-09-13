import { useBoxStore } from "@/store/box.store";
import { IBoxPayload } from "@/types/box/box.types";
import * as yup from "yup";
import { Formik } from "formik";
import {
  Text,
  ToastAndroid,
  View,
} from "react-native";
import { get_point_sale_Id } from "@/plugins/async_storage";
import React, { useContext, useEffect, useState } from "react";

import { useFocusEffect, useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth.store";
import { ThemeContext } from "@/hooks/useTheme";
import Input from "../Global/components_app/Input";
import Button from "../Global/components_app/Button";
import stylesGlobals from "../Global/styles/StylesAppComponents";

const AddBox = ({ closeModal }: { closeModal: () => void }) => {
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false);
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
        OnPostBox(payload, token);
      } else {
        ToastAndroid.show("Error en credenciales de ventas", ToastAndroid.LONG);
      }
      router.navigate("/home")
      closeModal();
    });
  };
  useFocusEffect(
    React.useCallback(() => {
      setRefreshing(true);
    }, [])
  );
  useEffect(() => {
    // OnGetEmployeesList();
    setRefreshing(false);
  }, [refreshing]);

  return (
    <>
      <Text style={{ fontSize: 16, marginBottom: 5, textAlign: "center" }}>
        Abrir caja
      </Text>
      <Formik
        initialValues={{
          start: 0,
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleSubmit,
          handleBlur,
        }) => (
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
                  <Input
                    placeholder="00.00"
                    onChangeText={handleChange("start")}
                    keyboardType="numeric"
                    values={String(values.start)}
                    handleBlur={handleBlur("start")}
                    icon="currency-usd"
                  />
                </View>

                {errors.start && touched.start && (
                  <Text style={{ color: "red", marginTop: 5 }}>
                    {errors.start}
                  </Text>
                )}
              </View>

              <View style={stylesGlobals.viewBotton}>
                <Button
                  withB={290}
                  onPress={() => handleSubmit()}
                  Title="Ingresar"
                  color={theme.colors.dark}
                />
              </View>
            </View>
          </>
        )}
      </Formik>
    </>
  );
};

export default AddBox;

