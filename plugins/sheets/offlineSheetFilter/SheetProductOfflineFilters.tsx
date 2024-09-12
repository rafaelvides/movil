import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useContext } from "react";
import ActionSheet, { SheetProps } from "react-native-actions-sheet";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import Input from "@/components/Global/components_app/Input";
import Button from "@/components/Global/components_app/Button";
import { ThemeContext } from "@/hooks/useTheme";
// import { Input } from "@/~/components/ui/input";

const SheetProductOfflineFilters = ({
  sheetId,
  payload,
}: SheetProps<"product-offline-filters-sheet">) => {
  const { theme } = useContext(ThemeContext);

  return (
    <ActionSheet
      id={sheetId}
      statusBarTranslucent={true}
      drawUnderStatusBar={false}
      gestureEnabled={true}
      containerStyle={{ paddingHorizontal: 12, height: "auto" }}
      springOffset={50}
      defaultOverlayOpacity={0.4}
    >
      <View style={{ marginBottom: "10%" }}>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 20 }}>Filtros disponibles</Text>
        </View>
        <View
          style={{
            marginTop: 15,
            width: "100%",
          }}
        >
          <Text style={stylesGlobals.textInput}>Nombre</Text>
          <View style={stylesGlobals.inputFilter}>
            <Input
              placeholder="Nombre del producto..."
              onChangeText={payload?.onChangeValueName}
              defaultValue={payload?.name}
              icon="shopping"
            />
          </View>
          <Text style={stylesGlobals.textInput}>Código</Text>
          <View style={stylesGlobals.inputFilter}>
            <Input
              placeholder="000000000"
              onChangeText={payload?.onChangeValueCode}
              defaultValue={payload?.code}
              icon="barcode-scan"
            />
          </View>
        </View>
        <View style={stylesGlobals.viewBotton}>
          <Button
            withB={390}
            onPress={() => payload?.handleConfirm()}
            Title="Filtrar"
            color={theme.colors.dark}
          />
        </View>
      </View>
    </ActionSheet>
  );
};

export default SheetProductOfflineFilters;

const styles = StyleSheet.create({
  inputWrapper: {
    position: "relative",
    width: "100%",
    height: 50,
    justifyContent: "center",
    marginBottom: 15,
  },
  icon: {
    position: "absolute",
    right: 20,
    top: "50%",
    transform: [{ translateY: -15 }],
  },
  input: {
    height: "100%",
    paddingLeft: 15,
    borderColor: "#D9D9DA",
    fontSize: 16,
  },
});
