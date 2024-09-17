import {
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import SpinnerInitPage from "@/components/Global/SpinnerInitPage";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SpinLoading from "@/components/Global/SpinLoading";
import { useClientOfflineStore } from "@/offline/store/customer_offline.store";
import { useFocusEffect } from "expo-router";
import { ThemeContext } from "@/hooks/useTheme";
import AnimatedButton from "@/components/Global/AnimatedButtom";
import { SheetManager } from "react-native-actions-sheet";
import Card from "@/components/Global/components_app/Card";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import ButtonForCard from "@/components/Global/components_app/ButtonForCard";
import Of_normal_customer from "@/offline/components/customer_details/of_normal_customer";

const offline_clients = () => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isContributor, setIsContributor] = useState(false);
  const [numDoc, setNumDoc] = useState("");
  const [name, setName] = useState("");
  const [id, setId] = useState(0)
  const [modal, setModal] = useState(false)
  const { theme } = useContext(ThemeContext);
  const {
    OnGetClientsOfflinePagination,
    client_list_pagination,
    loading_paginated,
  } = useClientOfflineStore();

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      setRefreshing(true);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }, [])
  );
  useEffect(() => {
    OnGetClientsOfflinePagination(name, numDoc, isContributor, 1, 5);
    setRefreshing(false);
  }, [refreshing]);
  return (
    <>
      <StatusBar style="dark" />
      {loading ? (
        <>
          <View style={stylesGlobals.viewSpinnerInit}>
            <SpinnerInitPage />
          </View>
        </>
      ) : (
        <>
          <SafeAreaView style={stylesGlobals.safeAreaViewStyle}>
            {loading === false && loading_paginated ? (
              <SpinLoading is_showing={loading_paginated} />
            ) : (
              <>
                <View style={stylesGlobals.filter}>
                  <AnimatedButton
                    handleClick={() => {
                      SheetManager.show("customer-offline-filters-sheet", {
                        payload: {
                          onChangeValueName(text) {
                            setName(text);
                          },
                          name: name,
                          onChangeValueNuD(text) {
                            setNumDoc(text);
                          },
                          setEsContribuyente: setIsContributor,
                          esContribuyente: isContributor,
                          numDocumento: numDoc,
                          handleConfirm(esContribuyente) {
                            setIsContributor(esContribuyente);
                            setRefreshing(true);
                            SheetManager.hide("customer-offline-filters-sheet");
                          },
                        },
                      });
                    }}
                    iconName="filter"
                    buttonColor={theme.colors.third}
                    width={40}
                    height={40}
                    right={42}
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
                    {!loading_paginated &&
                      client_list_pagination &&
                      client_list_pagination.map((client, index) => (
                        <Card style={{...stylesGlobals.styleCard,}} key={index}>
                            <View style={{...stylesGlobals.ViewCard}}>
                              <MaterialCommunityIcons
                                color={"#AFB0B1"}
                                name="account"
                                size={22}
                                style={styles.icon}
                              />
                              <Text style={stylesGlobals.textCard}>
                                {client.nombre}
                              </Text>
                            </View>
                            <View style={stylesGlobals.ViewCard}>
                              <MaterialCommunityIcons
                                color={"#AFB0B1"}
                                name="email-outline"
                                size={22}
                                style={styles.icon}
                              />
                              <Text style={stylesGlobals.textCard}>
                                {client.correo}
                              </Text>
                            </View>
                            <View style={stylesGlobals.ViewCard}>
                              <MaterialCommunityIcons
                                color={"#AFB0B1"}
                                name="phone"
                                size={22}
                                style={styles.icon}
                              />
                              <Text style={stylesGlobals.textCard}>
                                {client.telefono}
                              </Text>
                            </View>
                            <View style={stylesGlobals.ViewCard}>
                              <MaterialCommunityIcons
                                color={"#AFB0B1"}
                                name="map-marker"
                                size={22}
                                style={{
                                  position: "absolute",
                                  left: 7,
                                }}
                              />
                              <Text style={stylesGlobals.textCard}>
                                {`${client.nombreDepartamento}/${client.nombreMunicipio}`}
                              </Text>
                            </View>
                            <View
                              style={{
                                justifyContent: "center",
                                alignItems: "center",
                                top: 20,
                                marginLeft:40
                              }}
                            >
                              <ButtonForCard
                                onPress={() => {
                                  setId(client.id)
                                  setModal(true)
                                }}
                                color={"#6E6E6E"}
                                icon={"eye-outline"}
                              />
                            </View>
                                                    </Card>
                      ))}
                  </View>
                </ScrollView>
              </>
            )}
          </SafeAreaView>
        </>
      )}
      <Modal visible={modal} animationType="slide">
        <Of_normal_customer id={id} closeModal={()=>setModal(false)}/>
      </Modal>
    </>
  );
};

export default offline_clients;

const styles = StyleSheet.create({
  icon: {
    position: "absolute",
    left: 7,
  },
});
