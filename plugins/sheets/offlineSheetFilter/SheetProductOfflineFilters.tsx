import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import ActionSheet, { SheetProps } from "react-native-actions-sheet";
// import { Input } from "@/~/components/ui/input";

const SheetProductOfflineFilters = ({
  sheetId,
  payload,
}: SheetProps<"product-offline-filters-sheet">) => {
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
          
          </View>
          <Text style={{ marginLeft: "3%", fontWeight: "500" }}>Código</Text>
          <View style={styles.inputWrapper}>
            
          </View>
        </View>
        <Pressable
          onPress={() => payload?.handleConfirm()}
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
