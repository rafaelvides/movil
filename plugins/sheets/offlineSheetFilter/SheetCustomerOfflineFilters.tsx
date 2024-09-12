import { Pressable, StyleSheet, Text, View } from "react-native";
// import { Input } from "@/~/components/ui/input";
import ActionSheet, { SheetProps } from "react-native-actions-sheet";
import { useContext, useState } from "react";
import SwitchToggle from "@imcarlosguerrero/react-native-switch-toggle";
import Input from "@/components/Global/components_app/Input";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import Button from "@/components/Global/components_app/Button";
import { ThemeContext } from "@/hooks/useTheme";

const SheetCustomerOfflineFilters = ({
  sheetId,
  payload,
}: SheetProps<"customer-offline-filters-sheet">) => {
  const { theme } = useContext(ThemeContext);

  const [checked, setChecked] = useState(payload?.esContribuyente!);

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
              placeholder="Nombre del cliente..."
              onChangeText={payload?.onChangeValueName}
              defaultValue={payload?.name}
              icon="account"
            />
          </View>
          <Text style={stylesGlobals.textInput}>Num Documento</Text>
          <View style={stylesGlobals.inputFilter}>
            <Input
              placeholder="000000000/-0"
              onChangeText={payload?.onChangeValueNuD}
              defaultValue={payload?.numDocumento}
              icon="card-account-details"
            />
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 16,
            backgroundColor: "#fff",
            borderRadius: 10,
            elevation: 2,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "#333",
            }}
          >
            {checked ? "Clientes contribuyentes" : "Clientes normales"}
          </Text>
          <View>
            <SwitchToggle
              switchOn={checked}
              onPress={() => setChecked(!checked)}
              circleColorOff="#fff"
              circleColorOn="#fff"
              backgroundColorOn="#3956C0"
              backgroundColorOff="#C4C4C4"
              containerStyle={{
                marginTop: 10,
                width: 55,
                height: 32,
                borderRadius: 25,
                padding: 5,
              }}
              circleStyle={{
                width: 22,
                height: 22,
                borderRadius: 20,
              }}
            />
          </View>
        </View>
        <View style={stylesGlobals.viewBotton}>
          <Button
            withB={390}
            onPress={() => payload?.handleConfirm(checked)}
            Title="Filtrar"
            color={theme.colors.dark}
          />
        </View>
      </View>
    </ActionSheet>
  );
};

export default SheetCustomerOfflineFilters;

const styles = StyleSheet.create({});
