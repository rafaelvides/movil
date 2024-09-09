import { ICloseBox } from "@/types/box/box.types";
import { useContext } from "react";
import {
  View,
  Image,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import stylesGlobals from "../Global/styles/StylesAppComponents";
import Card from "../Global/components_app/Card";
import Input from "../Global/components_app/Input";
import { ThemeContext } from "@/hooks/useTheme";
import { ScrollView } from "react-native-actions-sheet";

const CoinCards = ({
  boxValues,
  setBoxValues,
}: {
  boxValues: ICloseBox;
  setBoxValues: React.Dispatch<React.SetStateAction<ICloseBox>>;
}) => {
  const { theme } = useContext(ThemeContext);
  const handleInputChange = (field: keyof ICloseBox) => (text: string) => {
    const validNumber = text.replace(/[^0-9]/g, "");

    const numericValue = validNumber === "" ? 0 : parseInt(validNumber, 10);

    setBoxValues((prevBoxValues) => ({
      ...prevBoxValues,
      [field]: numericValue,
    }));
  };

  return (
    <>
      <View
        style={{
          padding: 10,
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Card style={{ ...stylesGlobals.CardBox, marginTop: 20 }}>
          <View style={stylesGlobals.ViewBox}>
            <Image
              style={{ width: "100%", height: 60 }}
              resizeMode="contain"
              source={require("@/assets/images/Cents and dollars/cents/01.png")}
            />
            <Text style={{ ...stylesGlobals.textCardBox, color: "black" }}>
              Moneda de 0.01
            </Text>
            <View
              style={{
                marginBottom: 40,
                backgroundColor: "white",
                borderRadius: 19,
              }}
            >
              <Input
                onChange={(e) =>
                  setBoxValues({
                    ...boxValues,
                    oneCents: Number(e.nativeEvent.text),
                  })
                }
                onChangeText={handleInputChange("oneCents")}
                values={boxValues.oneCents.toString()}
                placeholder="0"
                keyboardType="numeric"
                icon={"cash"}
              />
            </View>
          </View>
        </Card>
        <Card style={{ ...stylesGlobals.CardBox }}>
          <View style={stylesGlobals.ViewBox}>
            <Image
              style={{ width: "100%", height: 60 }}
              resizeMode="contain"
              source={require("@/assets/images/Cents and dollars/cents/5.png")}
            />
            <Text style={{ ...stylesGlobals.textCardBox }}>Moneda de 0.05</Text>
            <View style={{ marginBottom: 40 }}>
              <Input
                onChange={(e) =>
                  setBoxValues({
                    ...boxValues,
                    fiveCents: Number(e.nativeEvent.text),
                  })
                }
                onChangeText={handleInputChange("fiveCents")}
                values={boxValues.fiveCents.toString()}
                placeholder="0"
                keyboardType="numeric"
                icon={"cash"}
              />
            </View>
          </View>
        </Card>
        <Card style={stylesGlobals.CardBox}>
          <View style={stylesGlobals.ViewBox}>
            <Image
              style={{ width: "100%", height: 60 }}
              resizeMode="contain"
              source={require("@/assets/images/Cents and dollars/cents/10.png")}
            />
            <Text style={stylesGlobals.textCardBox}>Moneda de 0.10</Text>
            <View style={{ marginBottom: 40 }}>
              <Input
                onChange={(e) =>
                  setBoxValues({
                    ...boxValues,
                    tenCents: Number(e.nativeEvent.text),
                  })
                }
                onChangeText={handleInputChange("tenCents")}
                values={boxValues.tenCents.toString()}
                placeholder="0"
                keyboardType="numeric"
                icon={"cash"}
              />
            </View>
          </View>
        </Card>
        <Card style={stylesGlobals.CardBox}>
          <View style={stylesGlobals.ViewBox}>
            <Image
              style={{ width: "100%", height: 60 }}
              resizeMode="contain"
              source={require("@/assets/images/Cents and dollars/cents/25.png")}
            />
            <Text style={stylesGlobals.textCardBox}>Moneda de 0.25</Text>
            <View style={{ marginBottom: 40 }}>
              <Input
                onChange={(e) =>
                  setBoxValues({
                    ...boxValues,
                    twentyFiveCents: Number(e.nativeEvent.text),
                  })
                }
                onChangeText={handleInputChange("twentyFiveCents")}
                values={boxValues.twentyFiveCents.toString()}
                placeholder="0"
                keyboardType="numeric"
                icon={"cash"}
              />
            </View>
          </View>
        </Card>

        <Card style={stylesGlobals.CardBox}>
          <View style={stylesGlobals.ViewBox}>
            <Image
              style={{ width: "100%", height: 60 }}
              resizeMode="contain"
              source={require("@/assets/images/Cents and dollars/cents/1.png")}
            />
            <Text style={stylesGlobals.textCardBox}>Moneda de 1.00</Text>
            <View style={{ marginBottom: 40 }}>
              <Input
                onChange={(e) =>
                  setBoxValues({
                    ...boxValues,
                    oneDollarCents: Number(e.nativeEvent.text),
                  })
                }
                onChangeText={handleInputChange("oneDollarCents")}
                values={boxValues.oneDollarCents.toString()}
                placeholder="0"
                keyboardType="numeric"
                icon={"cash"}
              />
            </View>
          </View>
        </Card>
        <Card style={stylesGlobals.CardBox}>
          <View style={stylesGlobals.ViewBox}>
            <Image
              style={{ width: "100%", height: 60 }}
              resizeMode="contain"
              source={require("@/assets/images/Cents and dollars/dollars/one.jpg")}
            />
            <Text style={stylesGlobals.textCardBox}>Billete de $1.00</Text>
            <View style={{ marginBottom: 40 }}>
              <Input
                onChange={(e) =>
                  setBoxValues({
                    ...boxValues,
                    oneDollar: Number(e.nativeEvent.text),
                  })
                }
                onChangeText={handleInputChange("oneDollar")}
                values={boxValues.oneDollar.toString()}
                placeholder="0"
                keyboardType="numeric"
                icon={"cash"}
              />
            </View>
          </View>
        </Card>
        <Card style={stylesGlobals.CardBox}>
          <View style={stylesGlobals.ViewBox}>
            <Image
              style={{ width: "100%", height: 60 }}
              resizeMode="contain"
              source={require("@/assets/images/Cents and dollars/dollars/two.png")}
            />
            <Text style={stylesGlobals.textCardBox}>Billete de $2.00</Text>
            <View style={{ marginBottom: 40 }}>
              <Input
                onChange={(e) =>
                  setBoxValues({
                    ...boxValues,
                    twoDollars: Number(e.nativeEvent.text),
                  })
                }
                onChangeText={handleInputChange("twoDollars")}
                values={boxValues.twoDollars.toString()}
                placeholder="0"
                keyboardType="numeric"
                icon={"cash"}
              />
            </View>
          </View>
        </Card>
        <Card style={stylesGlobals.CardBox}>
          <View style={stylesGlobals.ViewBox}>
            <Image
              style={{ width: "100%", height: 60 }}
              resizeMode="contain"
              source={require("@/assets/images/Cents and dollars/dollars/five.png")}
            />
            <Text style={stylesGlobals.textCardBox}>Billete de $5.00</Text>
            <View style={{ marginBottom: 40 }}>
              <Input
                onChange={(e) =>
                  setBoxValues({
                    ...boxValues,
                    fiveDollars: Number(e.nativeEvent.text),
                  })
                }
                onChangeText={handleInputChange("fiveDollars")}
                values={boxValues.fiveDollars.toString()}
                placeholder="0"
                keyboardType="numeric"
                icon={"cash"}
              />
            </View>
          </View>
        </Card>
        <Card style={stylesGlobals.CardBox}>
          <View style={stylesGlobals.ViewBox}>
            <Image
              style={{ width: "100%", height: 60 }}
              resizeMode="contain"
              source={require("@/assets/images/Cents and dollars/dollars/10.png")}
            />
            <Text style={stylesGlobals.textCardBox}>Billete de $10.00</Text>
            <View style={{ marginBottom: 40 }}>
              <Input
                onChange={(e) =>
                  setBoxValues({
                    ...boxValues,
                    tenDollars: Number(e.nativeEvent.text),
                  })
                }
                onChangeText={handleInputChange("tenDollars")}
                values={boxValues.tenDollars.toString()}
                placeholder="0"
                keyboardType="numeric"
                icon={"cash"}
              />
            </View>
          </View>
        </Card>
        <Card style={stylesGlobals.CardBox}>
          <View style={stylesGlobals.ViewBox}>
            <Image
              style={{ width: "100%", height: 60 }}
              resizeMode="contain"
              source={require("@/assets/images/Cents and dollars/dollars/20.jpg")}
            />
            <Text style={stylesGlobals.textCardBox}>Billete de $20.00</Text>
            <View style={{ marginBottom: 40 }}>
              <Input
                onChange={(e) =>
                  setBoxValues({
                    ...boxValues,
                    twentyDollars: Number(e.nativeEvent.text),
                  })
                }
                onChangeText={handleInputChange("twentyDollars")}
                values={boxValues.twentyDollars.toString()}
                placeholder="0"
                keyboardType="numeric"
                icon={"cash"}
              />
            </View>
          </View>
        </Card>
        <Card style={stylesGlobals.CardBox}>
          <View style={stylesGlobals.ViewBox}>
            <Image
              style={{ width: "100%", height: 60 }}
              resizeMode="contain"
              source={require("@/assets/images/Cents and dollars/dollars/50.png")}
            />
            <Text style={stylesGlobals.textCardBox}>Billete de $50.00</Text>
            <View style={{ marginBottom: 40 }}>
              <Input
                onChange={(e) =>
                  setBoxValues({
                    ...boxValues,
                    fiftyDollars: Number(e.nativeEvent.text),
                  })
                }
                onChangeText={handleInputChange("fiftyDollars")}
                values={boxValues.fiftyDollars.toString()}
                placeholder="0"
                keyboardType="numeric"
                icon={"cash"}
              />
            </View>
          </View>
        </Card>
        <Card style={stylesGlobals.CardBox}>
          <View style={stylesGlobals.ViewBox}>
            <Image
              style={{ width: "98%", height: 60 }}
              resizeMode="contain"
              source={require("@/assets/images/Cents and dollars/dollars/100.png")}
            />
            <Text style={stylesGlobals.textCardBox}>Billete de $100.00</Text>
            <View style={{ marginBottom: 40 }}>
              <Input
                onChange={(e) =>
                  setBoxValues({
                    ...boxValues,
                    hundredDollars: Number(e.nativeEvent.text),
                  })
                }
                onChangeText={handleInputChange("hundredDollars")}
                values={boxValues.hundredDollars?.toString()}
                placeholder="0"
                keyboardType="numeric"
                icon={"cash"}
              />
            </View>
          </View>
        </Card>
      </View>
    </>
  );
};

export default CoinCards;
