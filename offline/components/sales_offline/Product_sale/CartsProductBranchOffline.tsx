import { ThemeContext } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/dte";
// import { Card, CardContent } from "@/~/components/ui/card";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useContext } from "react";
import { BranchProducts } from "@/offline/entity/branch_product.entity";
import { useBranchProductOfflineStore } from "../../../store/branch_product_offline.store";
const CartsProductBranch = ({ handleReset }: { handleReset: () => void }) => {
  const { theme } = useContext(ThemeContext);

  const {
    cart_products,
    OnUpdateQuantity,
    OnRemoveProduct,
    OnMinusQuantity,
    OnPlusQuantity,
  } = useBranchProductOfflineStore();
  const nameBodyTemplate = (product: BranchProducts) => {
    const name =
      product.product.name.length > 20
        ? `${product.product.name.substring(0, 20)}...`
        : product.product.name;
    return (
      <>
        {product.product.name.length > 20 ? (
          <></>
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
          <View
            key={index}
            style={{
              height: 250,
              marginBottom: 25,
              padding: 5,
              margin: 10,
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
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Text>Nombre:</Text>
                <Text
                  style={{
                    marginLeft: 44,
                    fontWeight: "600",
                    color: "#4B5563",
                  }}
                >
                  {nameBodyTemplate(product)}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 12,
                  width: "100%",
                }}
              >
                <Text>Precio:</Text>
                <Text
                  style={{
                    marginLeft: 60,
                    fontWeight: "600",
                    color: "#4B5563",
                  }}
                >
                  {formatCurrency(Number(product.price))}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 12,
                  width: "100%",
                }}
              >
                <Text>Cantidad:</Text>
                <TextInput
                  defaultValue={product.quantity.toString()}
                  keyboardType="numeric"
                  onSubmitEditing={(e) =>
                    OnUpdateQuantity(index, Number(e.nativeEvent.text))
                  }
                  style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    padding: 5,
                    borderRadius: 10,
                    backgroundColor: "#fff",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 80,
                    height: 40,
                    paddingLeft: 10,
                    marginLeft: 40,
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 12,
                  width: "100%",
                }}
              >
                <Text style={{}}>Total:</Text>
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      backgroundColor: "#e0f5e4",
                      borderColor: "#0D9276",
                      borderWidth: 1,
                      paddingHorizontal: 15,
                      marginLeft: 65,
                      paddingVertical: 10,
                      borderRadius: 10,
                    }}
                  >
                    <Text>
                      {formatCurrency(Number(product.price) * product.quantity)}
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                }}
              >
                <Pressable
                  onPress={() => {
                    OnRemoveProduct(product.id);
                    handleReset();
                  }}
                  style={{
                    flexDirection: "row",
                    marginTop: 5,
                    width: 40,
                    height: 40,
                    marginRight: 60,
                    backgroundColor: "#dc2626",
                    borderRadius: 10,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    color={"#ffffff"}
                    name="delete"
                    size={25}
                  />
                </Pressable>
                <Pressable
                  onPress={() => OnMinusQuantity(product.id)}
                  style={{
                    flexDirection: "row",
                    marginTop: 5,
                    width: 40,
                    height: 40,

                    backgroundColor: "#1b6956",
                    borderRadius: 10,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    color={"#ffffff"}
                    name="minus"
                    size={25}
                  />
                </Pressable>
                <Pressable
                  onPress={() => OnPlusQuantity(product.id)}
                  style={{
                    flexDirection: "row",
                    marginTop: 5,
                    width: 40,
                    height: 40,
                    // backgroundColor: "#1d4ed8",
                    backgroundColor: theme.colors.dark,
                    marginLeft: 60,
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
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );
};

export default CartsProductBranch;

const styles = StyleSheet.create({});
