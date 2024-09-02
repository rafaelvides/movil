import SpinnerInitPage from "@/components/Global/SpinnerInitPage";
import { useCustomerStore } from "@/store/customer.store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useContext, useEffect, useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  Text,
  View,
  ScrollView,
  ToastAndroid,
} from "react-native";
import { useClientOfflineStore } from "@/offline/store/customer_offline.store";
import { ThemeContext } from "@/hooks/useTheme";
import SpinLoading from "@/components/Global/SpinLoading";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import Card from "@/components/Global/components_app/Card";
import AnimatedButton from "@/components/Global/AnimatedButtom";

const of_customers = () => {
  const [isloading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { customer_list, is_loading, OnGetCustomersList } = useCustomerStore();
  const { theme } = useContext(ThemeContext);
  const { OnSaveClient } = useClientOfflineStore();

  useFocusEffect(
    React.useCallback(() => {
      setIsLoading(true);
      setRefreshing(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }, [])
  );
  const handleSaveClients = async () => {
    const promises = customer_list.map(async (client) => {
      return await OnSaveClient({
        clienteId: client.id,
        nombre: client.nombre,
        nombreComercial: client.nombreComercial,
        nrc: client.nrc,
        nit: client.nit,
        tipoDocumento: client.tipoDocumento,
        numDocumento: client.numDocumento,
        codActividad: client.codActividad,
        descActividad: client.descActividad,
        bienTitulo: client.bienTitulo,
        telefono: client.telefono,
        correo: client.correo,
        active: client.isActive,
        esContribuyente: client.esContribuyente,
        emisorId: client.transmitterId,
        departamento: client.direccion.departamento,
        nombreDepartamento: client.direccion.nombreDepartamento,
        municipio: client.direccion.municipio,
        nombreMunicipio: client.direccion.nombreMunicipio,
        complemento: client.direccion.complemento,
        tipoContribuyente: client.tipoContribuyente,
      });
    });

    await Promise.all(promises).then(() => {
      ToastAndroid.show(
        "Todos los clientes se han guardado exitosamente",
        ToastAndroid.SHORT
      );
    });
  };
  useEffect(() => {
    OnGetCustomersList();
    setRefreshing(false);
  }, [refreshing]);

  return (
    <>
      <StatusBar style="light" />
      {isloading ? (
        <>
          <View style={stylesGlobals.viewSpinnerInit}>
            <SpinnerInitPage />
          </View>
        </>
      ) : (
        <>
          <SafeAreaView style={stylesGlobals.safeAreaViewStyle}>
            {is_loading ? (
              <SpinLoading is_showing={is_loading} />
            ) : (
              <>
                <View style={stylesGlobals.filter}>
                  <AnimatedButton
                    handleClick={() => handleSaveClients()}
                    buttonColor={theme.colors.third}
                    iconName="download"
                    width={40}
                    height={40}
                    left={10}
                    size={25}
                    top={0}
                  />
                </View>

                <ScrollView
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={() => setRefreshing(true)}
                    />
                  }
                >
                  <View style={stylesGlobals.viewScroll}>
                    {customer_list && customer_list.length > 0 && (
                      <>
                        {!is_loading &&
                          customer_list.map((customer, index) => (
                            <Card key={index} style={stylesGlobals.styleCard}>
                              <View style={stylesGlobals.ViewCard}>
                                <MaterialCommunityIcons
                                  color={theme.colors.secondary}
                                  name="account"
                                  size={22}
                                  style={{
                                    position: "absolute",
                                    left: 7,
                                  }}
                                />
                                <Text style={stylesGlobals.textCard}>
                                  {customer.nombre}
                                </Text>
                              </View>
                              <View style={stylesGlobals.ViewCard}>
                                <MaterialCommunityIcons
                                  color={theme.colors.third}
                                  name="phone"
                                  size={22}
                                  style={{
                                    position: "absolute",
                                    left: 7,
                                  }}
                                />
                                <Text style={stylesGlobals.textCard}>
                                  {customer.telefono}
                                </Text>
                              </View>
                              <View style={stylesGlobals.ViewCard}>
                                <MaterialCommunityIcons
                                  color={theme.colors.third}
                                  name="map-marker"
                                  size={22}
                                  style={{
                                    position: "absolute",
                                    left: 7,
                                  }}
                                />
                                <Text style={stylesGlobals.textCard}>
                                  {`${customer.direccion.nombreDepartamento}/${customer.direccion.nombreMunicipio}`}
                                </Text>
                              </View>
                              <View style={[stylesGlobals.ViewCard]}>
                                <MaterialCommunityIcons
                                  color={theme.colors.dark}
                                  name="mail"
                                  size={22}
                                  style={{
                                    position: "absolute",
                                    left: 7,
                                  }}
                                />

                                <Text style={[stylesGlobals.textCard]}>
                                  {customer.correo}
                                </Text>
                              </View>
                            </Card>
                          ))}
                      </>
                    )}
                  </View>
                </ScrollView>
              </>
            )}
          </SafeAreaView>
        </>
      )}
    </>
  );
};

export default of_customers;
