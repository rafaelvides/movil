import SpinnerInitPage from "@/components/Global/SpinnerInitPage";
import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import LottieView from "lottie-react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  ToastAndroid,
  Text,
} from "react-native";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";
import { ThemeContext } from "@/hooks/useTheme";
import { useBranchProductStore } from "../../store/branch_product.store";
import { useBranchProductOfflineStore } from "@/offline/store/branch_product_offline.store";
import SpinLoading from "@/components/Global/SpinLoading";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import Card from "@/components/Global/components_app/Card";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AnimatedButton from "@/components/Global/AnimatedButtom";
import { get_branch_id } from "@/plugins/async_storage";
import Pagination from "@/components/Global/Pagination";
const of_products = () => {
  const [loading, setLoading] = useState(false);
  const animation = useRef(null);
  const { theme } = useContext(ThemeContext);
  const {
    is_loading_list,
    is_loading,
    GetPaginatedBranchProducts,
    OnGetBranchProductList,
    branch_products_list,
    branch_products,
    pagination_branch_product,
  } = useBranchProductStore();
  const { OnSaveBranchProduct } = useBranchProductOfflineStore();
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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
    (async () => {
      await get_branch_id().then(async (id) => {
        if (id !== null && id !== undefined) {
          await OnGetBranchProductList(Number(id));
          await GetPaginatedBranchProducts(Number(id), currentPage, 5, "", "");
        }
      });
    })();
    setRefreshing(false);
  }, [refreshing]);

  const totalPages = pagination_branch_product?.totalPag ?? 1;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const handleSavePrdocts = async () => {
    try {
      const promises = branch_products_list.map(async (branch_product) => {
        console.log(branch_product);
        return await OnSaveBranchProduct({
          branchProductId: branch_product.id,
          stock: branch_product.stock,
          price: branch_product.price,
          priceA: branch_product.priceA,
          priceB: branch_product.priceB,
          priceC: branch_product.priceC,
          minimumStock: branch_product.minimumStock,
          branchId: branch_product.branchId,
          supplierId: branch_product.supplierId ? branch_product.supplierId : 0,
          product: {
            productId: branch_product.product.id,
            name: branch_product.product.name,
            description: branch_product.product.description,
            code: branch_product.product.code,
            nameCategory:
              branch_product.product.subCategoryProduct.categoryProduct.name,
            tipoItem: Number(branch_product.product.tipoItem),
            uniMedida: Number(branch_product.product.uniMedida),
            isActive: branch_product.product.isActive,
          },
          productId: branch_product.productId,
          name: branch_product.branch.name,
          address: branch_product.branch.address,
          phone: branch_product.branch.phone,

          transmitterId: branch_product.branch.transmitterId,
        });
      });

      await Promise.all(promises)
        .then(() => {
          ToastAndroid.show(
            "Todos los productos se han guardado exitosamente",
            ToastAndroid.SHORT
          );
        })
        .catch(() => {
          ToastAndroid.show(
            "Hubo un error al guardar los productos",
            ToastAndroid.SHORT
          );
        });
    } catch (error) {
      ToastAndroid.show(
        "Hubo un error al guardar los productos",
        ToastAndroid.SHORT
      );
    }
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
            {is_loading ? (
              <SpinLoading is_showing={is_loading} />
            ) : (
              <>
                <View style={stylesGlobals.filter}>
                  <AnimatedButton
                    handleClick={handleSavePrdocts}
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
                    {branch_products && branch_products.length > 0 ? (
                      <>
                        {!is_loading &&
                          branch_products.map((product, index) => (
                            <Card key={index} style={stylesGlobals.styleCard}>
                              <View style={stylesGlobals.ViewCard}>
                                <MaterialCommunityIcons
                                  color={theme.colors.secondary}
                                  name="shopping"
                                  size={22}
                                  style={styles.icon}
                                />

                                <Text style={stylesGlobals.textCard}>
                                  {product.product.name}
                                </Text>
                              </View>
                              <View style={stylesGlobals.ViewCard}>
                                <MaterialCommunityIcons
                                  color={theme.colors.secondary}
                                  name="clipboard-text-outline"
                                  size={22}
                                  style={styles.icon}
                                />

                                <Text style={stylesGlobals.textCard}>
                                  {" "}
                                  {product.product.description.length > 80
                                    ? `${product.product.description.substring(
                                        0,
                                        80
                                      )}...`
                                    : product.product.description}{" "}
                                </Text>
                              </View>
                              <View style={stylesGlobals.ViewCard}>
                                <MaterialCommunityIcons
                                  color={theme.colors.secondary}
                                  name="currency-usd"
                                  size={22}
                                  style={styles.icon}
                                />

                                <Text style={stylesGlobals.textCard}>
                                  {product.price}
                                </Text>
                              </View>
                              <View style={stylesGlobals.ViewCard}>
                                <MaterialCommunityIcons
                                  color={theme.colors.secondary}
                                  name="account"
                                  size={22}
                                  style={styles.icon}
                                />

                                <Text style={stylesGlobals.textCard}>
                                  {
                                    product.product.subCategoryProduct
                                      .categoryProduct.name
                                  }
                                </Text>
                              </View>
                            </Card>
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
                  </View>
                  <View style={{ marginBottom: 40 }}>
                    {branch_products.length > 0 && (
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

export default of_products;

const styles = StyleSheet.create({
  icon: {
    position: "absolute",
    left: 7,
  },
});
