import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import ActionSheet, { SheetProps } from "react-native-actions-sheet";
import { Dropdown } from "react-native-element-dropdown";
import { typeMap } from "@/utils/type_maps";
import { AntDesign } from "@expo/vector-icons";
import { MapType } from "react-native-maps";
import { useBranchStore } from "@/store/branch.store";
import { IBranch } from "@/types/branch/branch.types";

const SheetMapRealTimeFiters = ({
  sheetId,
  payload,
}: SheetProps<"map-real-time-filters-sheet">) => {
  const [isFocus, setIsFocus] = useState(false);
  const [isFocusBran, setIsFocusBran] = useState(false);
  const [selectedOptionMap, setSelectedOptionMap] = useState<MapType>(
    payload?.selectedOptionMap!
  );
  const [selectedBranch, setSelectedBranch] = useState<IBranch>(
    payload?.selectedBranch!
  );
  const { branches } = useBranchStore();

  const handleMapTypeChange = (newMapType: MapType) => {
    setSelectedOptionMap(newMapType);
    payload?.setSelectedOptionMap(newMapType);
  };
  return (
    <ActionSheet
      id={sheetId}
      statusBarTranslucent={true}
      drawUnderStatusBar={false}
      gestureEnabled={true}
      containerStyle={{
        paddingHorizontal: 12,
        height: "auto",
      }}
      springOffset={50}
      defaultOverlayOpacity={0.4}
    >
      <View style={{ marginBottom: "10%" }}>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 20 }}>Filtros de ubicación</Text>
        </View>
        <View style={{ width: "100%", marginTop: 10 }}>
          <Text style={{ fontWeight: "500", marginTop: 10 }}>Tipo de mapa</Text>
          <SafeAreaView
            style={{
              width: "100%",
              marginTop: 10,
              borderWidth: 1,
              borderColor: "#D1D5DB",
              padding: 12,
              borderRadius: 5,
            }}
          >
            <Dropdown
              style={[isFocus && { borderColor: "blue" }]}
              containerStyle={{
                marginVertical: "34%",
              }}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={typeMap}
              itemTextStyle={{
                fontSize: 16,
              }}
              search
              maxHeight={250}
              labelField="name"
              valueField="name"
              placeholder={!isFocus ? "Selecciona un item " : "..."}
              searchPlaceholder="Escribe para buscar..."
              value={selectedOptionMap}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={(item) => {
                handleMapTypeChange(item.name);
                setIsFocus(false);
              }}
              renderLeftIcon={() => (
                <AntDesign
                  style={styles.icon}
                  color={isFocus ? "blue" : "black"}
                  name="Safety"
                  size={20}
                />
              )}
            />
          </SafeAreaView>
        </View>
        <View style={{ width: "100%", marginTop: 10 }}>
          <Text style={{ fontWeight: "500", marginTop: 10 }}>
            Sucursal en tiempo real
          </Text>
          <SafeAreaView
            style={{
              width: "100%",
              marginTop: 10,
              borderWidth: 1,
              borderColor: "#D1D5DB",
              padding: 12,
              borderRadius: 5,
            }}
          >
            <Dropdown
              style={[isFocusBran && { borderColor: "blue" }]}
              containerStyle={{
                marginVertical: "34%",
              }}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={branches}
              itemTextStyle={{
                fontSize: 16,
              }}
              search
              maxHeight={250}
              labelField="name"
              valueField="id"
              placeholder={!isFocusBran ? "Selecciona un item " : "..."}
              searchPlaceholder="Escribe para buscar..."
              value={selectedBranch}
              onFocus={() => setIsFocusBran(true)}
              onBlur={() => setIsFocusBran(false)}
              onChange={(item) => {
                setSelectedBranch(item);
                setIsFocusBran(false);
              }}
              renderLeftIcon={() =>
                selectedBranch ? (
                  selectedBranch.location ? (
                    <AntDesign
                      style={styles.icon}
                      color={"green"}
                      name="checkcircle"
                      size={20}
                    />
                  ) : (
                    <AntDesign
                      style={styles.icon}
                      color={"red"}
                      name="closecircle"
                      size={20}
                    />
                  )
                ) : (
                  <AntDesign
                    style={styles.icon}
                    color={isFocus ? "blue" : "black"}
                    name="Safety"
                    size={20}
                  />
                )
              }
            />
          </SafeAreaView>
        </View>
        <Pressable
          onPress={() =>
            payload?.handleConfirm(selectedOptionMap, selectedBranch)
          }
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 4,
            backgroundColor: "#1d4ed8",
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

export default SheetMapRealTimeFiters;

const styles = StyleSheet.create({
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  
  },
  icon: {
    marginRight: 5,
  },
});
