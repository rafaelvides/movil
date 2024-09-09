import { IGetBoxDetail } from "@/types/box/box.types";
import { useContext, useEffect } from "react";
import { ScrollView, View, Text } from "react-native";
import Card from "../Global/components_app/Card";
import stylesGlobals from "../Global/styles/StylesAppComponents";
import { ThemeContext } from "@/hooks/useTheme";

const BoxAccounting = ({
  idBox,
  boxPreview,
}: {
  idBox?: number;
  boxPreview?: IGetBoxDetail | undefined;
}) => {
  useEffect(() => {}, [boxPreview]);

  const { theme } = useContext(ThemeContext);
  return (
    <>
      <Card
        style={{
          width: "96%",
          height: "24%",
          borderRadius: 30,
          // marginTop: 10,
          marginBottom: 14,
          left: 7,
        }}
      >
        <ScrollView>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 20,
              justifyContent:"center"
            }}
          >
            <View
              style={{
                width: 140,
                height: 60
              }}
            >
              <Text
                style={{
                  color: theme.colors.dark,
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                Monto inicial
              </Text>
              <Text style={{ fontSize: 16, color: "red", top: 6 }}>
                ${boxPreview?.boxStart}
              </Text>
            </View>

            <View
              style={{
                width: 140,
                height: 60
              }}
            >
              <Text
                style={{
                  color: theme.colors.dark,
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                Gastos
              </Text>
              <Text style={{ fontSize: 16, color: "red", top: 6 }}>
                ${boxPreview?.totalExpenses}
              </Text>
            </View>

            <View
              style={{
                width: 140,
                height: 60
              }}
            >
              <Text
                style={{
                  color: theme.colors.dark,
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                Total en venta
              </Text>
              <Text style={{ fontSize: 16, color: "green", top: 6 }}>
                ${boxPreview?.totalSales}
              </Text>
            </View>

            <View
              style={{
                width: 140,
                height: 60
              }}
            >
              <Text
                style={{
                  fontWeight:"bold",
                  fontSize: 16,
                  color:
                    boxPreview && boxPreview?.cost < 0
                      ? "red"
                      : theme.colors.dark,
                }}
              >
                {boxPreview && boxPreview?.cost < 0 ? "Faltante" : "Excedente"}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: boxPreview && boxPreview?.cost < 0 ? "red" : "green",
                  top: 6,
                }}
              >
                $
                {typeof boxPreview?.cost === "number"
                  ? boxPreview?.cost.toFixed(2)
                  : ""}
              </Text>
            </View>

            <View
              style={{
                width: 140,
                height: 60
         
              }}
            >
              <Text
                style={{
                  color: theme.colors.dark,
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                Total dinero
              </Text>
              <Text style={{ fontSize: 16, color: "red", top: 6 }}>
                ${boxPreview?.totalMoney}
              </Text>
            </View>

            <View
              style={{
                width: 140,
                height: 60
              }}
            >
              <Text
                style={{
                  color: theme.colors.dark,
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                Total en caja
              </Text>
              <Text style={{ fontSize: 16, color: "green", top: 6 }}>
                ${boxPreview?.totalBox}
              </Text>
            </View>
          </View>
        </ScrollView>
      </Card>

      
    </>
  );
};

export default BoxAccounting;
