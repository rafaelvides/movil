import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import React, { useContext, useState } from "react";
import ActionSheet, { SheetProps } from "react-native-actions-sheet";
import { useBranchStore } from "@/store/branch.store";
import { MapType } from "react-native-maps";
import { IBranch } from "@/types/branch/branch.types";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import { typeMap } from "@/utils/type_maps";
// import { Input } from "@/~/components/ui/input";
import { DatePickerModal } from "react-native-paper-dates";
import { returnDate } from "@/utils/date";
import Input from "@/components/Global/components_app/Input";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import SwitchToggle from "@imcarlosguerrero/react-native-switch-toggle";
import Button from "@/components/Global/components_app/Button";
import { ThemeContext } from "@/hooks/useTheme";

const SheetMapRouterFilters = ({
  sheetId,
  payload,
}: SheetProps<"map-router-filters-sheet">) => {
  const [isFocus, setIsFocus] = useState(false);
  const [isFocusBran, setIsFocusBran] = useState(false);
  const [showCalendarStart, setShowCalendarStart] = useState(false);
  const [selectedOptionMap, setSelectedOptionMap] = useState<MapType>(
    payload?.selectedOptionMap!
  );
  const [checked, setChecked] = useState(payload?.checked!);
  const [startDate, setStartDate] = useState(
    payload?.startDate
      ? new Date(
          new Date(payload.startDate).getTime() +
            new Date().getTimezoneOffset() * 60000
        )
      : new Date()
  );
  const { theme } = useContext(ThemeContext);

  const [selectedBranch, setSelectedBranch] = useState<IBranch>(
    payload?.selectedBranch!
  );
  const { branches } = useBranchStore();

  const handleMapTypeChange = (newMapType: MapType) => {
    setSelectedOptionMap(newMapType);
    payload?.setSelectedOptionMap(newMapType);
  };
  return (
    <>
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
                  marginVertical: "15%",
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
            <Text style={stylesGlobals.textInput}>Sucursal en tiempo real</Text>
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
                style={[isFocusBran && { borderColor: "blue" }]}
                containerStyle={{
                  marginVertical: "15%",
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
                      color={isFocusBran ? "blue" : "black"}
                      name="Safety"
                      size={20}
                    />
                  )
                }
              />
            </SafeAreaView>
          </View>
          <View style={{ marginTop: 15, width: "100%" }}>
            <Text style={stylesGlobals.textInput}>Fechas de la ubicación</Text>
            <View style={styles.inputWrapper}>
              <Input
                icon={"calendar-multiple"}
                values={startDate.toLocaleDateString()}
                onPress={() => setShowCalendarStart(true)}
              />
            </View>
          </View>
          <View
            style={{
              marginTop: 15,
              marginBottom: 10,
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
            <SwitchToggle
              switchOn={checked}
              onPress={() => setChecked(!checked)}
              circleColorOff="#fff"
              circleColorOn="#fff"
              backgroundColorOn="#3956C0"
              backgroundColorOff="#C4C4C4"
              containerStyle={{
                // marginTop: 10,
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
          <View style={stylesGlobals.viewBotton}>
            <Button
              withB={390}
              onPress={() =>
                payload?.handleConfirm(
                  selectedOptionMap,
                  selectedBranch,
                  returnDate(startDate),
                  checked
                )
              }
              Title="Filtrar"
              color={theme.colors.dark}
            />
          </View>
        </View>
      </ActionSheet>
      <DatePickerModal
        locale="es"
        mode="single"
        date={new Date(startDate)}
        visible={showCalendarStart}
        onConfirm={({ date }) => {
          if (date) {
            setStartDate(date);
          }
          setShowCalendarStart(false);
        }}
        onDismiss={() => {
          setShowCalendarStart(false);
        }}
      />
    </>
  );
};

export default SheetMapRouterFilters;

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
  inputWrapper: {
    position: "relative",
    width: "100%",
    height: 50,
    justifyContent: "center",
    marginBottom: 5,
  },
  iconInput: {
    position: "absolute",
    right: 20,
    top: "50%",
    transform: [{ translateY: -15 }],
  },
  input: {
    height: "100%",
    paddingLeft: 15,
    borderColor: "#D9D9DA",
    borderWidth: 1,
    borderRadius: 15,
    fontSize: 16,
  },
});
