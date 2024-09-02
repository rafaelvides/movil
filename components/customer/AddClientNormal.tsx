import { get_user } from "@/plugins/async_storage";
import { useBillingStore } from "@/store/billing/billing.store";
import { useCustomerStore } from "@/store/customer.store";
import {
  CustomerDirection,
  IPayloadCustomer,
} from "@/types/customer/customer.types";
import { UserLogin } from "@/types/user/user.types";
import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useContext, useEffect, useState } from "react";
import * as yup from "yup";
import { Formik } from "formik";
import { ScrollView } from "react-native-gesture-handler";
import { View, Text, StyleSheet, Modal, ToastAndroid } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dropdown } from "react-native-element-dropdown";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { ThemeContext } from "@/hooks/useTheme";
import SaveLocations from "../save_locations/SaveLocations";
import { isValidDUI, isValidNIT } from "@/utils/validations";
import Input from "../Global/components_app/Input";
import Button from "../Global/components_app/Button";
import stylesGlobals from "../Global/styles/StylesAppComponents";

interface Props {
  closeModal: () => void;
  customer?: IPayloadCustomer;
  customer_direction?: CustomerDirection;
  id?: number;
}

const AddClientsNormal = (props: Props) => {
  const [isFocusDepart, setIsFocusDepart] = useState(false);
  const [isFocusMuni, setIsFocusMuni] = useState(false);
  const [isFocusDoc, setIsFocusDoc] = useState(false);
  const [name, setIsName] = useState("");
  const [isUser, setUser] = useState<UserLogin | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [location, setLocation] = useState<{ latitude: ""; longitude: "" }>();
  const { PostCustomer, UpdateCustomer } = useCustomerStore();
  const { theme } = useContext(ThemeContext);
  const [tipeKeyboard, setTipyeKeyboard] = useState(false);
  const [nameTypeDocu, setNameTypeDocu] = useState("default");
  const { closeModal, id } = props;
  const {
    OnGetCat012Departamento,
    cat_012_departamento,
    OnGetCat013Municipios,
    cat_013_municipios,
    OnGetCat022TipoDeDocumentoDeIde,
    cat_022_tipo_de_documento_de_ide,
  } = useBillingStore();

  const initialValues = {
    nombre: props.customer?.nombre ?? "",
    correo: props.customer?.correo ?? "",
    telefono: props.customer?.telefono ?? "",
    tipoDocumento: props.customer?.tipoDocumento ?? "",
    numDocumento: props.customer?.numDocumento ?? "",
    municipio: props.customer_direction?.municipio ?? "",
    nombreMunicipio: props.customer_direction?.nombreMunicipio ?? "",
    departamento: props.customer_direction?.departamento ?? "",
    nombreDepartamento: props.customer_direction?.nombreDepartamento ?? "",
    complemento: props.customer_direction?.complemento ?? "",
    latitude: props.customer?.latitude ?? "0",
    longitude: props.customer?.longitude ?? "0",
  };

  const validationSchema = yup.object().shape({
    nombre: yup.string().required("El nombre es requerido"),
    correo: yup
      .string()
      .required("El correo electrónico es un campo requerido")
      .email("El correo es invalido")
      .matches(
        /(^[a-zA-Z0-9._-]+)@(gmail\.com|hotmail\.com|outlook\.com)$/,
        "Solo se permiten correos de Gmail, Hotmail y Outlook"
      ),
    telefono: yup.string().required("El teléfono es requerido"),

    numDocumento: yup.string().when("tipoDocumento", {
      is: (tipoDocumento: string | undefined) =>
        tipoDocumento === "13" ||
        tipoDocumento === "36" ||
        tipoDocumento === "03" ||
        tipoDocumento === "02",

      then: (schema) =>
        schema.required("El número de documento es requerido").test({
          name: "documentValidation",
          message: "El número de documento no es válido",
          test: (value, context) => {
            const { tipoDocumento } = context.parent;
            if (tipoDocumento === "13") {
              return /^[0-9]{9}$/.test(value || "");
            } else if (tipoDocumento === "36") {
              return /^[0-9]{14}$/.test(value || "");
            }
            return true;
          },
        }),
      otherwise: (schema) => schema.notRequired(),
    }),
    departamento: yup
      .string()
      .required("**Debes seleccionar el departamento**"),
    municipio: yup.string().required("**Debes seleccionar el municipio**"),
    complemento: yup.string().required("**El complemento es requerida**"),
  });

  const [selectedCodeDep, setSelectedCodeDep] = useState(
    props.customer_direction?.departamento ?? "0"
  );

  useFocusEffect(
    React.useCallback(() => {
      if (props.customer_direction?.municipio) {
        OnGetCat013Municipios(selectedCodeDep.toString());
      }
    }, [props.customer_direction?.municipio])
  );

  const onChangeSelect = () => {
    if (nameTypeDocu === "DUI" || nameTypeDocu === "NIT") {
      setTipyeKeyboard(true);
    } else if (
      nameTypeDocu === "Otro" ||
      nameTypeDocu === "Pasaporte" ||
      nameTypeDocu === "Carnet de Extranjería"
    ) {
      setTipyeKeyboard(false);
    }
    if (nameTypeDocu === "default") {
      if (
        props.customer?.tipoDocumento === "36" ||
        props.customer?.tipoDocumento === "13"
      ) {
        setTipyeKeyboard(true);
      }
    }
  };

  useEffect(() => {
    const nameDocument = (code: string) => {
      if (props.customer?.tipoDocumento) {
        cat_022_tipo_de_documento_de_ide.map((item) => {
          if (item.codigo === code) {
            setIsName(item.valores);
          }
        });
        if (
          props.customer.tipoDocumento === "13" ||
          props.customer.tipoDocumento === "36"
        ) {
          setTipyeKeyboard(true);
        } else {
          setTipyeKeyboard(false);
        }
      } else {
        setIsName("");
      }
    };
    nameDocument(props.customer?.tipoDocumento ?? "");
  }, [props.customer?.tipoDocumento, tipeKeyboard]);

  useEffect(() => {
    OnGetCat012Departamento();
    OnGetCat022TipoDeDocumentoDeIde();
    onChangeSelect();
  }, [nameTypeDocu]);

  useEffect(() => {
    if (id) {
      setIsUpdate(true);
    } else {
      setIsUpdate(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (selectedCodeDep !== "0") {
        OnGetCat013Municipios(
          props.customer_direction?.departamento ?? selectedCodeDep
        );
      }
      OnGetCat013Municipios(selectedCodeDep);
    }, [selectedCodeDep, props.customer_direction])
  );

  useEffect(() => {
    const fetchData = async () => {
      const userData = await get_user();
      setUser(userData);
    };
    fetchData();
  }, []);

  const onSubmit = async (payload: IPayloadCustomer) => {
    try {
      await PostCustomer({
        ...payload,
        esContribuyente: 0,
        transmitterId: isUser?.transmitterId,
        tipoContribuyente: "N/A",
        latitude: location?.latitude ?? "0",
        longitude: location?.longitude ?? "0",
      });
      closeModal();
    } catch (error) {
      ToastAndroid.show("No se creo el registro", ToastAndroid.LONG);
    }
  };

  const onSubmitUpdate = async (payload: IPayloadCustomer) => {
    try {
      if (id || id !== 0) {
        await UpdateCustomer(
          {
            ...payload,
            esContribuyente: 0,
            transmitterId: isUser?.transmitterId,
            tipoContribuyente: "N/A",
            latitude: location?.latitude
              ? location?.latitude
              : props.customer?.latitude,
            longitude: location?.longitude
              ? location?.longitude
              : props.customer?.longitude,
          },
          id!
        );
        closeModal();
      }
    } catch (error) {
      ToastAndroid.show("No se modifico el registro", ToastAndroid.LONG);
      closeModal();
    }
  };

  return (
    <>
      <StatusBar style="light" />
      <Formik
        onSubmit={isUpdate ? onSubmitUpdate : onSubmit}
        validationSchema={validationSchema}
        initialValues={initialValues}
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
            <SafeAreaView style={stylesGlobals.safeAreaForm}>
              <View
                style={{
                  margin: 20,
                  bottom: 45,
                }}
              >
                <Text style={{ fontSize: 14 }}>Cliente normal</Text>
              </View>
              <View
                style={{
                  bottom: 60,
                  height: "100%",
                  margin: 10,
                }}
              >
                <View style={{ height: "80%", marginBottom: 5 }}>
                  <ScrollView>
                    <Text style={stylesGlobals.textInput}>
                      Nombre <Text style={{ color: "#EF4444" }}>*</Text>
                    </Text>
                    <Input
                      handleBlur={handleBlur("nombre")}
                      onChangeText={handleChange("nombre")}
                      placeholder="Ingresa nombres"
                      icon={"account"}
                    />
                    {errors.nombre && touched.nombre && (
                      <Text style={{ color: "#EF4444", marginBottom: 5 }}>
                        {errors.nombre}
                      </Text>
                    )}
                    <Text style={stylesGlobals.textInput}>
                      Correo electrónico:
                      <Text style={{ color: "#EF4444" }}>*</Text>
                    </Text>
                    <Input
                      handleBlur={handleBlur("correo")}
                      onChangeText={handleChange("correo")}
                      placeholder="example@gmail.com"
                      values={values.correo}
                      defaultValue={props.customer?.correo}
                      keyboardType="email-address"
                      icon={"gmail"}
                    />
                    {errors.correo && touched.correo && (
                      <Text style={{ color: "#EF4444", marginBottom: 5 }}>
                        {errors.correo}
                      </Text>
                    )}
                    {/* <Text style={stylesGlobals.labelStyle}>
                      Teléfono:
                      <Text style={stylesGlobals.styleRequired}>*</Text>
                    </Text>
                    <Input
                      style={stylesGlobals.input}
                      value={values.telefono}
                      onBlur={handleBlur("telefono")}
                      onChangeText={handleChange("telefono")}
                      placeholder="0000 0000"
                      aria-labelledby="inputLabel"
                      defaultValue={props.customer?.telefono}
                      keyboardType="numeric"
                    />
                    {errors.telefono && touched.telefono && (
                      <Text style={stylesGlobals.errorText}>
                        {errors.telefono}
                      </Text>
                    )}
                    <Text style={stylesGlobals.labelStyle}>
                      Tipo de documento:
                      <Text style={stylesGlobals.styleRequired}>*</Text>
                    </Text>
                    <View style={stylesGlobals.styleViewDropdown}>
                      <Dropdown
                        style={[
                          isFocusDoc && {
                            ...stylesGlobals.isFocusDropdown,
                          },
                        ]}
                        placeholderStyle={stylesGlobals.placeholderStyle}
                        selectedTextStyle={stylesGlobals.selectedTextStyle}
                        inputSearchStyle={stylesGlobals.inputSearchStyle}
                        iconStyle={stylesGlobals.iconStyle}
                        data={cat_022_tipo_de_documento_de_ide}
                        itemTextStyle={{
                          fontSize: 16,
                        }}
                        search
                        maxHeight={250}
                        labelField="valores"
                        valueField="codigo"
                        placeholder={
                          props.customer?.tipoDocumento
                            ? `${name}`
                            : "..." && !isFocusDoc
                            ? "Selecciona un tipo de documento"
                            : "..."
                        }
                        searchPlaceholder="Escribe para buscar..."
                        value={values.tipoDocumento}
                        onFocus={() => setIsFocusDoc(true)}
                        onBlur={() => setIsFocusDoc(false)}
                        onChange={(tipoDocumento) => {
                          handleChange("tipoDocumento")(tipoDocumento.codigo);
                          // handleChange("tipoDocumento")(setNameTypeDocu);
                          setNameTypeDocu(tipoDocumento.valores);
                          setIsFocusDoc(false);
                        }}
                        renderLeftIcon={() => (
                          <AntDesign
                            style={stylesGlobals.icon}
                            color={isFocusDoc ? "blue" : "black"}
                            name="Safety"
                            size={20}
                          />
                        )}
                      />
                      {errors.tipoDocumento && touched.tipoDocumento && (
                        <Text style={{ color: "red", left: "2%" }}>
                          {errors.tipoDocumento}
                        </Text>
                      )}
                    </View>
                    <Text style={stylesGlobals.labelStyle}>
                      Número de documento:
                      <Text style={stylesGlobals.styleRequired}>*</Text>
                    </Text>
                    <Input
                      style={stylesGlobals.input}
                      value={values.numDocumento}
                      defaultValue={props.customer?.numDocumento}
                      onBlur={handleBlur("numDocumento")}
                      onChangeText={handleChange("numDocumento")}
                      placeholder={
                        nameTypeDocu === "DUI"
                          ? "123456789"
                          : "00000000" && nameTypeDocu === "NIT"
                          ? "0143-012345-600-1"
                          : "00000000"
                      }
                      aria-labelledby="inputLabel"
                      keyboardType={tipeKeyboard ? "numeric" : "default"}
                    />
                    {errors.numDocumento && touched.numDocumento && (
                      <Text style={stylesGlobals.errorText}>
                        {errors.numDocumento}
                      </Text>
                    )}

                    <Text style={stylesGlobals.labelStyle}>
                      Departamento:
                      <Text style={stylesGlobals.styleRequired}>*</Text>
                    </Text>
                    <View style={stylesGlobals.styleViewDropdown}>
                      <Dropdown
                        style={[
                          isFocusDepart && {
                            ...stylesGlobals.isFocusDropdown,
                          },
                        ]}
                        placeholderStyle={stylesGlobals.placeholderStyle}
                        selectedTextStyle={stylesGlobals.selectedTextStyle}
                        inputSearchStyle={stylesGlobals.inputSearchStyle}
                        iconStyle={stylesGlobals.iconStyle}
                        data={cat_012_departamento}
                        itemTextStyle={{
                          fontSize: 16,
                        }}
                        search
                        maxHeight={250}
                        labelField="valores"
                        valueField="id"
                        placeholder={
                          props.customer_direction?.departamento
                            ? `${props.customer_direction.nombreDepartamento}`
                            : "..." && !isFocusDepart
                            ? "Selecciona un departamento"
                            : "..."
                        }
                        searchPlaceholder="Escribe para buscar..."
                        value={props.customer_direction?.nombreDepartamento}
                        onFocus={() => setIsFocusDepart(true)}
                        onBlur={() => setIsFocusDepart(false)}
                        onChange={(departamento) => {
                          handleChange("departamento")(departamento.codigo);
                          handleChange("nombreDepartamento")(
                            departamento.valores
                          );
                          setSelectedCodeDep(departamento.codigo);
                          setIsFocusDepart(false);
                        }}
                        renderLeftIcon={() => (
                          <AntDesign
                            style={stylesGlobals.icon}
                            color={isFocusDepart ? "blue" : "black"}
                            name="Safety"
                            size={20}
                          />
                        )}
                      />
                    </View>
                    <Text style={stylesGlobals.labelStyle}>
                      Municipios:
                      <Text style={stylesGlobals.styleRequired}>*</Text>
                    </Text>
                    <View style={stylesGlobals.styleViewDropdown}>
                      <Dropdown
                        style={[
                          isFocusMuni && {
                            ...stylesGlobals.isFocusDropdown,
                          },
                        ]}
                        placeholderStyle={stylesGlobals.placeholderStyle}
                        selectedTextStyle={stylesGlobals.selectedTextStyle}
                        inputSearchStyle={stylesGlobals.inputSearchStyle}
                        iconStyle={stylesGlobals.iconStyle}
                        data={cat_013_municipios}
                        itemTextStyle={{
                          fontSize: 16,
                        }}
                        search
                        maxHeight={250}
                        labelField="valores"
                        valueField="id"
                        placeholder={
                          props.customer_direction?.municipio
                            ? `${props.customer_direction.nombreMunicipio}`
                            : "..." && !isFocusMuni
                            ? "Selecciona un municipio"
                            : "..."
                        }
                        searchPlaceholder="Escribe para buscar..."
                        value={props.customer_direction?.nombreMunicipio}
                        onFocus={() => setIsFocusMuni(true)}
                        onBlur={() => setIsFocusMuni(false)}
                        onChange={(item) => {
                          handleChange("municipio")(item.codigo);
                          handleChange("nombreMunicipio")(item.valores);
                          setIsFocusMuni(false);
                        }}
                        renderLeftIcon={() => (
                          <AntDesign
                            style={stylesGlobals.icon}
                            color={isFocusMuni ? "blue" : "black"}
                            name="Safety"
                            size={20}
                          />
                        )}
                      />
                    </View>

                    <Text style={stylesGlobals.labelStyle}>
                      Complemento
                      <Text style={stylesGlobals.styleRequired}>*</Text>
                    </Text>
                    <Input
                      style={stylesGlobals.input}
                      value={values.directionCustomer?.complemento}
                      defaultValue={props.customer_direction?.complemento}
                      onBlur={handleBlur("complemento")}
                      onChangeText={handleChange("complemento")}
                      placeholder="Ingrese el complemento"
                      aria-labelledby="inputLabel"
                    /> */}

                    <Button
                      Title="Marcar ubicación"
                      onPress={() => setShowModal(true)}
                      color={theme.colors.warning}
                    />
                  </ScrollView>
                </View>
                <Button Title="Guardar" onPress={() => handleSubmit()} />
              </View>
            </SafeAreaView>
          </>
        )}
      </Formik>
      <Modal visible={showModal} animationType="slide">
        <SaveLocations setShowModal={setShowModal} setLocation={setLocation} />
      </Modal>
    </>
  );
};

export default AddClientsNormal;

const styles = StyleSheet.create({
  icon: {
    marginRight: 5,
    marginLeft: 10,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 16,
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
    top: 10,
    right: 5,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  card: {
    marginBottom: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    padding: 6,
    margin: 3,
  },
  input: {
    height: 45,
    borderColor: "#D9D9DA",
    borderWidth: 1,
    borderRadius: 5,
  },
  inputWrapper: {
    position: "relative",
    width: "100%",
    height: 50,
    justifyContent: "center",
    marginBottom: 15,
  },
});
