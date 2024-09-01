import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SheetManager } from "react-native-actions-sheet";
import { formatDate, verifyApplyAnulation } from "@/utils/date";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import SpinnerInitPage from "@/components/Global/SpinnerInitPage";
import { useFocusEffect } from "expo-router";
import { useSaleStore } from "../../store/sale.store";
import { StatusBar } from "expo-status-bar";
import { ISale } from "@/types/sale/sale.types";
import Invalidations from "../../components/sales/svf_dte_generate/Invalidations";
import SpinLoading from "@/components/Global/SpinLoading";
import ElectronicDTEContingency from "@/components/sales/svf_dte_generate/ElectronicDTEContingency";
import { IEmployee } from "@/types/employee/employee.types";

const processed_sales = () => {
  const [startDate, setStartDate] = useState(formatDate());
  const [endDate, setEndDate] = useState(formatDate());
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalContingency, setModalContingency] = useState(false);
  const [infoContingency, setInfoContingecy] = useState({
    saleDTE: "",
    pathJson: "",
    box_id: 0,
    customer_id: 0,
    employee: 0,
  });
  const { GetPaginatedSales, is_loading, sales } = useSaleStore();
  infoContingency;
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
    GetPaginatedSales(1, 1, 5, startDate, endDate, 3);
    setRefreshing(false);
  }, [refreshing]);

  return (
    <>
      {loading ? (
        <>
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
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
              backgroundColor: "#fff",
              paddingHorizontal: 8,
            }}
          >
            <StatusBar style="dark" />

            <Pressable
              onPress={() =>
                SheetManager.show("sales-filters-sheet", {
                  payload: {
                    setEndDate,
                    startDate: startDate,
                    setStartDate,
                    endDate: endDate,
                    handleConfirm(startDate, endDate) {
                      setStartDate(startDate);
                      setEndDate(endDate);
                      setRefreshing(true);
                      SheetManager.hide("sales-filters-sheet");
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
            </Pressable>

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
              {loading === false && is_loading ? (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                    width: "100%",
                    height: "100%",
                  }}
                >
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
                </View>
              ) : (
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 100,
                  }}
                >
                  {!is_loading &&
                    sales &&
                    sales.map((sale, index) => (
                      <></>
                    ))}
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
          <Modal visible={modalContingency} animationType="fade">
            <ElectronicDTEContingency
              infoContingency={infoContingency}
              setModalContingency={setModalContingency}
            />
          </Modal>
        </>
      )}
    </>
  );
};

export default processed_sales;

const styles = StyleSheet.create({
  filter: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    paddingLeft: 20,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
    height: 56,
    backgroundColor: "#f9f9f9",
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
  icon: {
    position: "absolute",
    left: 7,
    top: "30%",
    transform: [{ translateY: -15 }],
  },
});
