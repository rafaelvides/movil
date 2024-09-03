import { IGetBoxDetail } from "@/types/box/box.types";
import { useEffect } from "react";
import { ScrollView, View, Text } from "react-native";
import Card from "../Global/components_app/Card";
import stylesGlobals from "../Global/styles/StylesAppComponents";

const BoxAccounting = ({
  idBox,
  boxPreview,
}: {
  idBox?: number;
  boxPreview: IGetBoxDetail | undefined;
}) => {
  useEffect(() => {}, [boxPreview]);

  return (
    <>
      <ScrollView style={{ marginBottom: 2 }}>
        <View style={stylesGlobals.View}>
          <Card style={stylesGlobals.card}>
            <View>
              <Text style={stylesGlobals.textContentInCard}>
                Monto inicial de caja
              </Text>
              <Text style={stylesGlobals.styleTextData}>
                ${boxPreview?.boxStart}
              </Text>
            </View>
          </Card>

          <Card style={{...stylesGlobals.card,marginLeft: 6}}>
          <View style={{marginLeft:30}}>
              <Text style={stylesGlobals.textContentInCard}>
                Gastos
              </Text>
              <Text style={{...stylesGlobals.styleTextData, color:"red"}}>
                ${boxPreview?.totalExpenses}
              </Text>
            </View>
          </Card>
          <Card style={{...stylesGlobals.card}}>
          <View>
              <Text style={stylesGlobals.textContentInCard}>
                Total en ventas
              </Text>
              <Text style={{...stylesGlobals.styleTextData, color:"green"}}>
                ${boxPreview?.totalSales}
              </Text>
            </View>
          </Card>
          <Card style={{...stylesGlobals.card,marginLeft: 6}}>
          <View style={{marginLeft:30}}>
          <Text style={stylesGlobals.textContentInCard}>
                {boxPreview!.cost < 0 ? "Faltante" : "Excedente"}
              </Text>
              <Text
                style={
                  boxPreview!.cost < 0
                    ? { color: "red", textAlign: "center" }
                    : { color: "green", textAlign: "center" }
                }
              >
                $
                {typeof boxPreview?.cost === "number"
                  ? boxPreview?.cost.toFixed(2)
                  : ""}{" "}
              </Text>
            </View>
          </Card>
          <Card style={{...stylesGlobals.card}}>
          <View>
              <Text style={stylesGlobals.textContentInCard}>
                Total de dinero
              </Text>
              <Text style={{...stylesGlobals.styleTextData, color:"green"}}>
                ${boxPreview?.totalMoney}
              </Text>
            </View>
          </Card>
          <Card style={{...stylesGlobals.card,marginLeft: 6}}>
          <View style={{marginLeft:20}}>
              <Text style={stylesGlobals.textContentInCard}>
                Total en caja
              </Text>
              <Text style={{...stylesGlobals.styleTextData, color:"red"}}>
                ${boxPreview?.totalBox}
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </>
  );
};

export default BoxAccounting;
