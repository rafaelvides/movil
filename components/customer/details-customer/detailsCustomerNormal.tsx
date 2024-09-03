import customer from "@/app/customer";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import { ThemeContext } from "@/hooks/useTheme";
import { useBillingStore } from "@/store/billing/billing.store";
import { useCustomerStore } from "@/store/customer.store";
import {
  CustomerDirection,
  IPayloadCustomer,
} from "@/types/customer/customer.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useContext, useEffect, useState } from "react";
import { View, Text, SafeAreaView, ScrollView } from "react-native";

interface Props {
  closeModal: () => void;
  customer?: IPayloadCustomer;
  customer_direction?: CustomerDirection;
  id: number;
}

export const DetailsCustomerNormal = (props: Props) => {
  const [showModal, setShowModal] = useState(false);
  const { theme } = useContext(ThemeContext);
  const [category, setCategory] = useState("");
  const { OnGetCat022TipoDeDocumentoDeIde, cat_022_tipo_de_documento_de_ide } =
    useBillingStore();

  useEffect(() => {
    OnGetCat022TipoDeDocumentoDeIde();
  }, []);

  const categoryDocument = async () => {
    if (props.customer?.tipoDocumento) {
      await cat_022_tipo_de_documento_de_ide.map((data) => {
        if (props.customer?.tipoDocumento) {
          if (props.customer.tipoDocumento === data.codigo) {
            setCategory(data.valores);
          }
        }
      });
    }
  };

  useEffect(() => {
    categoryDocument();
  }, [props.customer?.tipoDocumento, category]);

  return (
    <>
      <StatusBar style="dark" />
      <View
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: theme.colors.dark,
        }}
      >
        <MaterialCommunityIcons
          name="close"
          color={"white"}
          onPress={() => props.closeModal()}
          size={26}
          style={stylesGlobals.materialIconsStyle}
        />

        <View
          style={{
            flexDirection: "row",
          }}
        >
          <Text style={stylesGlobals.titleDetailsCustomer}>
            Detalles cliente normal
          </Text>
        </View>
        <View style={stylesGlobals.viewContent}>
        <ScrollView 
         style={{
          marginBottom: 50,
        }}
        >
          <View style={stylesGlobals.viewInMaterial}>
            <MaterialCommunityIcons
              name="account"
              color={theme.colors.secondary}
              size={30}
              style={stylesGlobals.iconsStyles}
            />
            <Text style={stylesGlobals.textIconStyle}>
              {props.customer?.nombre}
            </Text>
          </View>

          <View style={stylesGlobals.viewInMaterial}>
            <MaterialCommunityIcons
              name="email-outline"
              color={theme.colors.secondary}
              size={30}
              style={stylesGlobals.iconsStyles}
            />
            <Text style={stylesGlobals.textIconStyle}>
              {props.customer?.correo}
            </Text>
          </View>

          <View style={stylesGlobals.viewInMaterial}>
            <MaterialCommunityIcons
              name="phone"
              color={theme.colors.secondary}
              size={30}
              style={stylesGlobals.iconsStyles}
            />
            <Text style={stylesGlobals.textIconStyle}>
              {props.customer?.telefono}
            </Text>
          </View>
          <View style={stylesGlobals.viewInMaterial}>
            <MaterialCommunityIcons
              name="card-text"
              color={theme.colors.secondary}
              size={30}
              style={stylesGlobals.iconsStyles}
            />
            <Text style={stylesGlobals.textIconStyle}>{category}</Text>
          </View>
          <View style={stylesGlobals.viewInMaterial}>
            <MaterialCommunityIcons
              name="checkbook"
              color={theme.colors.secondary}
              size={30}
              style={stylesGlobals.iconsStyles}
            />
            <Text style={stylesGlobals.textIconStyle}>
              {props.customer?.numDocumento}
            </Text>
          </View>
          <View style={stylesGlobals.viewInMaterial}>
            <MaterialCommunityIcons
              name="card-bulleted-outline"
              color={theme.colors.secondary}
              size={30}
              style={stylesGlobals.iconsStyles}
            />
            <Text style={stylesGlobals.textIconStyle}>
              {props.customer_direction?.nombreDepartamento}
            </Text>
          </View>
          <View style={stylesGlobals.viewInMaterial}>
            <MaterialCommunityIcons
              name="bank"
              color={theme.colors.secondary}
              size={30}
              style={stylesGlobals.iconsStyles}
            />
            <Text style={stylesGlobals.textIconStyle}>
              {props.customer_direction?.nombreMunicipio}
            </Text>
          </View>
          <View style={{...stylesGlobals.viewInMaterial, marginBottom:30}}>
            <MaterialCommunityIcons
              name="clipboard-outline"
              color={theme.colors.secondary}
              size={30}
              style={stylesGlobals.iconsStyles}
            />
            <Text style={stylesGlobals.textIconStyle}>
              {props.customer_direction?.complemento}
            </Text>
          </View>
          </ScrollView>

        </View>
        
      </View>
    </>
  );
};
