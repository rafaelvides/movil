import Pagination from "@/components/Global/Pagination";
import { ThemeContext } from "@/hooks/useTheme";
import { get_branch_id } from "@/plugins/async_storage";
import { useBranchProductStore } from "@/store/branch_product.store";
import { formatCurrency } from "@/utils/dte";
import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import BarcodeScanner from "@/components/Global/BarcodeScanner";
import { StatusBar } from "expo-status-bar";
import Card from "@/components/Global/components_app/Card";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import { useDebounce } from "@uidotdev/usehooks";

const ListBrachProducts = ({ closeModal }: { closeModal: () => void }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [nameProduct, setNameProduct] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [showModalScanner, setShowModalScanner] = useState(false);
  const debouncedSearchTerm = useDebounce(nameProduct, 300);

  const {
    branch_products,
    OnAddProductByCode,
    pagination_branch_product,
    GetPaginatedBranchProducts,
  } = useBranchProductStore();
  const totalPages = pagination_branch_product?.totalPag ?? 1;
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    (async () => {
      await get_branch_id().then(async (id) => {
        if (id !== null && id !== undefined) {
          await GetPaginatedBranchProducts(
            Number(id),
            currentPage,
            5,
            debouncedSearchTerm ?? "",
            ""
          );
        }
      });
    })();
    setRefresh(false);
  }, [refresh, currentPage, debouncedSearchTerm]);

  const onRead = (text: string) => {
    (async () => {
      await get_branch_id().then((id) => {
        if (id !== null && id !== undefined) {
          OnAddProductByCode(text, Number(id));
        }
      });
      setScanned(false);
      setShowScanner(false);
    })();
  };
  const handlePageChange = (page: number) => {
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
            {branch_products &&
              branch_products.map((brp, index) => (
                <Card key={index} style={stylesGlobals.styleCard}>
                  
                  <View style={{flexDirection:"row", width:"100%", justifyContent:"space-between", top:10}}>
                    <MaterialCommunityIcons
                      color={theme.colors.secondary}
                      name="inbox-full-outline"
                      size={30}
                      style={{
                        position: "absolute",
                        left: 7,
                      }}
                    />
                    <Text style={{...stylesGlobals.textCard, top:10}}>
                      {brp.product.name.length > 20
                        ? `${brp.product.name.substring(0, 18)}...`
                        : brp.product.name}
                    </Text>
                    <Pressable
                      onPress={() => {
                        OnAddProductByCode(brp.product.code, brp.branch.id);
                      }}
                      style={{
                         width: "14%",
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

                  <View style={{ ...stylesGlobals.ViewCard, marginTop: 25 }}>
                    <MaterialCommunityIcons
                      color={theme.colors.secondary}
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
                      color={theme.colors.secondary}
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
                      color={theme.colors.secondary}
                      name="mail"
                      size={30}
                      style={{
                        position: "absolute",
                        left: 7,
                      }}
                    />

                    <Text style={stylesGlobals.textCard}>
                      {brp.product.subCategoryProduct?.categoryProduct.name}
                    </Text>
                  </View>
                </Card>
              ))}
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

export default ListBrachProducts;

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
    transform: [{ translateY: -10 }],
  },
  iconTwo: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
});
