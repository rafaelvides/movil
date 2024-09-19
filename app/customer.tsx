import AlertWithAnimation from "@/components/Global/manners/Alert";
import AnimatedButton from "@/components/Global/AnimatedButtom";
import Pagination from "@/components/Global/Pagination";
import SpinLoading from "@/components/Global/SpinLoading";
import SpinnerInitPage from "@/components/Global/SpinnerInitPage";
import AddClientContributor from "@/components/customer/AddClientContributor";
import AddClientsNormal from "@/components/customer/AddClientNormal";
import ButtonDual from "@/components/customer/button_dual/ButtonDual";
import { DetailsCustomerNormal } from "@/components/customer/details-customer/detailsCustomerNormal";
import { ThemeContext } from "@/hooks/useTheme";
import { useCustomerStore } from "@/store/customer.store";
import {
  CustomerDirection,
  ICustomer,
  IPayloadCustomer,
} from "@/types/customer/customer.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Modal,
  RefreshControl,
  SafeAreaView,
  Text,
  View,
  ScrollView,
  StatusBar,
} from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import Card from "@/components/Global/components_app/Card";
import ButtonForCard from "@/components/Global/components_app/ButtonForCard";
import Not_data from "@/components/Global/Global_Animation/Not_data";

const customer = () => {
  const [showDetailNormal, setShowDetailNormal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState(0);
  const [isModalCustomer, setIsModalCustomer] = useState(false);
  const [name, setName] = useState("");
  const [correo, setCorreo] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const {
    customers,
    getCustomersPagination,
    DeleteCustomer,
    customer_paginated,
    is_loading,
  } = useCustomerStore();
  const totalPages = customer_paginated.totalPag ?? 1;
  const [isOpen, setIsOpen] = useState(false);
  const [isModalButtons, setIsModalButtons] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<IPayloadCustomer>();
  const [selectedCustomerDirection, setSelectedCustomerDirection] =
    useState<CustomerDirection>();
  const [selectedId, setSelectedId] = useState<number>(0);
  const [typeClient, setTypeClient] = useState("normal");
  const [selectedTitle, setSelectedTitle] = useState("");
  const [nameCustomer, setNameCustomer] = useState("");
  const { theme } = useContext(ThemeContext);
  useFocusEffect(
    React.useCallback(() => {
      setRefreshing(true);
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }, [])
  );

  useEffect(() => {
    getCustomersPagination(currentPage, 5, name, correo);
    setRefreshing(false);
  }, [refreshing]);

  const handleChangeCustomer = (customer: ICustomer, type = "edit") => {
    const payload_customer: IPayloadCustomer = {
      nombre: customer.nombre,
      correo: customer.correo,
      telefono: customer.telefono,
      numDocumento: customer.numDocumento,
      nombreComercial: customer.nombreComercial,
      nrc: customer.nrc,
      tipoDocumento: customer.tipoDocumento,
      bienTitulo: "05",
      codActividad: customer.codActividad,
      descActividad: customer.descActividad,
      esContribuyente: customer.esContribuyente ? 1 : 0,
      tipoContribuyente: customer.tipoContribuyente,
    };
    const payload_direction: CustomerDirection = {
      id: customer.direccion?.id ?? 0,
      municipio: customer.direccion?.municipio ?? "",
      nombreMunicipio: customer.direccion?.nombreMunicipio ?? "",
      departamento: customer.direccion?.departamento ?? "",
      nombreDepartamento: customer.direccion?.nombreDepartamento ?? "",
      complemento: customer.direccion?.complemento ?? "",
      active: customer.direccion?.active ?? false,
    };
    setSelectedCustomer(payload_customer);
    setSelectedCustomerDirection(payload_direction);
    setSelectedId(customer.id);

    if (type === "edit") {
      if (customer.esContribuyente) {
        setTypeClient("contribuyente");
      } else {
        setTypeClient("normal");
      }
      setIsOpen(true);
      return;
    }
    if (type === "details") {
      if (customer.esContribuyente) {
        setTypeClient("contribuyente");
      } else {
        setTypeClient("normal");
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const fetchCustomer = (page: number) => {
    getCustomersPagination(page, 5, name, correo);
  };

  useEffect(() => {
    fetchCustomer(currentPage);
  }, [currentPage, 5, name, correo]);

  const deleteCustomer = (id: number) => {
    DeleteCustomer(id);
  };

  const clearClose = () => {
    handleChangeCustomer({} as ICustomer, "");
    setTypeClient("normal");
    setSelectedId(0);
    setSelectedCustomer(undefined);
    setSelectedTitle("");
  };

  const handle = () => {
    setIsModalCustomer(false);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />

      {loading ? (
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
                    handleClick={() => {
                      SheetManager.show("customer-filters-sheet", {
                        payload: {
                          onChangeValueName(text) {
                            setName(text);
                          },
                          name: name,
                          onChangeValueCorreo(text) {
                            setCorreo(text);
                          },
                          correo: correo,
                          handleConfirm() {
                            setRefreshing(true);
                            SheetManager.hide("customer-filters-sheet");
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
                  <AnimatedButton
                    handleClick={() => {
                      isModalButtons
                        ? setIsModalButtons(false)
                        : setIsModalButtons(true);
                    }}
                    iconName="plus"
                    buttonColor={theme.colors.third}
                    width={40}
                    height={40}
                    right={10}
                    size={25}
                    top={0}
                  />
                </View>

                <View style={{ top: 0 }}>
                  <ButtonDual
                    setIsModalButtons={setIsModalButtons}
                    isModalButtons={isModalButtons}
                    setTypeClient={setTypeClient}
                    openModal={() => setIsOpen(true)}
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
                    {customers && customers.length > 0 ? (
                      <>
                        {customers &&
                          customers.map((customer, index) => (
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
                                  color={theme.colors.secondary}
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
                                  color={theme.colors.secondary}
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
                              <View style={stylesGlobals.ViewCard}>
                                <MaterialCommunityIcons
                                  color={theme.colors.secondary}
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
                              <View style={stylesGlobals.ViewGroupButton}>
                                <ButtonForCard
                                  onPress={() =>
                                    handleChangeCustomer(customer, "edit")
                                  }
                                  icon={"pencil"}
                                />

                                <ButtonForCard
                                  onPress={() => {
                                    handleChangeCustomer(customer, "details");
                                    setShowDetailNormal(true);
                                  }}
                                  color={theme.colors.third}
                                  icon={"card-text"}
                                />

                                <ButtonForCard
                                  onPress={() => {
                                    setIsModalCustomer(true);
                                    setCustomerId(customer.id);
                                    setNameCustomer(customer.nombre);
                                  }}
                                  color={theme.colors.danger}
                                  icon={"delete"}
                                />
                              </View>
                            </Card>
                          ))}
                      </>
                    ) : (
                      <Not_data />
                    )}
                  </View>
                  {customers.length > 0 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </ScrollView>
              </>
            )}
          </SafeAreaView>
          <Modal visible={isOpen}>
            <View
              style={{
                padding: 20,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  textAlign: "center",
                  marginTop: 20,
                  marginBottom: 15,
                }}
              >
                {selectedCustomer
                  ? selectedTitle !== ""
                    ? selectedTitle
                    : "Editar cliente"
                  : "Nuevo cliente"}
              </Text>
              <View style={{ position: "absolute", right: 0, top: -5 }}>
                <ButtonForCard
                  onPress={() => {
                    clearClose();
                    setIsOpen(false);
                  }}
                  color={"white"}
                  icon={"close"}
                  iconColor="black"
                  sizeIcon={26}
                />
              </View>
            </View>
            <View
              style={{
                padding: 10,
              }}
            >
              {typeClient === "normal" ? (
                <AddClientsNormal
                  closeModal={() => {
                    clearClose();
                    setIsOpen(false);
                  }}
                  customer={selectedCustomer}
                  customer_direction={selectedCustomerDirection}
                  id={selectedId}
                />
              ) : (
                <AddClientContributor
                  closeModal={() => {
                    clearClose();
                    setIsOpen(false);
                  }}
                  customer={selectedCustomer}
                  customer_direction={selectedCustomerDirection}
                  id={selectedId}
                />
              )}
            </View>
          </Modal>
          <AlertWithAnimation
            visible={isModalCustomer}
            onClose={handle}
            onPress={() => deleteCustomer(customerId)}
            title={`¿Estas seguro que deseas eliminar este registro? * [${nameCustomer}] *`}
          />

          <Modal visible={showDetailNormal} >
            <DetailsCustomerNormal
              closeModal={() => {
                clearClose();
                setShowDetailNormal(false);
              }}
              customer={selectedCustomer}
              customer_direction={selectedCustomerDirection}
              id={selectedId}
            />
          </Modal>
        </>
      )}
    </>
  );
};
export default customer;
