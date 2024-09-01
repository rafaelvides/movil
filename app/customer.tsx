import AlertWithAnimation from "@/components/Global/manners/Alert";
import AnimatedButton from "@/components/Global/AnimatedButtom";
import Pagination from "@/components/Global/Pagination";
import SpinLoading from "@/components/Global/SpinLoading";
import SpinnerInitPage from "@/components/Global/SpinnerInitPage";
import AddClientContributor from "@/components/customer/AddClientContributor";
import AddClientsNormal from "@/components/customer/AddClientNormal";
import ButtonDual from "@/components/customer/button_dual/ButtonDual";
import { DetailsCustomerContributor } from "@/components/customer/details-customer/detailsCustomerContributor";
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
import { StatusBar } from "expo-status-bar";
import React, { useContext, useEffect, useState } from "react";
import {
  Modal,
  RefreshControl,
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SheetManager } from "react-native-actions-sheet";

const customer = () => {
  const [showDetailContributor, setShowDetailContributor] = useState(false);
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
  const [limit, setLimit] = useState(5);

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
    getCustomersPagination(currentPage, limit, name, correo);
    setRefreshing(false);
  }, [refreshing]);

  const handleChangeDetailsCustomer = (customer: ICustomer) => {
    const payload_customer: IPayloadCustomer = {
      nombre: customer.nombre,
      correo: customer.correo,
      telefono: customer.telefono,
      numDocumento: customer.numDocumento,
      nombreComercial: customer.nombreComercial,
      nrc: customer.nrc,
      // nit: customer.nit,
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
    if (customer.esContribuyente) {
      setTypeClient("contribuyente");
    } else {
      setTypeClient("normal");
    }
  };

  const handleChangeCustomer = (customer: ICustomer, type = "edit") => {
    const payload_customer: IPayloadCustomer = {
      nombre: customer.nombre,
      correo: customer.correo,
      telefono: customer.telefono,
      numDocumento: customer.numDocumento,
      nombreComercial: customer.nombreComercial,
      nrc: customer.nrc,
      // nit: customer.nit,
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
    if (customer.esContribuyente) {
      setTypeClient("normal");
    } else {
      setTypeClient("contribuyente");
    }
    setIsOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const fetchCustomer = (page: number) => {
    getCustomersPagination(page, limit, name, correo);
  };

  useEffect(() => {
    fetchCustomer(currentPage);
  }, [currentPage, limit, name, correo]);

  const deleteCustomer = (id: number) => {
    DeleteCustomer(id);
  };

  const clearClose = () => {
    setIsOpen(false);
    handleChangeCustomer({} as ICustomer, "");
    setTypeClient("normal");
    setSelectedId(0);
    setSelectedCustomer(undefined);
    setSelectedTitle("");
  };
  const handle = () => {
    setIsModalCustomer(false);
  };

  const clearClients = () => {
    handleChangeDetailsCustomer({} as ICustomer);
    setTypeClient("normal");
    setSelectedId(0);
    setSelectedCustomer(undefined);
    setSelectedTitle("");
    setShowDetailNormal(false);
    setShowDetailContributor(false);
  };

  useEffect(() => {}, [typeClient]);

  return (
    <>
      <StatusBar style="dark" />
      {loading ? (
        <>
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
              zIndex: 1000,
            }}
          >
            <SpinnerInitPage />
          </View>
        </>
      ) : (
        <>
          <SafeAreaView
            style={{
              flex: 1,
              width: "100%",
              height: "100%",
              backgroundColor: "white",
              paddingHorizontal: 8,
            }}
          >
            {/* <Pressable
            onPress={() =>
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
              })
            }
            style={styles.filter}
          >
            <Text
              style={{
                color: "#718096",
                fontSize: 16,
              }}
            >
              Filtros disponibles
            </Text>
            <Pressable
              style={{
                position: "absolute",
                right: 20,
              }}
            >
              <MaterialCommunityIcons
                name="filter"
                size={25}
                color="#607274"
              />
            </Pressable>
          </Pressable> */}
            <View style={styles.filter}>
              <View
                style={{
                  position: "absolute",
                  justifyContent: "space-between",
                  gap: 100,
                }}
              >
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
                  width={42}
                  height={42}
                  right={100}
                  size={30}
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
                  width={42}
                  height={42}
                  right={100}
                  size={30}
                  left={100}
                  top={0}
                />
              </View>
            </View>

            <View style={{ top: 0 }}>
              <ButtonDual
                setIsModalButtons={setIsModalButtons}
                isModalButtons={isModalButtons}
                setTypeClient={setTypeClient}
                openModal={() => setIsOpen(true)}
              />
            </View>
            {is_loading ? (
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <SpinLoading is_showing={is_loading} />
              </View>
            ) : (
              <>
                <ScrollView
                  style={{
                    flex: 1,
                    marginTop: 5,
                    marginBottom: 5,
                  }}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={() => setRefreshing(true)}
                    />
                  }
                >
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <>
                      {customers &&
                        customers.map((customer, index) => (
                          <></>
                        ))}
                    </>
                  </View>
                </ScrollView>
                {customers.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </SafeAreaView>
          <Modal visible={isOpen}>
            <View
              style={{
                backgroundColor: "white",
                padding: 20,
                borderRadius: 10,
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <Text
                style={{ fontWeight: "bold", marginLeft: 130, marginRight: 80 }}
              >
                {selectedCustomer
                  ? selectedTitle !== ""
                    ? selectedTitle
                    : "Editar cliente"
                  : "Nuevo cliente"}
              </Text>
             
            </View>
            <View
              style={{
                backgroundColor: "white",
                padding: 10,
                borderRadius: 10,
                alignItems: "center",
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
            title="¿Estas seguro que deseas eliminar este registro?"
          />

          <Modal visible={showDetailNormal} animationType="slide">
            {typeClient === "contribuyente" ? (
              <DetailsCustomerContributor
                closeModal={() => {
                  clearClients();
                  setShowDetailNormal(false);
                }}
                customer={selectedCustomer}
                customer_direction={selectedCustomerDirection}
                id={selectedId}
              />
            ) : (
              <DetailsCustomerNormal
                closeModal={() => {
                  clearClients();
                  setShowDetailNormal(false);
                }}
                customer={selectedCustomer}
                customer_direction={selectedCustomerDirection}
                id={selectedId}
              />
            )}
          </Modal>
        </>
      )}
    </>
  );
};
export default customer;

const styles = StyleSheet.create({
  filter: {
    justifyContent: "center",
    width: "100%",
    paddingLeft: 20,
    marginTop: 15,
    borderBottomWidth: 0.5,
    height: 56,
    alignItems: "center",
  },
  card: {
    height: "auto",
    marginBottom: 25,
    padding: 5,
    width: "95%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
});
