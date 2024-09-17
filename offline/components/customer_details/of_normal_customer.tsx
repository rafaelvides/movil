import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import { useClientOfflineStore } from "@/offline/store/customer_offline.store";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { useEffect, useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
const Of_normal_customer = ({
  id,
  closeModal,
}: {
  id: number;
  closeModal: () => void;
}) => {
  const { clientList, OnGetClientsList } = useClientOfflineStore();

  const ArrayTypeDocument = [
    { id: "36", name: "NIT" },
    { id: "13", name: "DUI" },
    { id: "37", name: "Otro" },
    { id: "03", name: "Pasaporte" },
    { id: "02", name: "Carnet de Residente" },
  ];

  useEffect(() => {
    OnGetClientsList();
  }, []);
  const customer_list = useMemo(() => {
    return clientList.find((item) => item.id === id);
  }, [clientList, id]);

  const typeDocument = useMemo(() => {
    return ArrayTypeDocument.find(
      (item) => item.id === customer_list?.tipoDocumento
    );
  }, []);


  return (
    <>
      <StatusBar style="light" backgroundColor={"#AFB0B1"} />
      <View
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#AFB0B1",
        }}
      >
        <MaterialCommunityIcons
          name="close"
          color={"white"}
          onPress={() => closeModal()}
          size={26}
          style={stylesGlobals.materialIconsStyle}
        />

        <View
          style={{
            flexDirection: "row",
          }}
        >
          <Text style={{ ...stylesGlobals.titleDetailsCustomer }}>
            {`Detalles cliente ${
              customer_list?.esContribuyente ? "contribuyente" : "normal"
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
                color={"#AFB0B1"}
                size={30}
                style={stylesGlobals.iconsStyles}
              />
              <Text style={stylesGlobals.textIconStyle}>
                {customer_list?.nombre}
              </Text>
            </View>
            {customer_list?.esContribuyente && (
              <View style={stylesGlobals.viewInMaterial}>
                <MaterialCommunityIcons
                  name="card-account-details"
                  color={"#AFB0B1"}
                  size={30}
                  style={stylesGlobals.iconsStyles}
                />
                <Text style={stylesGlobals.textIconStyle}>
                  {customer_list?.nombreComercial}
                </Text>
              </View>
            )}

            <View style={stylesGlobals.viewInMaterial}>
              <MaterialCommunityIcons
                name="email-outline"
                color={"#AFB0B1"}
                size={30}
                style={stylesGlobals.iconsStyles}
              />
              <Text style={stylesGlobals.textIconStyle}>
                {customer_list?.correo}
              </Text>
            </View>

            <View style={stylesGlobals.viewInMaterial}>
              <MaterialCommunityIcons
                name="phone"
                color={"#AFB0B1"}
                size={30}
                style={stylesGlobals.iconsStyles}
              />
              <Text style={stylesGlobals.textIconStyle}>
                {customer_list?.telefono}
              </Text>
            </View>
            <View style={stylesGlobals.viewInMaterial}>
              <MaterialCommunityIcons
                name="card-text"
                color={"#AFB0B1"}
                size={30}
                style={stylesGlobals.iconsStyles}
              />
              <Text style={stylesGlobals.textIconStyle}>
                {typeDocument?.name}
              </Text>
            </View>
            <View style={stylesGlobals.viewInMaterial}>
              <MaterialCommunityIcons
                name="checkbook"
                color={"#AFB0B1"}
                size={30}
                style={stylesGlobals.iconsStyles}
              />
              <Text style={stylesGlobals.textIconStyle}>
                {customer_list?.numDocumento}
              </Text>
            </View>
            {customer_list?.esContribuyente && (
              <View style={stylesGlobals.viewInMaterial}>
                <MaterialCommunityIcons
                  name="card-bulleted"
                  color={"#AFB0B1"}
                  size={30}
                  style={stylesGlobals.iconsStyles}
                />
                <Text style={stylesGlobals.textIconStyle}>
                  {`NRC: ${customer_list.nrc}`}
                </Text>
              </View>
            )}
            {customer_list?.esContribuyente && (
              <View style={stylesGlobals.viewInMaterial}>
                <MaterialCommunityIcons
                  name="book-open"
                  color={"#AFB0B1"}
                  size={30}
                  style={stylesGlobals.iconsStyles}
                />
                <Text style={stylesGlobals.textIconStyle}>
                  {customer_list?.descActividad}
                </Text>
              </View>
            )}
            {customer_list?.esContribuyente && (
              <View style={stylesGlobals.viewInMaterial}>
                <MaterialCommunityIcons
                  name="checkbox-marked"
                  color={"#AFB0B1"}
                  size={30}
                  style={stylesGlobals.iconsStyles}
                />
                <Text style={stylesGlobals.textIconStyle}>
                  {customer_list?.tipoContribuyente}
                </Text>
              </View>
            )}

            <View style={stylesGlobals.viewInMaterial}>
              <MaterialCommunityIcons
                name="card-bulleted-outline"
                color={"#AFB0B1"}
                size={30}
                style={stylesGlobals.iconsStyles}
              />
              <Text style={stylesGlobals.textIconStyle}>
                {customer_list?.nombreDepartamento}
              </Text>
            </View>
            <View style={stylesGlobals.viewInMaterial}>
              <MaterialCommunityIcons
                name="bank"
                color={"#AFB0B1"}
                size={30}
                style={stylesGlobals.iconsStyles}
              />
              <Text style={stylesGlobals.textIconStyle}>
                {customer_list?.nombreMunicipio}
              </Text>
            </View>
            <View style={{ ...stylesGlobals.viewInMaterial, marginBottom: 30 }}>
              <MaterialCommunityIcons
                name="clipboard-outline"
                color={"#AFB0B1"}
                size={30}
                style={stylesGlobals.iconsStyles}
              />
              <Text style={stylesGlobals.textIconStyle}>
                {customer_list?.complemento}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </>
  );
};

export default Of_normal_customer;
