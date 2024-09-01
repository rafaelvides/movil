import Pagination from "@/components/Global/Pagination";
import { ThemeContext } from "@/hooks/useTheme";
import { get_branch_id } from "@/plugins/async_storage";
import { useBranchProductStore } from "@/store/branch_product.store";
import { formatCurrency } from "@/utils/dte";
import { useContext, useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import BarcodeScanner from "@/components/Global/BarcodeScanner";
// import {
//   getBranchProductPaginated,
// } from "@/offline/services/branch_product.service";
import { StatusBar } from "expo-status-bar";

interface Props {
  closeModal: () => void;
}

const CartProductsList = (props: Props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [nameProduct, setNameProduct] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [showModalScanner, setShowModalScanner] = useState(false);
  const {
    branch_products,
    OnAddProductByCode,
    pagination_branch_product,
    GetPaginatedBranchProducts,
  } = useBranchProductStore();
  const totalPages = pagination_branch_product?.totalPag ?? 1;
  const { theme } = useContext(ThemeContext);
  const [id, setId] = useState(0);
  const [limit, setLimit] = useState(5);

  useEffect(() => {
    (async () => {
      await get_branch_id().then(async (id) => {
        setId(Number(id));
        if (id !== null && id !== undefined) {
          await GetPaginatedBranchProducts(
            Number(id),
            currentPage,
            5,
            nameProduct,
            ""
          );
        }
      });
    })();
    setLimit(5), getFilter();
  }, [refresh, currentPage, limit]);

  const getFilter = () => {
    GetPaginatedBranchProducts(id, currentPage, limit, nameProduct, "");
  };

  const onRead = (text: string) => {
    (async () => {
      await get_branch_id().then((id) => {
        if (id !== null && id !== undefined) {
          OnAddProductByCode(text, Number(id));
        }
      });
      setScanned(false);
      setShowScanner(false);
      fetchProducts(currentPage);
    })();
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const fetchProducts = (page: number) => {
    // getBranchProductPaginated(id, "", nameProduct, page, limit);
  };

  return (
    <View></View>
  );
};

export default CartProductsList;

const styles = StyleSheet.create({
  inputWrapper: {
    position: "relative",
    width: "96%",
    height: 50,
    left: 8,
    bottom: 30,
  },
  input: {
    height: "100%",
    paddingLeft: 55,
    borderColor: "white",
    backgroundColor: "white",
    borderWidth: 1,
    borderRadius: 15,
    top: 100,
  },
  icon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: [{ translateY: -15 }],
  },
});
