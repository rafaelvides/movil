import { StyleSheet, Pressable, SafeAreaView, Text, View } from "react-native";
import React, { useContext, useState } from "react";
import ActionSheet, { SheetProps } from "react-native-actions-sheet";
import { Dropdown } from "react-native-element-dropdown";
import { typeMap } from "@/utils/type_maps";
import { AntDesign } from "@expo/vector-icons";
import { MapType } from "react-native-maps";
import { useCustomerStore } from "@/store/customer.store";
import { ICustomer } from "@/types/customer/customer.types";
import SwitchToggle from "@imcarlosguerrero/react-native-switch-toggle";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import Button from "@/components/Global/components_app/Button";
import { ThemeContext } from "@/hooks/useTheme";

const SheetRoutesDestinationFilters = ({
  sheetId,
  payload,
}: SheetProps<"routes-destination-filters-sheet">) => {
  const [isFocus, setIsFocus] = useState(false);
  const [isFocusBran, setIsFocusBran] = useState(false);
  const [selectedOptionMap, setSelectedOptionMap] = useState<MapType>(
    payload?.selectedOptionMap!
  );
  const [checked, setChecked] = useState(payload?.checked!);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer>(
    payload?.selectedCustomer!
  );
  const { theme } = useContext(ThemeContext);

  const { customer_list } = useCustomerStore();
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
          <Text style={stylesGlobals.textInput}>Tipo de mapa</Text>
          <SafeAreaView
            style={{
              width: "100%",
              borderWidth: 1,
              borderColor: "#D1D5DB",
              padding: 12,
              borderRadius: 15,
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
            Cliente destino
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
              data={customer_list}
              itemTextStyle={{
                fontSize: 16,
              }}
              search
              maxHeight={250}
              labelField="nombre"
              valueField="id"
              placeholder={!isFocusBran ? "Selecciona un item " : "..."}
              searchPlaceholder="Escribe para buscar..."
              value={selectedCustomer}
              onFocus={() => setIsFocusBran(true)}
              onBlur={() => setIsFocusBran(false)}
              onChange={(item) => {
                setSelectedCustomer(item);
                setIsFocusBran(false);
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
        <View
          style={{
            marginTop: 15,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 12,
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
            {checked
              ? "Mostrando en tiempo real"
              : "Desactivado en tiempo real"}
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
            onPress={() =>
              payload?.handleConfirm(
                selectedOptionMap,
                selectedCustomer,
                checked
              )
            }
            Title="Filtrar"
            color={theme.colors.dark}
          />
        </View>
      </View>
    </ActionSheet>
  );
};

export default SheetRoutesDestinationFilters;

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
