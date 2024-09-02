import Button from "@/components/Global/components_app/Button";
import Input from "@/components/Global/components_app/Input";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import { ThemeContext } from "@/hooks/useTheme";
import { useContext } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import ActionSheet, { SheetProps } from "react-native-actions-sheet";

const SheetCustomerFilters = ({
  sheetId,
  payload,
}: SheetProps<"customer-filters-sheet">) => {
  const { theme } = useContext(ThemeContext);

  return (
    <>
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
            <View style={styles.inputWrapper}>
              <Input
                placeholder="Nombre del cliente..."
                onChangeText={payload?.onChangeValueName}
                defaultValue={payload?.name}
                icon="account"
              />
            </View>
            <Text style={stylesGlobals.textInput}>Correo</Text>
            <View style={styles.inputWrapper}>
              <Input
                placeholder="example@gmail.com"
                defaultValue={payload?.correo}
                onChangeText={payload?.onChangeValueCorreo}
                icon="gmail"
              />
            </View>
          </View>
          <View
            style={stylesGlobals.viewBotton}
          >
            <Button
              withB={390}
              onPress={() => payload?.handleConfirm()}
              Title="Filtrar"
              color={theme.colors.dark}
            />
          </View>
        </View>
      </ActionSheet>
    </>
  );
};
export default SheetCustomerFilters;

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
