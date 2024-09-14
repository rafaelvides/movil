import Pagination from "@/components/Global/Pagination";
import { useBranchProductOfflineStore } from "@/offline/store/branch_product_offline.store";
import { formatCurrency } from "@/utils/dte";
// import { Card, CardContent } from "@/~/components/ui/card";
import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { get_branch_id } from "@/plugins/async_storage";
import SpinnerInitPage from "@/components/Global/SpinnerInitPage";
import { useFocusEffect } from "expo-router";
import React from "react";
import { StatusBar } from "expo-status-bar";
import SpinLoading from "@/components/Global/SpinLoading";
import AnimatedButton from "@/components/Global/AnimatedButtom";
import { SheetManager } from "react-native-actions-sheet";
import { ThemeContext } from "@/hooks/useTheme";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import Card from "@/components/Global/components_app/Card";

const offline_branch_product = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [nameProduct, setNameProduct] = useState("");
  const [codeProduct, setCodeProduct] = useState("");
  const [refresh, setRefresh] = useState(false);
  const { theme } = useContext(ThemeContext);

  const { OnGetBranchProductsOffline, branchProducts, pagination, is_loading } =
    useBranchProductOfflineStore();
  const totalPages = pagination.totalPages ?? 1;

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      setRefresh(true);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }, [])
  );

  useEffect(() => {
    (async () => {
      await get_branch_id().then(async (id) => {
        if (id !== null && id !== undefined) {
          await OnGetBranchProductsOffline(
            Number(id),
            "",
            nameProduct,
            currentPage,
            5
          );
        }
      });
    })();
    setRefresh(false);
  }, [refresh, currentPage]);

  const handlePageChange = (page: any) => {
    setCurrentPage(page);
  };
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
            {loading === false && is_loading ? (
              <SpinLoading is_showing={is_loading} />
            ) : (
              <>
                <View style={stylesGlobals.filter}>
                  <AnimatedButton
                    handleClick={() => {
                      SheetManager.show("product-offline-filters-sheet", {
                        payload: {
                          onChangeValueName(text) {
                            setNameProduct(text);
                          },
                          name: nameProduct,
                          onChangeValueCode(text) {
                            setCodeProduct(text);
                          },
                          code: codeProduct,
                          handleConfirm() {
                            setRefresh(true);
                            SheetManager.hide("product-offline-filters-sheet");
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
                      refreshing={refresh}
                      onRefresh={() => setRefresh(true)}
                    />
                  }
                >
                  <View style={stylesGlobals.viewScroll}>
                    {branchProducts &&
                      branchProducts.map((brp, index) => (
                        <Card style={stylesGlobals.styleCard} key={index}>
                          <View style={{ width: "130%" }}>
                            <View style={stylesGlobals.ViewCard}>
                              <MaterialCommunityIcons
                                color={"#AFB0B1"}
                                name="inbox-full-outline"
                                size={22}
                                style={styles.icon}
                              />
                              <Text style={stylesGlobals.textCard}>
                                {brp.product.name.length > 20
                                  ? `${brp.product.name.substring(0, 18)}...`
                                  : brp.product.name}
                              </Text>
                            </View>

                            <View style={stylesGlobals.ViewCard}>
                              <MaterialCommunityIcons
                                color={"#AFB0B1"}
                                name="focus-field-horizontal"
                                size={22}
                                style={styles.icon}
                              />
                              <Text style={{ ...stylesGlobals.textCard }}>
                                {brp.product.code}
                              </Text>
                            </View>
                            <View style={stylesGlobals.ViewCard}>
                              <MaterialCommunityIcons
                                color={"#AFB0B1"}
                                name="currency-usd"
                                size={22}
                                style={styles.icon}
                              />
                              <Text style={{ ...stylesGlobals.textCard }}>
                                {formatCurrency(Number(brp.price))}
                              </Text>
                            </View>
                            <View style={stylesGlobals.ViewCard}>
                              <MaterialCommunityIcons
                                color={"#AFB0B1"}
                                name="mail"
                                size={22}
                                style={styles.icon}
                              />
                              <Text style={{ ...stylesGlobals.textCard }}>
                                {brp.product.nameCategory}
                              </Text>
                            </View>
                          </View>
                        </Card>
                      ))}
                  </View>
                  <View style={{ marginBottom: 40 }}>
                    {branchProducts.length > 0 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
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

export default offline_branch_product;

const styles = StyleSheet.create({
  icon: {
    position: "absolute",
    left: 7,
  },
});
