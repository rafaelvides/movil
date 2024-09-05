import SpinnerInitPage from "@/components/Global/SpinnerInitPage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import LottieView from "lottie-react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  ScrollView,
  ToastAndroid,
} from "react-native";
import noResult from "@/assets/gif_json/bx8ntOOR1D.json";
// import { useEmployeeStoreOffline } from "@/offline/store/employee.store";
import { ThemeContext } from "@/hooks/useTheme";
import SpinLoading from "@/components/Global/SpinLoading";
import { useEmployeeStore } from "@/store/employee.store";

const of_customers = () => {
  const animation = useRef(null);
  const [isloading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { OnGetEmployeesList, employee_list, is_loading } = useEmployeeStore();
  const { theme } = useContext(ThemeContext);
  // const { OnSaveEmployee } = useEmployeeStoreOffline();

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
    // const promises = employee_list.map(async (employee) => {
    //   return await OnSaveEmployee({
    //     fullName: employee.fullName,
    //     phone: employee.phone,
    //     isActive: employee.isActive,
    //     branchId: employee.branchId,
    //   });
    // });

    // await Promise.all(promises).then(() => {
    //   ToastAndroid.show(
    //     "Todos los empleados se han guardado exitosamente",
    //     ToastAndroid.SHORT
    //   );
    // });
  };
  useEffect(() => {
    OnGetEmployeesList();
    setRefreshing(false);
  }, [refreshing]);

  return (
    <>
      <StatusBar style="light" />
      {isloading ? (
        <>
          <View
            style={{
              flex: 1,
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#fff",
            }}
          >
            <SpinnerInitPage />
          </View>
        </>
      ) : (
        <>
          <View
            style={{
              backgroundColor: "#fff",
            }}
          >
            <SafeAreaView>
              
              <ScrollView
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => setRefreshing(true)}
                  />
                }
              >
                {is_loading ? (
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      flex: 1,
                      width: "100%",
                      height: 650,
                    }}
                  >
                    <View
                      style={{
                        width: "100%",
                        height: "100%",
                        marginBottom: 250,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <SpinLoading is_showing={is_loading} />
                    </View>
                  </View>
                ) : (
                  <View>
                    <View
                      style={{
                        marginBottom: 125,
                        backgroundColor: "#FFFFFF",
                        height: "auto",
                      }}
                    >
                      <ScrollView>
                        {employee_list.length > 0 ? (
                          <>
                            {!is_loading &&
                              employee_list.map((employee, index) => (
                                <></>
                              ))}
                          </>
                        ) : (
                          <>
                            <View
                              style={{
                                padding: 40,
                                width: "100%",
                                height: "auto",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <LottieView
                                autoPlay
                                ref={animation}
                                style={{
                                  marginTop: 50,
                                  width: 380,
                                  height: 380,
                                }}
                                source={require("@/assets/gif_json/gif_global.json")}
                              />
                            </View>
                          </>
                        )}
                      </ScrollView>
                    </View>
                  </View>
                )}
              </ScrollView>
            </SafeAreaView>
          </View>
        </>
      )}
    </>
  );
};

export default of_customers;

const styles = StyleSheet.create({});
