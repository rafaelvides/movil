import { ThemeContext } from "@/hooks/useTheme";
import { useBranchProductStore } from "@/store/branch_product.store";
import { IBranchProduct } from "@/types/branch_product/branch_product.types";
import { formatCurrency } from "@/utils/dte";
import { useContext } from "react";
import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const CartProductsList = ({ handleReset }: { handleReset: () => void }) => {
  const { theme } = useContext(ThemeContext);
  const {
    cart_products,
    OnUpdateQuantity,
    OnRemoveProduct,
    OnMinusQuantity,
    OnPlusQuantity,
  } = useBranchProductStore();
  const nameBodyTemplate = (product: IBranchProduct) => {
    const name =
      product.product.name.length > 20
        ? `${product.product.name.substring(0, 20)}...`
        : product.product.name;
    return (
      <>
        {product.product.name.length > 20 ? (
          <>
            <Text>{name}</Text>
          </>
        ) : (
          // <Tooltip
          //   placement="top"
          //   trigger={(triggerProps) => {
          //     return <Text {...triggerProps}>{name}</Text>;
          //   }}
          // >
          //   <TooltipContent>
          //     <TooltipText>{product.product.name}</TooltipText>
          //   </TooltipContent>
          // </Tooltip>
          <Text>{name}</Text>
        )}
      </>
    );
  };

  return (
    <>
      <ScrollView
        style={{
          marginTop: 20,
        }}
      >
        {cart_products.map((product, index) => (
         <></>
        ))}
      </ScrollView>
    </>
  );
};

export default CartProductsList;
