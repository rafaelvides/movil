import { get_user } from "../../plugins/async_storage";
import { useBillingStore } from "@/store/billing/billing.store";
import { useCustomerStore } from "../../store/customer.store";
import {
  CustomerDirection,
  ICustomer,
  IPayloadCustomer,
} from "@/types/customer/customer.types";
import { AntDesign } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Modal,
  ToastAndroid,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import * as yup from "yup";
import { Formik } from "formik";
import { ScrollView } from "react-native-gesture-handler";
import { UserLogin } from "../../types/user/user.types";
import { ThemeContext } from "@/hooks/useTheme";
import SaveLocations from "../save_locations/SaveLocations";
import stylesGlobals from "../Global/styles/StylesAppComponents";
import Input from "../Global/components_app/Input";
import Button from "../Global/components_app/Button";

interface Props {
  closeModal: () => void;
  customer?: IPayloadCustomer;
  customer_direction?: CustomerDirection;
  id: number;
}

function AddClientContributor(props: Props) {
  const [showModalLocation, setShowModalLocation] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [isFocusDepart, setIsFocusDepart] = useState(false);
  const [isFocusMuni, setIsFocusMuni] = useState(false);
  const [isFocusDoc, setIsFocusDoc] = useState(false);
  const [isUser, setUser] = useState<UserLogin | undefined>(undefined);
  const [isFocusType, setIsFocusType] = useState(false);
  const [location, setLocation] = useState<{ latitude: ""; longitude: "" }>();
  const { theme } = useContext(ThemeContext);
  const { PostCustomer, UpdateCustomer , customers} = useCustomerStore();

  const initialValues = {
    nombre: props.customer?.nombre ?? "",
    nombreComercial: props.customer?.nombreComercial ?? "",
    correo: props.customer?.correo ?? "",
    telefono: props.customer?.telefono ?? "",
    numDocumento: props.customer?.numDocumento ?? "",
    nrc: props.customer?.nrc ?? "",
    tipoDocumento: props.customer?.tipoDocumento ?? "",
    bienTitulo: "05",
    codActividad: props.customer?.codActividad ?? "",
    esContribuyente: 1,
    descActividad: props.customer?.descActividad ?? "",
    municipio: props.customer_direction?.municipio ?? "",
    nombreMunicipio: props.customer_direction?.nombreMunicipio ?? "",
    departamento: props.customer_direction?.departamento ?? "",
    nombreDepartamento: props.customer_direction?.nombreDepartamento ?? "",
    tipoContribuyente: props.customer?.tipoContribuyente ?? "",
    complemento: props.customer_direction?.complemento ?? "",
  }
  const {
    OnGetCat012Departamento,
    cat_012_departamento,
    OnGetCat013Municipios,
    cat_013_municipios,
    OnGetCat019CodigoActividadEconomica,
    cat_019_codigo_de_actividad_economica,
    OnGetCat022TipoDeDocumentoDeIde,
    cat_022_tipo_de_documento_de_ide,
  } = useBillingStore();

  const validationSchema = yup.object().shape({
    nombre: yup.string().required("**El nombre es requerido**"),
    nombreComercial: yup
      .string()
      .required("**El nombre comercial es requerido**"),
    correo: yup
      .string()
      .required("**El correo es requerido**")
      .email("**El correo es invalido**"),
    telefono: yup.string().required("**El teléfono es requerido**"),
    tipoDocumento: yup
      .string()
      .required("*El tipo de documento es requerido*")
      .test((tipoDocumento) => {
        if (tipoDocumento) {
          return true;
        }
      }),
      tipoContribuyente: yup
      .string()
      .required("**El tipo de contribuyente es requerido**")
      .test((tipoContribuyente)=>{
        if(tipoContribuyente){
          return true
        }
      }),
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
    nrc: yup
      .string()
      .required("**El NRC es requerido**")
      .matches(/^[0-9]{1,8}$/, "**El NRC no es valido**"),
    codActividad: yup
      .string()
      .required("**La actividad es requerida**")
      .matches(/^[0-9]{2,6}$/, "**La actividad no es valida**"),
    departamento: yup
      .string()
      .required("**Debes seleccionar el departamento**")
      .test((departamento)=>{
        if(departamento){
          return true
        }
      }),
    municipio: yup.string().required("**Debes seleccionar el municipio**")
    .test((municipio)=>{
      if(municipio){
        return true
      }
    }),
    complemento: yup.string().required("**El complemento es requerido"),
  });

  const [selectedCodeDep, setSelectedCodeDep] = useState(
    props.customer_direction?.departamento ?? "0"
  );

  useFocusEffect(
    React.useCallback(() => {
      if (props.customer_direction?.municipio) {
        OnGetCat013Municipios(props.customer_direction.departamento.toString());
      }
    }, [props.customer_direction?.municipio])
  );

  useEffect(() => {
    OnGetCat012Departamento();
    OnGetCat019CodigoActividadEconomica();
    OnGetCat022TipoDeDocumentoDeIde();
    dataUser();
    constUpdate();
  }, [props.customer?.tipoDocumento]);

  const dataUser = () => {
    get_user().then((data) => {
      if (data) {
        setUser(data);
      }
    });
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

  const constUpdate = () => {
    if (props.id) {
      setIsUpdate(true);
    } else {
      setIsUpdate(false);
    }
  };

  const typeOfTaxpayer = [
    { key: "Gran Contribuyente" },
    { key: "Mediano Contribuyente" },
  ];

  const onSubmit = async (payload: IPayloadCustomer) => {
    try {
      await PostCustomer({
        ...payload,
        esContribuyente: 1,
        transmitterId: isUser?.transmitterId,
        latitude: location?.latitude ?? "0",
        longitude: location?.longitude ?? "0",
      });

      props.closeModal();
    } catch (error) {
      ToastAndroid.show("Error al crear el cliente", ToastAndroid.LONG);
    }
  };

  const onSubmitUpdate = async (payload: IPayloadCustomer) => {
    try {
      if (props.id || props.id !== 0) {
        await UpdateCustomer(
          {
            ...payload,
            esContribuyente: 1,
            transmitterId: isUser?.transmitterId,
            latitude: location?.latitude
              ? location?.latitude
              : props.customer?.latitude,
            longitude: location?.longitude
              ? location?.longitude
              : props.customer?.longitude,
          },
          props.id!
        );
        props.closeModal();
      }
    } catch (error) {
      ToastAndroid.show("Error al modificar el registro", ToastAndroid.LONG);
      props.closeModal();
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
                <Text style={{ fontSize: 16 }}>Cliente contribuyente</Text>
              </View>
              <View
                style={{
                  bottom: 60,
                  height: "100%",
                  margin: 10,
                }}
              >
                <View style={{ height: "86%", marginBottom: 5 }}>
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
                      Nombre Comercial{" "}
                      <Text style={{ color: "#EF4444" }}>*</Text>
                    </Text>
                    <Input
                      handleBlur={handleBlur("nombreComercial")}
                      onChangeText={handleChange("nombreComercial")}
                      placeholder="Ingresa el nombre comercial"
                      icon={"card-account-details"}
                      values={values.nombreComercial}
                      defaultValue={props.customer?.nombreComercial}
                    />
                    {errors.nombreComercial && touched.nombreComercial && (
                      <Text style={{ color: "#EF4444", marginBottom: 5 }}>
                        {errors.nombreComercial}
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
                      searchPlaceholder="Escribe para buscar..."
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
                      placeholder={"00000000000"}
                      aria-labelledby="inputLabel"
                      keyboardType={"numeric"}
                      icon={"card"}
                    />
                    {errors.numDocumento && touched.numDocumento && (
                      <Text style={{ color: "red", left: "2%" }}>
                        {errors.numDocumento}
                      </Text>
                    )}
                    <Text style={stylesGlobals.textInput}>
                      NRC:
                      <Text style={{ color: "#EF4444" }}>*</Text>
                    </Text>
                    <Input
                      handleBlur={handleBlur("nrc")}
                      onChangeText={handleChange("nrc")}
                      placeholder="000000000000000"
                      values={values.nrc}
                      defaultValue={props.customer?.nrc}
                      icon={"card-bulleted"}
                    />
                    {errors.nrc && touched.nrc && (
                      <Text style={{ color: "#EF4444", marginBottom: 5 }}>
                        {errors.nrc}
                      </Text>
                    )}
                    <Text style={stylesGlobals.textInput}>
                      Tipo de contribuyente:
                      <Text style={{ color: "#EF4444" }}>*</Text>
                    </Text>
                    <Dropdown
                      style={[
                        isFocusType ? stylesGlobals.isFocusStyles : {},
                        { ...stylesGlobals.styleDropdown },
                      ]}
                      placeholderStyle={stylesGlobals.placeholderStyle}
                      selectedTextStyle={stylesGlobals.selectedTextStyle}
                      inputSearchStyle={stylesGlobals.inputSearchStyle}
                      iconStyle={stylesGlobals.iconStyle}
                      placeholder={
                        props.customer?.tipoContribuyente
                          ? `${props.customer?.tipoContribuyente}`
                          : "..." && !isFocusType
                          ? "Selecciona un tipo de contribuyente"
                          : "..."
                      }
                      searchPlaceholder="Escribe para buscar..."
                      labelField="key"
                      valueField="key"
                      value={values.tipoContribuyente}
                      search
                      maxHeight={250}
                      data={typeOfTaxpayer}
                      onFocus={() => setIsFocusType(true)}
                      onBlur={() => setIsFocusType(false)}
                      onChange={(item) => {
                        handleChange("tipoContribuyente")(item.key);
                        setIsFocusType(false);
                      }}
                      renderLeftIcon={() => (
                        <AntDesign
                          style={stylesGlobals.renderLeftIcon}
                          color={isFocusType ? "blue" : "black"}
                          name="Safety"
                          size={20}
                        />
                      )}
                    />
                     {errors.tipoContribuyente && touched.tipoContribuyente && (
                      <Text style={{ color: "#EF4444", marginBottom: 5 }}>
                        {errors.tipoContribuyente}
                      </Text>
                    )}
                    <Text style={stylesGlobals.textInput}>
                      Actividad económica:
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
                      data={cat_019_codigo_de_actividad_economica}
                      search
                      maxHeight={250}
                      labelField="valores"
                      valueField="id"
                      placeholder={
                        props.customer?.codActividad
                          ? `${props.customer.descActividad}`
                          : "..." && !isFocus
                          ? "Selecciona una actividad economica"
                          : "..."
                      }
                      searchPlaceholder="Escribe para buscar..."
                      value={props.customer?.descActividad}
                      onFocus={() => setIsFocus(true)}
                      onBlur={() => setIsFocus(false)}
                      onChange={(codActividad) => {
                        handleChange("codActividad")(codActividad.codigo);
                        handleChange("descActividad")(codActividad.valores);
                        setIsFocus(false);
                      }}
                      renderLeftIcon={() => (
                        <AntDesign
                          style={stylesGlobals.renderLeftIcon}
                          color={isFocus ? "blue" : "black"}
                          name="Safety"
                          size={20}
                        />
                      )}
                    />
                  {errors.codActividad && touched.codActividad && (
                    <Text style={{ color: "#EF4444", marginBottom: 5 }}>{errors.codActividad}</Text>
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
                     {errors.departamento && touched.departamento && (
                      <Text style={{ color: "#EF4444", marginBottom: 5 }}>
                        {errors.departamento}
                      </Text>
                    )}
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
                     {errors.municipio && touched.municipio && (
                      <Text style={{ color: "#EF4444", marginBottom: 5 }}>
                        {errors.municipio}
                      </Text>
                    )}
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
                      {errors.complemento && touched.complemento && (
                      <Text style={{ color: "#EF4444", marginBottom: 5 }}>
                        {errors.complemento}
                      </Text>
                    )}

                    <Button
                      Title="Marcar ubicación"
                      onPress={() => setShowModalLocation(true)}
                      color={theme.colors.warning}
                    />
                    <View
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        alignContent: 'center',
                      }}
                    >
                      <Button
                        Title="Guardar"
                        // withB={340}
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
      <Modal visible={showModalLocation} animationType="slide">
        <SaveLocations
          setShowModal={setShowModalLocation}
          setLocation={setLocation}
        />
      </Modal>
    </>
  );
}
export default AddClientContributor;

