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
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import Card from "@/components/Global/components_app/Card";
import ButtonForCard from "@/components/Global/components_app/ButtonForCard";
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
      <ScrollView>
        <View style={stylesGlobals.viewScroll}>
          {cart_products.map((product, index) => (
            <Card key={index} style={stylesGlobals.styleCard}>
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
                  <Text>Total:</Text>
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
                        {formatCurrency(
                          Number(product.price) * product.quantity
                        )}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={stylesGlobals.ViewGroupButton}>
                  <ButtonForCard
                    onPress={() => OnPlusQuantity(product.id)}
                    icon={"plus"}   
                  />
                  <ButtonForCard
                    onPress={() => OnMinusQuantity(product.id)}
                    color={theme.colors.third}
                    icon={"minus"}
                  />
                  <ButtonForCard
                    onPress={() => {
                      OnRemoveProduct(product.id);
                      handleReset();
                    }}
                    color={theme.colors.danger}
                    icon={"delete"}
                  />
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </>
  );
};

export default CartsProductBranch;

const styles = StyleSheet.create({});
