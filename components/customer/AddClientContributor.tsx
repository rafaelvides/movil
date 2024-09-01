import { get_user } from "../../plugins/async_storage";
import { useBillingStore } from "@/store/billing/billing.store";
import { useCustomerStore } from "../../store/customer.store";
import {
  CustomerDirection,
  IPayloadCustomer,
} from "@/types/customer/customer.types";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Modal,
  ToastAndroid,
  ProgressBarAndroidComponent,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import * as yup from "yup";
import { Formik } from "formik";
import { ScrollView } from "react-native-gesture-handler";
import { UserLogin } from "../../types/user/user.types";
import { ThemeContext } from "@/hooks/useTheme";
import SaveLocations from "../save_locations/SaveLocations";
import of_customers from "@/app/(inventory)/of_customers";
import { isReadable } from "stream";
import { DriverOptionNotSetError } from "typeorm/browser";

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
  const [typeDocument, setTypeDocument] = useState(false);
  const [nameTypeDocument, setNameTypeDocument] = useState("default");
  const [isSelectedDepartment, setSelectedDepartment] = useState(0);
  const [isUser, setUser] = useState<UserLogin | undefined>(undefined);
  const [isFocusType, setIsFocusType] = useState(false);
  const [isTypeOfTaxpayer, setTypeOfTaxpayer] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [location, setLocation] = useState<{ latitude: ""; longitude: "" }>();
  const { theme } = useContext(ThemeContext);
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
  };
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
      .required("**Debes seleccionar el departamento**"),
    municipio: yup.string().required("**Debes seleccionar el municipio**"),
    complemento: yup.string().required("**Es requerido"),
  });

  const [selectedCodeDep, setSelectedCodeDep] = useState(
    props.customer_direction?.departamento ?? "0"
  );

  const [nameDocument, setNameDocument] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      if (props.customer_direction?.municipio) {
        OnGetCat013Municipios(isSelectedDepartment.toString());
      }
    }, [props.customer_direction?.municipio])
  );

  const selectedTypeDocument = () => {
    if (nameTypeDocument === "DUI" || nameTypeDocument === "NIT") {
      setTypeDocument(true);
    } else if (
      nameTypeDocument === "Otro" ||
      nameTypeDocument === "Pasaporte" ||
      nameTypeDocument === "Carnet de Extranjería"
    ) {
      setTypeDocument(false);
    }
    if (nameTypeDocument === "default") {
      if (
        props.customer?.tipoDocumento === "36" ||
        props.customer?.tipoDocumento === "13"
      ) {
        setTypeDocument(true);
      }
    }
  };

  useEffect(() => {
    const isNameDocument = (code: string) => {
      if (props.customer?.tipoDocumento) {
        cat_022_tipo_de_documento_de_ide.map((item) => {
          if (item.codigo === code) {
            setNameDocument(item.valores);
          }
        });
      } else {
        setNameDocument("");
      }
    };
    isNameDocument(props.customer?.tipoDocumento ?? "");
  }, [props.customer?.tipoDocumento]);

  useEffect(() => {
    OnGetCat012Departamento();
    OnGetCat019CodigoActividadEconomica();
    OnGetCat022TipoDeDocumentoDeIde();
    selectedTypeDocument();
  }, [nameTypeDocument]);

  useEffect(() => {
    get_user().then((data) => {
      if (data) {
        setUser(data);
      } else {
        setUser(undefined);
      }
    });
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

  const { PostCustomer, UpdateCustomer } = useCustomerStore();

  useEffect(() => {
    if (props.id) {
      setIsUpdate(true);
    } else {
      setIsUpdate(false);
    }
  }, []);

  const typeOfTaxpayer = [
    { key: "Gran Contribuyente" },
    { key: "Mediano Contribuyente" },
  ];

  const handleTypeTaxpayer = (key: string) => {
    setTypeOfTaxpayer(key);
  };

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
      <StatusBar style="light" />
      <Formik
        // onSubmit={onSubmit}
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
            <View
              style={{
                height: "100%",
                width: "100%",
              }}
            >
             
            </View>
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

const styles = StyleSheet.create({
  icon: {
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
