import { get_user } from "@/plugins/async_storage";
import { useBillingStore } from "@/store/billing/billing.store";
import { useCustomerStore } from "@/store/customer.store";
import {
  CustomerDirection,
  IPayloadCustomer,
} from "@/types/customer/customer.types";
import { UserLogin } from "@/types/user/user.types";
import { useFocusEffect } from "expo-router";
import React, { useContext, useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { Formik } from "formik";
import { ScrollView } from "react-native-gesture-handler";
import { View, Text, StyleSheet, Modal, ToastAndroid } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dropdown } from "react-native-element-dropdown";
import { AntDesign } from "@expo/vector-icons";
import { ThemeContext } from "@/hooks/useTheme";
import SaveLocations from "../save_locations/SaveLocations";
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
  const [isUser, setUser] = useState<UserLogin | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [location, setLocation] = useState<{ latitude: ""; longitude: "" }>();
  const { PostCustomer, UpdateCustomer } = useCustomerStore();
  const { theme } = useContext(ThemeContext);
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

  useEffect(() => {
    OnGetCat012Departamento();
    OnGetCat022TipoDeDocumentoDeIde();
    UpdateConst();
    fetchData();
  }, [props.customer?.tipoDocumento]);

  const UpdateConst = () => {
    if (id) {
      setIsUpdate(true);
    }
  };

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

  const fetchData = async () => {
    const userData = await get_user();
    setUser(userData);
  };

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
                <View style={{ height: "92%", marginBottom: 5 }}>
                  <ScrollView>
                    <Text style={stylesGlobals.textInput}>
                      Nombre <Text style={{ color: "#EF4444" }}>*</Text>
                    </Text>
                    <Input
                      handleBlur={handleBlur("nombre")}
                      onChangeText={handleChange("nombre")}
                      placeholder="Ingresa nombres"
                      icon={"account"}
                      values={values.nombre}
                      defaultValue={props.customer?.nombre}
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
                    <Text style={stylesGlobals.textInput}>
                      Teléfono:
                      <Text style={{ color: "#EF4444" }}>*</Text>
                    </Text>
                    <Input
                      handleBlur={handleBlur("telefono")}
                      onChangeText={handleChange("telefono")}
                      placeholder="0000 0000"
                      values={values.telefono}
                      defaultValue={props.customer?.telefono}
                      keyboardType="numeric"
                      icon={"phone"}
                    />
                    {errors.telefono && touched.telefono && (
                      <Text style={{ color: "#EF4444", marginBottom: 5 }}>
                        {errors.telefono}
                      </Text>
                    )}
                    <Text style={stylesGlobals.textInput}>
                      Tipo de documento:
                      <Text style={{ color: "#EF4444" }}>*</Text>
                    </Text>
                    <Dropdown
                      style={[
                        isFocusDoc ? stylesGlobals.isFocusStyles : {},
                        { ...stylesGlobals.styleDropdown },
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
                      labelField="valores"
                      valueField="codigo"
                      maxHeight={250}
                      placeholder={
                        props.customer?.tipoDocumento
                          ? `${props.customer.tipoDocumento}`
                          : "..." && !isFocusDoc
                          ? "Selecciona un tipo de documento"
                          : "..."
                      }
                      value={values.tipoDocumento}
                      onFocus={() => setIsFocusDoc(true)}
                      onBlur={() => setIsFocusDoc(false)}
                      onChange={(tipoDocumento) => {
                        handleChange("tipoDocumento")(tipoDocumento.codigo);
                        setIsFocusDoc(false);
                      }}
                      renderLeftIcon={() => (
                        <AntDesign
                          style={stylesGlobals.renderLeftIcon}
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

                    <Text style={stylesGlobals.textInput}>
                      Número de documento:
                      <Text style={{ color: "#EF4444" }}>*</Text>
                    </Text>
                    <Input
                      values={values.numDocumento}
                      defaultValue={props.customer?.numDocumento}
                      handleBlur={handleBlur("numDocumento")}
                      onChangeText={handleChange("numDocumento")}
                      placeholder={"000000000000"}
                      aria-labelledby="inputLabel"
                      keyboardType="numeric"
                      icon={"card"}
                    />
                    {errors.numDocumento && touched.numDocumento && (
                      <Text style={{ color: "red", left: "2%" }}>
                        {errors.numDocumento}
                      </Text>
                    )}
                    <Text style={stylesGlobals.textInput}>
                      Departamento:
                      <Text style={{ color: "#EF4444" }}>*</Text>
                    </Text>
                    <Dropdown
                      style={[
                        isFocusDepart ? stylesGlobals.isFocusStyles : {},
                        { ...stylesGlobals.styleDropdown },
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
                      labelField="valores"
                      valueField="codigo"
                      maxHeight={250}
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
                          style={stylesGlobals.renderLeftIcon}
                          color={isFocusDepart ? "blue" : "black"}
                          name="Safety"
                          size={20}
                        />
                      )}
                    />

                    <Text style={stylesGlobals.textInput}>
                      Municipios:
                      <Text style={{ color: "#EF4444" }}>*</Text>
                    </Text>
                    <Dropdown
                      style={[
                        isFocusMuni ? stylesGlobals.isFocusStyles : {},
                        { ...stylesGlobals.styleDropdown },
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
                      labelField="valores"
                      valueField="codigo"
                      maxHeight={250}
                      placeholder={
                        props.customer_direction?.municipio
                          ? `${props.customer_direction.nombreMunicipio}`
                          : "..." && !isFocusDepart
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
                          style={stylesGlobals.renderLeftIcon}
                          color={isFocusMuni ? "blue" : "black"}
                          name="Safety"
                          size={20}
                        />
                      )}
                    />
                    <Text style={stylesGlobals.textInput}>
                      Complemento <Text style={{ color: "#EF4444" }}>*</Text>
                    </Text>
                    <Input
                      handleBlur={handleBlur("complemento")}
                      onChangeText={handleChange("complemento")}
                      placeholder="Ingresa un complemento"
                      icon={"clipboard-outline"}
                      values={values.directionCustomer?.complemento}
                      defaultValue={props.customer_direction?.complemento}
                    />

                    <Button
                      Title="Marcar ubicación"
                      onPress={() => setShowModal(true)}
                      color={theme.colors.warning}
                    />
                    <View
                      style={{
                        right: 10,
                      }}
                    >
                      <Button
                        Title="Guardar"
                        withB={340}
                        onPress={() => handleSubmit()}
                      />
                    </View>
                  </ScrollView>
                </View>
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
