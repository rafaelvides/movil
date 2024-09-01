import Pagination from "@/components/Global/Pagination";
import { ThemeContext } from "@/hooks/useTheme";
import { useBranchProductOfflineStore } from "@/offline/store/branch_product_offline.store";
import { formatCurrency } from "@/utils/dte";
// import { Card, CardContent } from "@/~/components/ui/card";
import { useContext, useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
// import { Input } from "@/~/components/ui/input";
import BarcodeScanner from "@/components/Global/BarcodeScanner";
import AnimatedButton from "@/components/Global/AnimatedButtom";
import { get_branch_id } from "@/plugins/async_storage";

const ListBranchProducts = () => {
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
    setRefresh(false)
  }, [refresh]);

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
      <BarcodeScanner
        setShowScanner={setShowScanner}
        setScanned={setScanned}
        showScanner={showScanner}
        scanned={scanned}
        setShowModal={setShowModalScanner}
        showModal={showModalScanner}
        search={onRead}
      />
      <AnimatedButton
        handleClick={() => {
          setShowScanner(true);
          setShowModalScanner(true);
        }}
        iconName="barcode-scan"
        buttonColor="#BF3131"
        right={20}
        size={23}
        top={80}
        width={36}
        height={36}
      />
      <View
        style={{
          marginTop: 1,
          width: "100%",
        }}
      >
        <View style={styles.inputWrapper}>
          {/* <Input
            className="rounded-3xl"
            style={styles.input}
            placeholder="Nombre del producto..."
            onChangeText={(text) => setNameProduct(text)}
            aria-labelledbyledBy="inputLabel"
            aria-errormessage="inputError"
          /> */}
          <MaterialCommunityIcons
            color={"#1359"}
            name="barcode-scan"
            size={27}
            style={styles.icon}
            onPress={() => setRefresh(true)}
          />
        </View>
      </View>
      {branchProducts && branchProducts.length > 0 && (
        <Text style={{ fontSize: 20, marginTop: 25 }}>Carrito</Text>
      )}
      <ScrollView
        style={{
          marginBottom: 60,
        }}
      >
        {branchProducts &&
          branchProducts.map((brp, index) => (
            <View
              key={index}
              style={{
                height: "auto",
                marginBottom: 25,
                padding: 5,
                margin: 5,
                width: "95%",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
                elevation: 10,
              }}
            >
              <View
                style={{
                  width: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    width: "100%",
                  }}
                >
                  <View>
                    <Pressable
                      onPress={() => PostProductCart(brp)}
                      style={{
                        flexDirection: "row",
                        width: 40,
                        height: 40,
                        marginLeft: 250,
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
                  <MaterialCommunityIcons
                    color={theme.colors.secondary}
                    name="inbox-full-outline"
                    size={30}
                    style={{
                      position: "absolute",
                      left: -21,
                      top: "20%",
                      transform: [{ translateY: -15 }],
                    }}
                  />
                  <Text
                    style={{
                      marginLeft: -280,
                    }}
                  >
                    Nombre:{" "}
                  </Text>
                  <Text style={{ fontWeight: "600", color: "#4B5563" }}>
                    {brp.product.name.length > 20
                      ? `${brp.product.name.substring(0, 18)}...`
                      : brp.product.name}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 25,
                    width: "100%",
                  }}
                >
                  <MaterialCommunityIcons
                    color={theme.colors.secondary}
                    name="focus-field-horizontal"
                    size={30}
                    style={{
                      position: "absolute",
                      left: -21,
                      top: "20%",
                      transform: [{ translateY: -15 }],
                    }}
                  />
                  <Text
                    style={{
                      marginLeft: 15,
                    }}
                  >
                    Código:{" "}
                  </Text>
                  <Text
                    style={{
                      fontWeight: "600",
                      color: "#4B5563",
                    }}
                  >
                    {brp.product.code}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 25,
                    width: "100%",
                  }}
                >
                  <MaterialCommunityIcons
                    color={theme.colors.secondary}
                    name="currency-usd"
                    size={30}
                    style={{
                      position: "absolute",
                      left: -21,
                      top: "20%",
                      transform: [{ translateY: -15 }],
                    }}
                  />
                  <Text
                    style={{
                      marginLeft: 15,
                    }}
                  >
                    Precio:{" "}
                  </Text>
                  <Text
                    style={{
                      fontWeight: "600",
                      color: "#4B5563",
                    }}
                  >
                    {formatCurrency(Number(brp.price))}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 25,
                    width: "100%",
                  }}
                >
                  <MaterialCommunityIcons
                    color={theme.colors.secondary}
                    name="mail"
                    size={30}
                    style={{
                      position: "absolute",
                      left: -21,
                      top: "20%",
                      transform: [{ translateY: -15 }],
                    }}
                  />
                  <Text
                    style={{
                      marginLeft: 14,
                    }}
                  >
                    Categoría:{" "}
                  </Text>
                  <Text
                    style={{
                      fontWeight: "600",
                      color: "#4B5563",
                    }}
                  >
                    {brp.product.nameCategory}
                  </Text>
                </View>
              </View>
            </View>
          ))}
      </ScrollView>
      <View style={{ bottom: 50 }}>
        {branchProducts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </View>
    </>
  );
};

export default ListBranchProducts;

const styles = StyleSheet.create({
  inputWrapper: {
    position: "relative",
    width: "100%",
    height: 50,
    justifyContent: "center",
    marginBottom: 15,
  },
  input: {
    height: "100%",
    paddingLeft: 40,
    borderColor: "#D9D9DA",
    borderWidth: 1,
    borderRadius: 15,
  },
  icon: {
    position: "absolute",
    left: 7,
    top: "50%",
    transform: [{ translateY: -15 }],
  },
});
