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
import { useEmployeeStoreOffline } from "@/offline/store/employee.store";
import { ThemeContext } from "@/hooks/useTheme";
import SpinLoading from "@/components/Global/SpinLoading";
import { useEmployeeStore } from "@/store/employee.store";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import AnimatedButton from "@/components/Global/AnimatedButtom";
import Card from "@/components/Global/components_app/Card";
import Not_data from "@/components/Global/Global_Animation/Not_data";

const of_customers = () => {
  const animation = useRef(null);
  const [isloading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { OnGetEmployeesList, employee_list, is_loading } = useEmployeeStore();
  const { theme } = useContext(ThemeContext);
  const { OnSaveEmployee } = useEmployeeStoreOffline();

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
    const promises = employee_list.map(async (employee) => {
      return await OnSaveEmployee({
        employeeId: employee.id,
        fullName: employee.fullName,
        phone: employee.phone,
        isActive: employee.isActive,
        branchId: employee.branchId,
      });
    });

    await Promise.all(promises).then(() => {
      ToastAndroid.show(
        "Todos los empleados se han guardado exitosamente",
        ToastAndroid.SHORT
      );
    });
  };
  useEffect(() => {
    OnGetEmployeesList();
    setRefreshing(false);
  }, [refreshing]);

  return (
    <>
      <StatusBar style="dark" />
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
                    {employee_list && employee_list.length > 0 ? (
                      <>
                        {!is_loading &&
                          employee_list.map((employee, index) => (
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
                                  {employee.fullName.slice(0, 15)}
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
                                  {employee.phone}
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
                                  {employee.branch.name}
                                </Text>
                              </View>
                              <View style={stylesGlobals.ViewCard}>
                                <MaterialCommunityIcons
                                  color={theme.colors.dark}
                                  name="mail"
                                  size={22}
                                  style={{
                                    position: "absolute",
                                    left: 7,
                                  }}
                                />

                                <Text style={stylesGlobals.textCard}>
                                  {employee.branch.codEstable}?{" "}
                                </Text>
                              </View>
                            </Card>
                          ))}
                      </>
                    ) : (
                      <Not_data/>
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

const styles = StyleSheet.create({});
