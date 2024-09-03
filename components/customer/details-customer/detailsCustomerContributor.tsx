import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import { ThemeContext } from "@/hooks/useTheme";
import { useBillingStore } from "@/store/billing/billing.store";
import {
  CustomerDirection,
  IPayloadCustomer,
} from "@/types/customer/customer.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

interface Props {
  closeModal: () => void;
  customer?: IPayloadCustomer;
  customer_direction?: CustomerDirection;
  id: number;
}

export const DetailsCustomerContributor = (props: Props) => {
  const [category, setCategory] = useState<string>("");
  const { theme } = useContext(ThemeContext);
  const { OnGetCat022TipoDeDocumentoDeIde, cat_022_tipo_de_documento_de_ide } =
    useBillingStore();

  useEffect(() => {
    OnGetCat022TipoDeDocumentoDeIde();
  }, [OnGetCat022TipoDeDocumentoDeIde]);

  useEffect(() => {
    const categoryDocument = () => {
      if (props.customer?.tipoDocumento) {
        const categoryData = cat_022_tipo_de_documento_de_ide.find(
          (data) => data.codigo === props.customer?.tipoDocumento
        );
        setCategory(categoryData ? categoryData.valores : "N/A");
      }
    };
    categoryDocument();
  }, [props.customer?.tipoDocumento, cat_022_tipo_de_documento_de_ide]);

  return (
    <>
      <StatusBar style="light" />
      <View
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: theme.colors.dark,
        }}
      >
        <MaterialCommunityIcons
          name="close"
          size={26}
          onPress={() => props.closeModal()}
          color={"white"}
          style={stylesGlobals.materialIconsStyle}
        />
        <View
          style={{
            flexDirection: "row",
          }}
        >
          <Text style={stylesGlobals.titleDetailsCustomer}>
            Detalles cliente contribuyente
          </Text>
        </View>
        <View style={stylesGlobals.viewContent}>
          <ScrollView
            style={{
              marginBottom: 50,
            }}
          >
            <View
              style={stylesGlobals.viewInMaterial}
            >
              <MaterialCommunityIcons
                name="account"
                color={theme.colors.secondary}
                size={30}
                style={stylesGlobals.iconsStyles}
              />
              <Text
                style={stylesGlobals.textIconStyle}
              >
                {props.customer?.nombre}
              </Text>
            </View>
            <View
              style={stylesGlobals.viewInMaterial}
            >
              <MaterialCommunityIcons
                name="card-account-details"
                color={theme.colors.secondary}
                size={30}
                style={stylesGlobals.iconsStyles}
              />
              <Text
                style={stylesGlobals.textIconStyle}
              >
                {props.customer?.nombreComercial}
              </Text>
            </View>

            <View
              style={stylesGlobals.viewInMaterial}
            >
              <MaterialCommunityIcons
                name="email-outline"
                color={theme.colors.secondary}
                size={30}
                style={stylesGlobals.iconsStyles}
              />
              <Text
                style={stylesGlobals.textIconStyle}
              >
                {props.customer?.correo}
              </Text>
            </View>

            <View
              style={stylesGlobals.viewInMaterial}
            >
              <MaterialCommunityIcons
                name="phone"
                color={theme.colors.secondary}
                size={30}
                style={stylesGlobals.iconsStyles}
              />
              <Text
                style={stylesGlobals.textIconStyle}
              >
                {props.customer?.telefono}
              </Text>
            </View>
            <View
              style={stylesGlobals.viewInMaterial}
            >
              <MaterialCommunityIcons
                name="card-text"
                color={theme.colors.secondary}
                size={30}
                style={stylesGlobals.iconsStyles}
              />
              <Text
                style={stylesGlobals.textIconStyle}
              >
                {category}
              </Text>
            </View>
            <View
              style={stylesGlobals.viewInMaterial}
            >
              <MaterialCommunityIcons
                name="checkbook"
                color={theme.colors.secondary}
                size={30}
                style={stylesGlobals.iconsStyles}
              />
              <Text
                style={stylesGlobals.textIconStyle}
              >
                {props.customer?.numDocumento}
              </Text>
            </View>
            <View
              style={stylesGlobals.viewInMaterial}
            >
              <MaterialCommunityIcons
                name="card-bulleted"
                color={theme.colors.secondary}
                size={30}
                style={stylesGlobals.iconsStyles}
              />
              <Text
                style={stylesGlobals.textIconStyle}
              >
                {`NRC: ${props.customer?.nrc}`}
              </Text>
            </View>
            <View
              style={stylesGlobals.viewInMaterial}
            >
              <MaterialCommunityIcons
                name="book-open"
                color={theme.colors.secondary}
                size={30}
                style={stylesGlobals.iconsStyles}
              />
              <Text
                style={stylesGlobals.textIconStyle}
              >
                {props.customer?.descActividad}
              </Text>
            </View>
            <View
              style={stylesGlobals.viewInMaterial}
            >
              <MaterialCommunityIcons
                name="checkbox-marked"
                color={theme.colors.secondary}
                size={30}
                style={stylesGlobals.iconsStyles}
              />
              <Text
                style={stylesGlobals.textIconStyle}
              >
                {props.customer?.tipoContribuyente}
              </Text>
            </View>

            <View
              style={stylesGlobals.viewInMaterial}
            >
              <MaterialCommunityIcons
                name="card-bulleted-outline"
                color={theme.colors.secondary}
                size={30}
                style={stylesGlobals.iconsStyles}
              />
              <Text
                style={stylesGlobals.textIconStyle}
              >
                {props.customer_direction?.nombreDepartamento}
              </Text>
            </View>
            <View
              style={stylesGlobals.viewInMaterial}
            >
              <MaterialCommunityIcons
                name="bank"
                color={theme.colors.secondary}
                size={30}
                style={stylesGlobals.iconsStyles}
              />
              <Text
                style={stylesGlobals.textIconStyle}
              >
                {props.customer_direction?.nombreMunicipio}
              </Text>
            </View>
            <View
              style={{...stylesGlobals.viewInMaterial, marginBottom:30}}
            >
              <MaterialCommunityIcons
                name="clipboard-outline"
                color={theme.colors.secondary}
                size={30}
                style={stylesGlobals.iconsStyles}
              />
              <Text
                style={stylesGlobals.textIconStyle}
              >
                {props.customer_direction?.complemento}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
    backgroundColor: "white",
    borderRadius: 50,
    padding: 10,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginVertical: 20,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  icon: {
    marginRight: 15,
  },
  detailText: {
    color: "#555",
    fontSize: 16,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 20,
  },
});
