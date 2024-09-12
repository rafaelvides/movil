import Pagination from "@/components/Global/Pagination";
import { ThemeContext } from "@/hooks/useTheme";
import { useBranchProductOfflineStore } from "@/offline/store/branch_product_offline.store";
import { formatCurrency } from "@/utils/dte";
// import { Card, CardContent } from "@/~/components/ui/card";
import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
// import { Input } from "@/~/components/ui/input";
import BarcodeScanner from "@/components/Global/BarcodeScanner";
import AnimatedButton from "@/components/Global/AnimatedButtom";
import { get_branch_id } from "@/plugins/async_storage";
import { StatusBar } from "expo-status-bar";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import Card from "@/components/Global/components_app/Card";

const ListBranchProducts = ({ closeModal }: { closeModal: () => void }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [nameProduct, setNameProduct] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [showModalScanner, setShowModalScanner] = useState(false);

  const { theme } = useContext(ThemeContext);

  const {
    OnGetBranchProductsOffline,
    branchProducts,
    pagination,
    PostProductCart,
    OnAddProductForCode,
  } = useBranchProductOfflineStore();

  const totalPages = pagination.totalPages ?? 1;

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

  const onRead = (text: string) => {
    (async () => {
      await get_branch_id().then((id) => {
        if (id !== null && id !== undefined) {
          OnAddProductForCode(text);
        }
      });
      setScanned(false);
      setShowScanner(false);
    })();
  };
  const handlePageChange = (page: any) => {
    setCurrentPage(page);
  };
  return (
    <>
      <StatusBar style="dark" />
      <View
        style={{
          borderRadius: 25,
          width: "100%",
          top: -5,
          height: 130,
          backgroundColor: theme.colors.third,
        }}
      >
        <Pressable
          style={{
            position: "absolute",
            right: 15,
            top: 15,
          }}
        >
          <MaterialCommunityIcons
            color={"white"}
            name="close"
            size={34}
            onPress={() => closeModal()}
          />
        </Pressable>

        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons
            color={"#fff"}
            name={"magnify"}
            size={23}
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            onChangeText={(text) => setNameProduct(text)}
            placeholder={"Nombre del producto..."}
            placeholderTextColor={"white"}
          />
          <MaterialCommunityIcons
            color={"#fff"}
            name={"barcode-scan"}
            size={23}
            style={styles.iconTwo}
            onPress={() => {
              setShowScanner(true);
              setShowModalScanner(true);
            }}
          />
        </View>
      </View>
      <SafeAreaView style={stylesGlobals.safeAreaViewStyle}>
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
                <Card key={index} style={stylesGlobals.styleCard}>
                  <View
                    style={{ marginLeft: 280, position: "absolute", top: -5 }}
                  >
                    <Pressable
                      onPress={() => PostProductCart(brp)}
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor: theme.colors.dark,
                        borderRadius: 10,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <MaterialCommunityIcons
                        color={"#ffffff"}
                        name="plus"
                        size={25}
                      />
                    </Pressable>
                  </View>

                  <View style={stylesGlobals.ViewCard}>
                    <MaterialCommunityIcons
                      color={"#AFB0B1"}
                      name="inbox-full-outline"
                      size={30}
                      style={{
                        position: "absolute",
                        left: 7,
                      }}
                    />
                    <Text style={stylesGlobals.textCard}>
                      {brp.product.name.length > 20
                        ? `${brp.product.name.substring(0, 18)}...`
                        : brp.product.name}
                    </Text>
                  </View>

                  <View style={{ ...stylesGlobals.ViewCard, marginTop: 25 }}>
                    <MaterialCommunityIcons
                      color={"#AFB0B1"}
                      name="barcode-scan"
                      size={30}
                      style={{
                        position: "absolute",
                        left: 7,
                      }}
                    />

                    <Text style={stylesGlobals.textCard}>
                      {brp.product.code}
                    </Text>
                  </View>
                  <View style={{ ...stylesGlobals.ViewCard, marginTop: 25 }}>
                    <MaterialCommunityIcons
                      color={"#AFB0B1"}
                      name="currency-usd"
                      size={30}
                      style={{
                        position: "absolute",
                        left: 7,
                      }}
                    />
                    <Text style={stylesGlobals.textCard}>
                      {formatCurrency(Number(brp.price))}
                    </Text>
                  </View>
                  <View style={{ ...stylesGlobals.ViewCard, marginTop: 25 }}>
                    <MaterialCommunityIcons
                      color={"#AFB0B1"}
                      name="mail"
                      size={30}
                      style={{
                        position: "absolute",
                        left: 7,
                      }}
                    />

                    <Text style={stylesGlobals.textCard}>
                      {brp.product.nameCategory}
                    </Text>
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
      </SafeAreaView>

      <BarcodeScanner
        setShowScanner={setShowScanner}
        setScanned={setScanned}
        showScanner={showScanner}
        scanned={scanned}
        setShowModal={setShowModalScanner}
        showModal={showModalScanner}
        search={onRead}
      />
    </>
  );
};

export default ListBranchProducts;

const styles = StyleSheet.create({
  inputWrapper: {
    alignContent: "center",
    position: "absolute",
    width: "90%",
    height: 50,
    left: 20,
    top: 60,
  },
  input: {
    height: "100%",
    paddingLeft: 40,
    borderColor: "#D9D9DA",
    borderWidth: 1,
    borderRadius: 15,
    color: "white",
  },
  icon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: [{ translateY: -15 }],
  },
  iconTwo: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
});
