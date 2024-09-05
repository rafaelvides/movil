import ButtonForCard from "@/components/Global/components_app/ButtonForCard";
import Card from "@/components/Global/components_app/Card";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
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
                      fontWeight: "400",
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
                      fontWeight: "400",
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
                      OnUpdateQuantity(product.uuid, Number(e.nativeEvent.text))
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
                        paddingHorizontal: 15,
                        marginLeft: 60,
                        paddingVertical: 10,
                        borderRadius: 10,
                        backgroundColor:
                          product.porcentaje === 0 ? "#e0f5e4" : "#fff",
                        borderColor:
                          product.porcentaje === 0 ? "#0D9276" : "#fff",
                      }}
                    >
                      <Text
                        style={{
                          textDecorationLine:
                            product.porcentaje > 0 &&
                            product.maximum >= product.quantity &&
                            product.base_price * product.quantity !==
                              Number(product.price) * product.quantity
                              ? "line-through"
                              : "none",
                          color: product.porcentaje === 0 ? "#0D9276" : "#000",
                        }}
                      >
                        {product.porcentaje > 0
                          ? formatCurrency(
                              Number(product.base_price) * product.quantity
                            )
                          : formatCurrency(
                              Number(product.price) * product.quantity
                            )}
                      </Text>
                    </View>
                    {product.porcentaje > 0 &&
                      product.maximum >= product.quantity &&
                      product.base_price * product.quantity !==
                        Number(product.price) * product.quantity && (
                        <View
                          style={{
                            backgroundColor: "#e0f5e4",
                            borderColor: "#0D9276",
                            borderWidth: 1,
                            paddingHorizontal: 15,
                            marginLeft: 20,
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
                      )}
                  </View>
                </View>
                <View style={stylesGlobals.ViewGroupButton}>
                  <ButtonForCard
                    onPress={() => OnPlusQuantity(product.uuid)}
                    icon={"plus"}
                  />
                  <ButtonForCard
                    onPress={() => OnMinusQuantity(product.uuid)}
                    color={theme.colors.third}
                    icon={"minus"}
                  />
                  <ButtonForCard
                    onPress={() => {
                      OnRemoveProduct(product.uuid);
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

export default CartProductsList;
