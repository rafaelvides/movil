import Button from "@/components/Global/components_app/Button";
import { ThemeContext } from "@/hooks/useTheme";
import { useContext } from "react";
import { View, Text } from "react-native";

const DetailsProduct = ({
  total,
  montoDescuento,
  cantidad,
  buttonAction,
  color,
  colorB,
}: {
  total: string;
  montoDescuento: string;
  cantidad: number;
  buttonAction: () => void;
  color?: string;
  colorB?: string;
}) => {
  const { theme } = useContext(ThemeContext);
  const bg = color ? color : theme.colors.dark;
  const bgB = colorB ? colorB : theme.colors.third;
  return (
    <>
      <View
        style={{
          position: "absolute",
          backgroundColor: bg,
          width: "100%",
          height: "auto",
          borderTopStartRadius: 20,
          borderTopRightRadius: 20,
          padding: 10,
          bottom: 0,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            marginBottom: 15,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              width: "30%",
              borderRadius: 15,
              padding: 10,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 4,
            }}
          >
            <Text
              style={{
                color: theme.colors.dark,
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              {cantidad}
            </Text>
            <Text
              style={{
                color: theme.colors.dark,
                fontSize: 12,
                marginTop: 8,
              }}
            >
              Cantidad
            </Text>
          </View>

          <View
            style={{
              backgroundColor: "white",
              width: "30%",
              borderRadius: 15,
              padding: 10,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 4,
            }}
          >
            <Text
              style={{
                color: theme.colors.dark,
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              ${montoDescuento}
            </Text>
            <Text
              style={{
                color: theme.colors.dark,
                fontSize: 12,
                marginTop: 8,
              }}
            >
              Descuento
            </Text>
          </View>

          <View
            style={{
              backgroundColor: "white",
              width: "30%",
              borderRadius: 15,
              padding: 10,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 4,
            }}
          >
            <Text
              style={{
                color: theme.colors.dark,
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              {total}
            </Text>
            <Text
              style={{
                color: theme.colors.dark,
                fontSize: 12,
                marginTop: 8,
              }}
            >
              Total
            </Text>
          </View>
        </View>
        {cantidad > 0 && (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Button
              Title="Enviar"
              onPress={() => {
                buttonAction();
              }}
              color={bgB}
            />
          </View>
        )}
      </View>
    </>
  );
};

export default DetailsProduct;
