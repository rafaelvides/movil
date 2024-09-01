import { save_detail_close_box, verify_box } from "@/services/box.service";
import { useBoxStore } from "@/store/box.store";
import { ICloseBox, IGetBoxDetail } from "@/types/box/box.types";
import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ToastAndroid,
  Alert,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Card } from "react-native-paper";
import { get_box_data, get_point_sale_Id } from "@/plugins/async_storage";
import { ThemeContext } from "@/hooks/useTheme";
import { useFocusEffect, useRouter } from "expo-router";
interface Props {
  idBox?: number | undefined;
  closeModal: () => void;
}

const Box_close = (props: Props) => {
  const [boxValues, setBoxValues] = useState<ICloseBox>({
    oneDollar: 0,
    twoDollars: 0,
    fiveDollars: 0,
    tenDollars: 0,
    twentyDollars: 0,
    fiftyDollars: 0,
    hundredDollars: 0,
    oneCents: 0,
    fiveCents: 0,
    tenCents: 0,
    twentyFiveCents: 0,
    fiftyCents: 0,
    oneDollarCents: 0,
    state: "false",
  });
  const { OnRemoveBox } = useBoxStore();
  const [boxPreview, setBoxPreview] = useState<IGetBoxDetail>();
  const [isGroupButton, setIsGroupButton] = useState(false);
  const [boxId, setIdBox] = useState(0);
  const router = useRouter();
  const [pointSaleId, setPointSaleId] = useState(0);
  const { theme } = useContext(ThemeContext);
  const [refresh, setRefresh] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setRefresh(true);
    }, [])
  );

  useEffect(() => {
    get_box_data().then((values) => {
      if (values) {
        setIdBox(values.id);
      }
    });
    get_point_sale_Id().then((values) => {
      setPointSaleId(Number(values));
    });
    setRefresh(false);
  }, [refresh]);

  // const handleInputChange = (text: string) => {
  //   const validNumber = text.replace(/[^0-9]/g, "");
  
  //   const numericValue = validNumber === "" ? 0 : parseInt(validNumber, 10);
  
  //   if (!isNaN(numericValue)) {
  //     setBoxValues((prevBoxValues) => ({
  //       ...prevBoxValues,
  //       oneDollar: numericValue,
  //     }));
  //   } 
  // };


  const handleInputChange = (field: keyof ICloseBox) => (text: string) => {
    const validNumber = text.replace(/[^0-9]/g, "");

    // Convertir el texto filtrado a un número entero
    const numericValue = validNumber === "" ? 0 : parseInt(validNumber, 10);

    // Actualizar el estado solo si el valor convertido es un número válido
    setBoxValues((prevBoxValues) => ({
      ...prevBoxValues,
      [field]: numericValue,
    }));
  };
  

  const preview_box = () => {
    if (props.idBox) {
      save_detail_close_box(boxValues, props.idBox!)
        .then(({ data }) => {
          if (data.ok) {
            setBoxPreview(data);
            setIsGroupButton(true);
          } else {
            setBoxPreview(undefined);
            setIsGroupButton(false);
            ToastAndroid.show("No se pudo mostrar la caja", ToastAndroid.SHORT);
          }
        })
        .catch(() => {
          setBoxPreview(undefined);
          setIsGroupButton(false);
          ToastAndroid.show("No se pudo cerrar caja error", ToastAndroid.SHORT);
        });
    }
    if (boxId) {
      save_detail_close_box(boxValues, boxId)
        .then(({ data }) => {
          if (data.ok) {
            setBoxPreview(data);
            setIsGroupButton(true);
          } else {
            setBoxPreview(undefined);
            setIsGroupButton(false);
            ToastAndroid.show("No se pudo mostrar la caja", ToastAndroid.SHORT);
          }
        })
        .catch(() => {
          verify_box(pointSaleId).then(({ data }) => {
            if (!data.box) {
              Alert.alert(
                "No tienes una caja abierta para realizar esta acción"
              );
            }
          });
          setBoxPreview(undefined);
          setIsGroupButton(false);
          ToastAndroid.show("No se pudo cerrar caja error", ToastAndroid.SHORT);
        });
    }
  };

  const completeBox = () => {
    if (props.idBox) {
      save_detail_close_box({ ...boxValues, state: "true" }, props.idBox!)
        .then(({ data }) => {
          if (data.ok) {
            OnRemoveBox(),
              ToastAndroid.show("Caja cerrada con éxito", ToastAndroid.SHORT);
            props.closeModal();
            setBoxPreview(undefined);
          }
        })
        .catch(() => {
          setBoxPreview(undefined);
          ToastAndroid.show("No se pudo cerrar la caja", ToastAndroid.SHORT);
        });
    }
    if (boxId) {
      save_detail_close_box({ ...boxValues, state: "true" }, boxId)
        .then(({ data }) => {
          if (data.ok) {
            OnRemoveBox(),
              ToastAndroid.show("Caja cerrada con éxito", ToastAndroid.SHORT);
            router.navigate("/home");
            setIsGroupButton(false);
            setBoxPreview(undefined);
          }
        })
        .catch(() => {
          setBoxPreview(undefined);
          setIsGroupButton(false);
        });
    }
  };
  return (
    <>
      <View
        style={{
          width: "100%",
          height: 100,
          flexGrow: 2,
          columnGap: 20,
          justifyContent: "center",
          alignItems: "center",
          borderColor: "#33C1FF",
          margin: 10,
        }}
      >
        <ScrollView
          style={{
            marginBottom: 14,
          }}
        >

          {/**INICIO DE TARJETAAAAAAS */}

          <View style={{ margin: 20 }}>
                <View
                  style={{
                    width: "89%",
                    height: 78,
                    //  marginRight: 10,
                    borderRadius: 20,
                    // backgroundColor:"white",
                    backgroundColor: theme.colors.third,
                    // borderColor:theme.colors.secondary,
                    // borderWidth:1,
                    // opacity:0.1,
                    flexDirection: "row",
                  }}
                >
                  <View
                    style={{
                      // backgroundColor:"white",
                      backgroundColor: theme.colors.third,
                      top: 6,
                      marginLeft: 10,
                      borderRadius: 15,
                      height: "80%",
                      width: "30%",
                    }}
                  >
                    <Image
                      style={{ width: "100%", height: 60 }}
                      resizeMode="contain"
                      source={require("../assets/images/Cents and dollars/cents/01.png")}
                    />
                  </View>
                  <Text
                    style={{
                      color: "white",
                      left: 40,
                    }}
                  >
                    Moneda de ¢1 centavo
                  </Text>
                  
                </View>
              </View>
              {/*moneda de 5 centavos */}
              <View
                style={{
                  width: "89%",
                  left: 20,
                }}
              >
                <View style={{ bottom: 14 }}>
                  <View
                    style={{
                      width: "89%",
                      height: 78,
                      borderRadius: 20,
                      backgroundColor: theme.colors.third,

                      flexDirection: "row",
                    }}
                  >
                    <View
                      style={{
                        // backgroundColor:"white",
                        backgroundColor: theme.colors.third,
                        top: 6,
                        marginLeft: 10,
                        borderRadius: 15,
                        height: "80%",
                        width: "30%",
                      }}
                    >
                      <Image
                        style={{ width: "100%", height: 60 }}
                        resizeMode="contain"
                        source={require("../assets/images/Cents and dollars/cents/5.png")}
                      />
                    </View>
                    <Text
                      style={{
                        color: "white",
                        left: 50,
                      }}
                    >
                      Moneda de ¢5 centavos
                    </Text>
                   
                  </View>
                </View>
              </View>
              {/*fin de moneda de 5 */}
              <View
                style={{
                  width: "89%",
                  left: 20,
                }}
              >
                <View style={{ bottom: 7 }}>
                  <View
                    style={{
                      width: "89%",
                      height: 78,
                      borderRadius: 20,
                      backgroundColor: theme.colors.third,
                      flexDirection: "row",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: theme.colors.third,
                        top: 6,
                        marginLeft: 10,
                        borderRadius: 15,
                        height: "80%",
                        width: "30%",
                      }}
                    >
                      <Image
                        style={{ width: "100%", height: 60 }}
                        resizeMode="contain"
                        source={require("../assets/images/Cents and dollars/cents/10.png")}
                      />
                    </View>
                    <Text
                      style={{
                        color: "white",
                        left: 50,
                      }}
                    >
                      Moneda de ¢10 centavos
                    </Text>
                   
                  </View>
                </View>
              </View>
              {/**Fin de moneda de 10 */}

              <View
                style={{
                  width: "89%",
                  left: 20,
                }}
              >
                <View style={{ bottom: 1 }}>
                  <View
                    style={{
                      width: "89%",
                      height: 78,
                      borderRadius: 20,
                      backgroundColor: theme.colors.third,
                      flexDirection: "row",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: theme.colors.third,
                        top: 6,
                        marginLeft: 10,
                        borderRadius: 15,
                        height: "80%",
                        width: "30%",
                      }}
                    >
                      <Image
                        style={{ width: "100%", height: 60 }}
                        resizeMode="contain"
                        source={require("../assets/images/Cents and dollars/cents/25.png")}
                      />
                    </View>
                    <Text
                      style={{
                        color: "white",
                        left: 50,
                      }}
                    >
                      Moneda de ¢25 centavos
                    </Text>
                   
                  </View>
                </View>
              </View>
              {/**fin de 25 */}

              <View
                style={{
                  width: "89%",
                  left: 20,
                }}
              >
                <View style={{ top: 5 }}>
                  <View
                    style={{
                      width: "89%",
                      height: 78,
                      borderRadius: 20,
                      backgroundColor: theme.colors.third,
                      flexDirection: "row",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: theme.colors.third,
                        top: 6,
                        marginLeft: 10,
                        borderRadius: 15,
                        height: "80%",
                        width: "30%",
                      }}
                    >
                      <Image
                        style={{ width: "100%", height: 60 }}
                        resizeMode="contain"
                        source={require("../assets/images/Cents and dollars/cents/1.png")}
                      />
                    </View>
                    <Text
                      style={{
                        color: "white",
                        left: 50,
                      }}
                    >
                      Moneda de ¢1 Dolar
                    </Text>
                   
                  </View>
                </View>
              </View>
              {/**fin de 1 dolar cents */}
              <View
                style={{
                  width: "89%",
                  left: 20,
                }}
              >
                <View style={{ top: 10 }}>
                  <View
                    style={{
                      width: "89%",
                      height: 78,
                      borderRadius: 20,
                      backgroundColor: theme.colors.third,
                      flexDirection: "row",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: theme.colors.third,
                        top: 6,
                        marginLeft: 10,
                        borderRadius: 15,
                        height: "80%",
                        width: "30%",
                      }}
                    >
                      <Image
                        style={{ width: "100%", height: 60 }}
                        resizeMode="contain"
                        source={require("../assets/images/Cents and dollars/dollars/one.jpg")}
                      />
                    </View>
                    <Text
                      style={{
                        color: "white",
                        left: 50,
                      }}
                    >
                      Billete de $1 Dolar
                    </Text>
                    
                  </View>
                </View>
              </View>
              {/**fin de billete de 1 */}
              <View
                style={{
                  width: "89%",
                  left: 20,
                }}
              >
                <View style={{ top: 16 }}>
                  <View
                    style={{
                      width: "89%",
                      height: 78,
                      borderRadius: 20,
                      backgroundColor: theme.colors.third,
                      flexDirection: "row",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: theme.colors.third,
                        top: 6,
                        marginLeft: 10,
                        borderRadius: 15,
                        height: "80%",
                        width: "30%",
                      }}
                    >
                      <Image
                        style={{ width: "100%", height: 60 }}
                        resizeMode="contain"
                        source={require("../assets/images/Cents and dollars/dollars/two.png")}
                      />
                    </View>
                    <Text
                      style={{
                        color: "white",
                        left: 50,
                      }}
                    >
                      Billete de $2 Dolares
                    </Text>
                   </View>
                </View>
              </View>
              {/** fin de billete 2 */}
              <View
                style={{
                  width: "89%",
                  left: 20,
                }}
              >
                <View style={{ bottom: -22 }}>
                  <View
                    style={{
                      width: "89%",
                      height: 78,
                      borderRadius: 20,
                      backgroundColor: theme.colors.third,
                      flexDirection: "row",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: theme.colors.third,
                        top: 6,
                        marginLeft: 10,
                        borderRadius: 15,
                        height: "80%",
                        width: "30%",
                      }}
                    >
                      <Image
                        style={{ width: "100%", height: 60 }}
                        resizeMode="contain"
                        source={require("../assets/images/Cents and dollars/dollars/five.png")}
                      />
                    </View>
                    <Text
                      style={{
                        color: "white",
                        left: 50,
                      }}
                    >
                      Billete de $5 Dolares
                    </Text>
                    
                  </View>
                </View>
              </View>
              {/**fin de billete de 5 */}
              <View
                style={{
                  width: "89%",
                  left: 20,
                }}
              >
                <View style={{ bottom: -28 }}>
                  <View
                    style={{
                      width: "89%",
                      height: 78,
                      borderRadius: 20,
                      backgroundColor: theme.colors.third,
                      flexDirection: "row",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: theme.colors.third,
                        top: 6,
                        marginLeft: 10,
                        borderRadius: 15,
                        height: "80%",
                        width: "30%",
                      }}
                    >
                      <Image
                        style={{ width: "100%", height: 60 }}
                        resizeMode="contain"
                        source={require("../assets/images/Cents and dollars/dollars/10.png")}
                      />
                    </View>
                    <Text
                      style={{
                        color: "white",
                        left: 50,
                      }}
                    >
                      Billete de $10 Dolares
                    </Text>
                    
                  </View>
                </View>
              </View>
              {/**fin de 10 */}
              <View
                style={{
                  width: "89%",
                  left: 20,
                }}
              >
                <View style={{ top: 34 }}>
                  <View
                    style={{
                      width: "89%",
                      height: 78,
                      borderRadius: 20,
                      backgroundColor: theme.colors.third,
                      flexDirection: "row",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: theme.colors.third,
                        top: 6,
                        marginLeft: 10,
                        borderRadius: 15,
                        height: "80%",
                        width: "30%",
                      }}
                    >
                      <Image
                        style={{ width: "100%", height: 60 }}
                        resizeMode="contain"
                        source={require("../assets/images/Cents and dollars/dollars/20.jpg")}
                      />
                    </View>
                    <Text
                      style={{
                        color: "white",
                        left: 50,
                      }}
                    >
                      Billete de $20 Dolares
                    </Text>
                   
                  </View>
                </View>
              </View>

              {/**FIN DE 20 */}
              <View
                style={{
                  width: "89%",
                  left: 20,
                }}
              >
                <View style={{ bottom: -40 }}>
                  <View
                    style={{
                      width: "89%",
                      height: 78,
                      borderRadius: 20,
                      backgroundColor: theme.colors.third,
                      flexDirection: "row",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: theme.colors.third,
                        top: 6,
                        marginLeft: 10,
                        borderRadius: 15,
                        height: "80%",
                        width: "30%",
                      }}
                    >
                      <Image
                        style={{ width: "100%", height: 60 }}
                        resizeMode="contain"
                        source={require("../assets/images/Cents and dollars/dollars/50.png")}
                      />
                    </View>
                    <Text
                      style={{
                        color: "white",
                        left: 50,
                      }}
                    >
                      Billete de $50 Dolares
                    </Text>
                   
                  </View>
                </View>
              </View>
              {/**fin de 50 */}
              <View
                style={{
                  width: "89%",
                  left: 20,
                  top: 24,
                  marginBottom: 50,
                }}
              >
                <View style={{ bottom: -22 }}>
                  <View
                    style={{
                      width: "89%",
                      height: 78,
                      borderRadius: 20,
                      backgroundColor: theme.colors.third,
                      flexDirection: "row",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: theme.colors.third,
                        top: 6,
                        marginLeft: 10,
                        borderRadius: 15,
                        height: "80%",
                        width: "30%",
                      }}
                    >
                      <Image
                        style={{ width: "100%", height: 60 }}
                        resizeMode="contain"
                        source={require("../assets/images/Cents and dollars/dollars/100.png")}
                      />
                    </View>
                    <Text
                      style={{
                        color: "white",
                        left: 55,
                      }}
                    >
                      Billete de $100 Dolares
                    </Text>
                    
                  </View>
                </View>
              </View>
          {/* </Card> */}



          {/**FIN DE LAS TARJETAS */}
        </ScrollView>
        {boxPreview && (
          <ScrollView style={{ marginBottom: 10 }}>
           <View
              style={{
                flexDirection: "row",
                width: "100%",
                height: "100%",
                flexWrap: "wrap",
                marginTop: 10,
                marginBottom: 14,
                borderBottomColor: "green",
              }}
            >
              <Card
                style={{
                  height: 90,
                  width: 170,
                  backgroundColor: "#F3F6F8",
                }}
              >
                <Card.Content>
                  <Text style={{ fontSize: 16, textAlign: "center" }}>
                    Monto inicial de caja
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      textAlign: "center",
                      color: "green",
                    }}
                  >
                    ${boxPreview?.boxStart}
                  </Text>
                </Card.Content>
              </Card>
              <Card
                style={{
                  height: 90,
                  width: 170,
                  backgroundColor: "#F3F6F8",
                  marginLeft: 6,
                }}
              >
                <Card.Content>
                  <Text style={{ fontSize: 16, textAlign: "center" }}>
                    Gastos
                  </Text>
                  <Text
                    style={{ fontSize: 16, textAlign: "center", color: "red" }}
                  >
                    ${boxPreview?.totalExpenses}
                  </Text>
                </Card.Content>
              </Card>
              <Card
                style={{
                  height: 90,
                  width: 170,
                  marginTop: 10,
                  backgroundColor: "#F3F6F8",
                }}
              >
                <Card.Content>
                  <Text style={{ fontSize: 16, textAlign: "center" }}>
                    Total en ventas
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      textAlign: "center",
                      color: "green",
                    }}
                  >
                    ${boxPreview?.totalSales}
                  </Text>
                </Card.Content>
              </Card>
              <Card
                style={{
                  height: 90,
                  width: 170,
                  marginTop: 10,
                  marginLeft: 6,
                  backgroundColor: "#F3F6F8",
                }}
              >
                <Card.Content>
                  <Text style={{ fontSize: 16, textAlign: "center" }}>
                    {boxPreview?.cost < 0 ? "Faltante" : "Excedente"}
                  </Text>
                  <Text
                    style={
                      boxPreview.cost < 0
                        ? { color: "red", textAlign: "center" }
                        : { color: "green", textAlign: "center" }
                    }
                  >
                    $
                    {typeof boxPreview?.cost === "number"
                      ? boxPreview?.cost.toFixed(2)
                      : ""}{" "}
                  </Text>
                </Card.Content>
              </Card>
              <Card
                style={{
                  height: 90,
                  width: 170,
                  marginTop: 10,
                  backgroundColor: "#F3F6F8",
                }}
              >
                <Card.Content>
                  <Text style={{ fontSize: 16, textAlign: "center" }}>
                    Total de dinero
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      textAlign: "center",
                      color: "green",
                    }}
                  >
                    ${boxPreview?.totalMoney}
                  </Text>
                </Card.Content>
              </Card>
              <Card
                style={{
                  height: 90,
                  width: 170,
                  marginTop: 10,
                  marginLeft: 6,
                  backgroundColor: "#F3F6F8",
                }}
              >
                <Card.Content>
                  <Text style={{ fontSize: 16, textAlign: "center" }}>
                    Total en caja
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      textAlign: "center",
                      color: "green",
                    }}
                  >
                    ${boxPreview?.totalBox}
                  </Text>
                </Card.Content>
              </Card>
            </View> 
            
          </ScrollView>
        )}
        <View style={{ alignContent: "center", borderBlockColor: "#33C1FF" }}>
          {isGroupButton ? (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                gap: 30,
                marginBottom: 10,
              }}
            >
              

              
            </View>
          ) : (
            <>
              <View style={{}}>
               
              </View>
            </>
          )}
        </View>
      </View>
    </>
  );
};
export default Box_close;