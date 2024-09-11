import SpinnerInitPage from "@/components/Global/SpinnerInitPage";
import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import LottieView from "lottie-react-native";
import React, { useContext, useEffect, useRef } from "react";
import { useState } from "react";
import { SafeAreaView, View, StyleSheet, Text } from "react-native";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";
import { ThemeContext } from "@/hooks/useTheme";
import { useBranchProductStore } from "../../store/branch_product.store";
// import { useBranchProductOfflineStore } from "@/offline/store/branch_product_offline.store";
import SpinLoading from "@/components/Global/SpinLoading";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
const of_products = () => {
  const [loading, setLoading] = useState(false);
  const animation = useRef(null);
  const { theme } = useContext(ThemeContext);
  const { is_loading_list, OnGetBranchProductList, branch_products_list } =
    useBranchProductStore();
  // const { OnSaveBranchProduct } = useBranchProductOfflineStore();
  const [refreshing, setRefreshing] = useState(false);

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
    OnGetBranchProductList(1);
    setRefreshing(false);
  }, [refreshing]);
  const handleSavePrdocts = async () => {
    // try {
    //   const promises = branch_products_list.map(async (branch_product) => {
    //     return await OnSaveBranchProduct({
    //       branchProductId: branch_product.id,
    //       stock: branch_product.stock,
    //       price: branch_product.price,
    //       priceA: branch_product.priceA,
    //       priceB: branch_product.priceB,
    //       priceC: branch_product.priceC,
    //       minimumStock: branch_product.minimumStock,
    //       branchId: branch_product.branchId,
    //       supplierId: branch_product.supplierId ? branch_product.supplierId : 0,
    //       // fixedPrice: branch_product.fixedPrice
    //       //   ? branch_product.fixedPrice
    //       //   : "N/A",
    //       // maximum: branch_product.maximum ? branch_product.maximum : 0,
    //       // porcentaje: branch_product.porcentaje ? branch_product.porcentaje : 0,
    //       // operator: branch_product.operator ? branch_product.operator : "N/A",
    //       // minimum: branch_product.minimum ? branch_product.minimum : 0,
    //       // days: branch_product.days,
    //       product: {
    //         productId: branch_product.product.id,
    //         name: branch_product.product.name,
    //         description: branch_product.product.description,
    //         code: branch_product.product.code,
    //         nameCategory:
    //           branch_product.product.subCategoryProduct.categoryProduct.name,
    //         tipoItem: Number(branch_product.product.tipoItem),
    //         uniMedida: Number(branch_product.product.uniMedida),
    //         isActive: branch_product.product.isActive,
    //       },
    //       productId: branch_product.productId,
    //       name: branch_product.branch.name,
    //       address: branch_product.branch.address,
    //       phone: branch_product.branch.phone,
    //       transmitterId: branch_product.branch.transmitterId,
    //     });
    //   });
    //   await Promise.all(promises)
    //     .then((data) => {
    //       ToastAndroid.show(
    //         "Todos los productos se han guardado exitosamente",
    //         ToastAndroid.SHORT
    //       );
    //     })
    //     .catch((error) => {
    //       ToastAndroid.show(
    //         "Hubo un error al guardar los productos",
    //         ToastAndroid.SHORT
    //       );
    //     });
    // } catch (error) {
    //   ToastAndroid.show(
    //     "Hubo un error al guardar los productos",
    //     ToastAndroid.SHORT
    //   );
    // }
  };

  return (
    <>
      <StatusBar style="dark" />
      {is_loading_list ? (
        <>
          <View style={stylesGlobals.viewSpinnerInit}>
            <SpinnerInitPage />
          </View>
        </>
      ) : (
        <>
          <SafeAreaView style={stylesGlobals.safeAreaViewStyle}>
            {is_loading_list ? (
              <SpinLoading is_showing={is_loading_list} />
            ) : (
              <>
                <ScrollView
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={() => setRefreshing(true)}
                    />
                  }
                >
                  <View style={stylesGlobals.viewScroll}>
                    {branch_products_list && branch_products_list.length > 0 ? (
                      <>
                        {!is_loading_list &&
                          branch_products_list.map((branch, index) => {
                            <Text style={{color: theme.colors.secondary, fontSize: 20, marginTop:30}}>aaaaaaaaaaaa</Text>
                          })}
                      </>
                    ) : (
                      <>
                        <View style={stylesGlobals.viewLottie}>
                          <LottieView
                            autoPlay
                            ref={animation}
                            style={stylesGlobals.LottieStyle}
                            source={require("@/assets/gif_json/gif_global.json")}
                          />
                        </View>
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

export default of_products;

const styles = StyleSheet.create({});
