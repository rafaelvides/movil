import * as yup from "yup";
import { Formik } from "formik";
import { ILoginPayload } from "@/types/auth/auth.types";
import { useAuthStore } from "../store/auth.store";
import { StatusBar } from "expo-status-bar";
import {
  KeyboardAvoidingView,
  Text,
  View,
  StyleSheet,
  Image,
  TextInput,
} from "react-native";
// import { Card, CardTitle, CardContent } from "@/~/components/ui/card";
// import { Input } from "@/~/components/ui/input";
// import { Button } from "@/~/components/ui/button";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";
import AuthenticationTouch from "../components/Global/AuthenticationTouch";
import { return_switch_biometric } from "@/plugins/secure_store";
import { useIsConnected } from "react-native-offline";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import Card from "@/components/Global/components_app/Card";
import Button from "@/components/Global/components_app/Button";

const login = () => {
  const { OnMakeLogin, OnMakeLoginOffline, is_authenticated, token } =
    useAuthStore();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const validationsSchema = yup.object().shape({
    userName: yup.string().required("El nombre es requerido"),
    password: yup.string().required("La contraseña es requerida"),
  });
  const [keyVisualizate, setKeyVisualizate] = useState(true);
  const isConnected = useIsConnected();

  const onSubmit = async (payload: ILoginPayload) => {
    if (isConnected) {
      console.log("first");
      await OnMakeLogin(payload);
    } else {
      await OnMakeLoginOffline(payload);
    }
  };
  console.log(is_authenticated, token);
  useEffect(() => {
    const loadVisable = async () => {
      try {
        const value = await return_switch_biometric();
        setVisible(value);
      } catch (error) {
        setVisible(false);
      }
    };
    loadVisable();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.container} behavior="height">
        <>
          <View style={styles.topHalf} />
          <View style={styles.bottomHalf} />

          <Formik
            onSubmit={onSubmit}
            validationSchema={validationsSchema}
            initialValues={{ userName: "", password: "" }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <>
                <View style={styles.formContainer}>
                  <View
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 15,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      style={{ width: 100, height: 100 }}
                      resizeMode="contain"
                      alt="logo"
                      source={require("../assets/images/facturacion.png")}
                    />
                  </View>
                  <Text
                    style={{ fontSize: 20, marginBottom: 50, color: "#fff" }}
                  >
                    Facturación Electronica
                  </Text>
                  <Card
                    style={{
                      width: stylesGlobals.styleCard.width,
                      height: 390,
                    }}
                  >
                    <View
                      style={{ justifyContent: "center", alignItems: "center" }}
                    >
                      <Text
                        style={{
                          fontSize: 19,
                          color: "#000",
                        }}
                      >
                        Inicio de sesión
                      </Text>
                    </View>
                    <View>
                      <View
                        style={{
                          width: 300,
                          justifyContent: "center",
                          alignItems: "center",
                          height: "auto",
                        }}
                      >
                        <View
                          style={{
                            width: "90%",
                            height: "85%",
                          }}
                        >
                          <Text style={{ marginLeft: 10 }}>
                            Nombre de usuario
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
                          <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons
                              color={"#AFB0B1"}
                              name="account"
                              size={30}
                              style={styles.icon}
                            />
                            {/* <Input
                              className="rounded-3xl"
                              style={styles.input}
                              placeholder="Escribe el nombre..."
                              onBlur={handleBlur("userName")}
                              onChangeText={handleChange("userName")}
                              value={values.userName}
                              aria-labelledbyledBy="inputLabel"
                            /> */}
                            <TextInput
                              style={styles.input}
                              onChangeText={handleChange("userName")}
                              value={values.userName}
                              onBlur={handleBlur("userName")}
                              placeholder="Escribe el nombre..."
                              // keyboardType="numeric"
                            />
                          </View>
                          {errors.userName && touched.userName && (
                            <Text
                              style={{
                                color: "red",
                                left: "6%",
                                top: -10,
                                marginBottom: 5,
                              }}
                            >
                              {errors.userName}
                            </Text>
                          )}
                          <Text style={{ marginLeft: 10 }}>
                            Contraseña
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
                          <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons
                              color={"#AFB0B1"}
                              name="key-variant"
                              size={27}
                              style={styles.icon}
                            />
                            {/* <Input
                              className="rounded-3xl"
                              style={styles.input}
                              placeholder="Escribe la contraseña..."
                              secureTextEntry={keyVisualizate}
                              onBlur={handleBlur("password")}
                              onChangeText={handleChange("password")}
                              value={values.password}
                              aria-labelledbyledBy="inputLabel"
                              aria-errormessage="inputError"
                            /> */}
                            <TextInput
                              secureTextEntry={keyVisualizate}
                              style={styles.input}
                              onChangeText={handleChange("password")}
                              onBlur={handleBlur("password")}
                              value={values.password}
                              placeholder="Escribe la contraseña..."
                              // keyboardType="numeric"
                            />
                            {values.password !== "" && (
                              <>
                                {keyVisualizate ? (
                                  <MaterialCommunityIcons
                                    color={"#AFB0B1"}
                                    name="eye-outline"
                                    size={27}
                                    style={styles.iconKey}
                                    onPress={() => {
                                      setKeyVisualizate(false);
                                    }}
                                  />
                                ) : (
                                  <MaterialCommunityIcons
                                    color={"#AFB0B1"}
                                    name="eye-off-outline"
                                    size={27}
                                    style={styles.iconKey}
                                    onPress={() => {
                                      setKeyVisualizate(true);
                                    }}
                                  />
                                )}
                              </>
                            )}
                          </View>
                          {errors.password && touched.password && (
                            <Text
                              style={{
                                color: "red",
                                left: "6%",
                                top: -10,
                                marginBottom: 10,
                              }}
                            >
                              {errors.password}
                            </Text>
                          )}
                          <View
                            style={{
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Button
                              withB={280}
                              onPress={() => handleSubmit()}
                              Title="Ingresar"
                              color="#1359"
                            />
                          </View>
                          <View style={styles.separator} />
                          {visible === true && (
                            <>
                              {!loading && (
                                <>
                                  <View
                                    style={{
                                      marginLeft: 5,
                                      marginBottom: 20,
                                      marginTop: 1,
                                      width: 45,
                                      height: 45,
                                      borderRadius: 10,
                                    }}
                                  >
                                    <AuthenticationTouch
                                      setLoading={setLoading}
                                    />
                                  </View>
                                </>
                              )}
                            </>
                          )}
                        </View>
                      </View>
                    </View>
                  </Card>
                </View>
              </>
            )}
          </Formik>
        </>
      </KeyboardAvoidingView>
      {/* <>
        <View
        // style={styles.centeredView}
        >
          <Modal visible={showModal} animationType="slide">
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <AddBox
                  branchId={idBranch}
                  closeModal={() => setShowModal(false)}
                  closeBoxModal={() => setShowModal(false)}
                />
              </View>
            </View>
          </Modal>
        </View>
      </> */}
    </>
  );
};

export default login;
const styles = StyleSheet.create({
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    zIndex: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    backgroundColor: "rgba(80, 80, 80, 0.8)",
  },
  container: {
    flex: 1,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  topHalf: {
    flex: 1,
    backgroundColor: "#1359",
    borderRadius: 25,
  },
  bottomHalf: {
    flex: 1,
    backgroundColor: "#FCFCFC",
  },
  formContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 180,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: "40%",
    padding: 20,
    zIndex: 1,
  },
  inputWrapper: {
    position: "relative",
    width: "100%",
    height: 50,
    justifyContent: "center",
    marginBottom: 10,
  },
  icon: {
    position: "absolute",
    left: 7,
    top: "50%",
    transform: [{ translateY: -15 }],
  },
  iconKey: {
    position: "absolute",
    right: 15,
    top: "50%",
    transform: [{ translateY: -15 }],
  },
  input: {
    height: "100%",
    paddingLeft: 40,
    borderColor: "#D9D9DA",
    borderWidth: 1,
    borderRadius: 15,
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginHorizontal: -2,
    marginVertical: 10,
    marginTop: 20,
  },
});
