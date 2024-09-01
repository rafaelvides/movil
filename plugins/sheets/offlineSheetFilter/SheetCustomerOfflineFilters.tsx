import { Pressable, StyleSheet, Text, View } from "react-native";
// import { Input } from "@/~/components/ui/input";
import ActionSheet, { SheetProps } from "react-native-actions-sheet";
import { useState } from "react";
import SwitchToggle from "@imcarlosguerrero/react-native-switch-toggle";

const SheetCustomerOfflineFilters = ({
  sheetId,
  payload,
}: SheetProps<"customer-offline-filters-sheet">) => {
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
          <Text style={{ marginLeft: "3%", fontWeight: "500" }}>Nombre</Text>
          <View style={styles.inputWrapper}>
            {/* <Input
              className="rounded-3xl"
              style={styles.input}
              placeholder="Nombre del cliente..."
              defaultValue={payload?.name}
              onChangeText={payload?.onChangeValueName}
              aria-labelledby="inputLabel"
              aria-errormessage="inputError"
            /> */}
          </View>
          <Text style={{ marginLeft: "3%", fontWeight: "500" }}>
            Num Documento
          </Text>
          <View style={styles.inputWrapper}>
            {/* <Input
              className="rounded-3xl"
              style={styles.input}
              placeholder="000000000/-0"
              defaultValue={payload?.numDocumento}
              onChangeText={payload?.onChangeValueNuD}
              aria-labelledby="inputLabel"
              aria-errormessage="inputError"
            /> */}
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
        <Pressable
          onPress={() => payload?.handleConfirm(checked)}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 4,
            backgroundColor: "#1F91DC",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            Filtrar
          </Text>
        </Pressable>
      </View>
    </ActionSheet>
  );
};

export default SheetCustomerOfflineFilters;

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
