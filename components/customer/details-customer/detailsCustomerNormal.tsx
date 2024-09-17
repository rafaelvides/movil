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
import { useContext, useEffect, useMemo, useState } from "react";
import { View, Text, SafeAreaView, ScrollView } from "react-native";

interface Props {
  closeModal: () => void;
  customer?: IPayloadCustomer;
  customer_direction?: CustomerDirection;
  id: number;
  id_direction?: number;
}

export const DetailsCustomerNormal = (props: Props) => {
  const { theme } = useContext(ThemeContext);
  const { customer_list, OnGetCustomersList } = useCustomerStore();
  const { OnGetCat022TipoDeDocumentoDeIde, cat_022_tipo_de_documento_de_ide } =
    useBillingStore();

  useEffect(() => {
    OnGetCat022TipoDeDocumentoDeIde();
    OnGetCustomersList();
  }, []);

  
  const customer = useMemo(() => {
    return customer_list.find((item) => item.id === props.id);
  }, [customer_list, props.id]);

  const typeDocument = useMemo(()=>{
    return cat_022_tipo_de_documento_de_ide.find((item)=> item.codigo === customer?.tipoDocumento)
  },[])


  return (
    <>
      <StatusBar style="light" backgroundColor={theme.colors.dark} />

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
            {`Detalles cliente ${
              customer?.esContribuyente ? "contribuyente" : "normal"
            }`}
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
                {customer?.nombre}
              </Text>
            </View>

            {customer?.esContribuyente && (
              <View style={stylesGlobals.viewInMaterial}>
                <MaterialCommunityIcons
                  name="card-account-details"
                  color={theme.colors.secondary}
                  size={30}
                  style={stylesGlobals.iconsStyles}
                />
                <Text style={stylesGlobals.textIconStyle}>
                  {customer?.nombreComercial}
                </Text>
              </View>
            )}

            <View style={stylesGlobals.viewInMaterial}>
              <MaterialCommunityIcons
                name="email-outline"
                color={theme.colors.secondary}
                size={30}
                style={stylesGlobals.iconsStyles}
              />
              <Text style={stylesGlobals.textIconStyle}>
                {customer?.correo}
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
                {customer?.telefono}
              </Text>
            </View>
            <View style={stylesGlobals.viewInMaterial}>
              <MaterialCommunityIcons
                name="card-text"
                color={theme.colors.secondary}
                size={30}
                style={stylesGlobals.iconsStyles}
              />
              <Text style={stylesGlobals.textIconStyle}>
                {typeDocument?.valores}
              </Text>
            </View>

            <View style={stylesGlobals.viewInMaterial}>
              <MaterialCommunityIcons
                name="checkbook"
                color={theme.colors.secondary}
                size={30}
                style={stylesGlobals.iconsStyles}
              />
              <Text style={stylesGlobals.textIconStyle}>
                {customer?.numDocumento}
              </Text>
            </View>

            {customer?.esContribuyente && (
              <View style={stylesGlobals.viewInMaterial}>
                <MaterialCommunityIcons
                  name="card-bulleted"
                  color={theme.colors.secondary}
                  size={30}
                  style={stylesGlobals.iconsStyles}
                />
                <Text style={stylesGlobals.textIconStyle}>
                  {`NRC: ${customer?.nrc}`}
                </Text>
              </View>
            )}

            {customer?.esContribuyente && (
              <View style={stylesGlobals.viewInMaterial}>
                <MaterialCommunityIcons
                  name="book-open"
                  color={theme.colors.secondary}
                  size={30}
                  style={stylesGlobals.iconsStyles}
                />
                <Text style={stylesGlobals.textIconStyle}>
                  {customer?.descActividad}
                </Text>
              </View>
            )}
            {customer?.esContribuyente && (
              <View style={stylesGlobals.viewInMaterial}>
                <MaterialCommunityIcons
                  name="checkbox-marked"
                  color={theme.colors.secondary}
                  size={30}
                  style={stylesGlobals.iconsStyles}
                />
                <Text style={stylesGlobals.textIconStyle}>
                  {customer?.tipoContribuyente}
                </Text>
              </View>
            )}

            <View style={stylesGlobals.viewInMaterial}>
              <MaterialCommunityIcons
                name="card-bulleted-outline"
                color={theme.colors.secondary}
                size={30}
                style={stylesGlobals.iconsStyles}
              />
              <Text style={stylesGlobals.textIconStyle}>
                {customer?.direccion.nombreDepartamento}
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
                {customer?.direccion.nombreMunicipio}
              </Text>
            </View>
            <View style={{ ...stylesGlobals.viewInMaterial, marginBottom: 30 }}>
              <MaterialCommunityIcons
                name="clipboard-outline"
                color={theme.colors.secondary}
                size={30}
                style={stylesGlobals.iconsStyles}
              />
              <Text style={stylesGlobals.textIconStyle}>
                {customer?.direccion.complemento}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </>
  );
};
