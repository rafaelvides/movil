import { ThemeContext } from "@/hooks/useTheme";
import { useContext } from "react";
import { View, Text } from "react-native";

const DetailsProduct = ({
  total,
  montoDescuento,
  cantidad,
  buttonAction,
}: any) => {
  const { theme } = useContext(ThemeContext);

  return (
    <>
      <View
        style={{
          backgroundColor: theme.colors.dark,
          width: "100%",
          height: "auto",
          borderRadius: 30,
          padding: 10,
          justifyContent: "space-between",
          marginTop: "20%",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            marginBottom: 35,
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
      
      </View>
    </>
  );
};

export default DetailsProduct;
