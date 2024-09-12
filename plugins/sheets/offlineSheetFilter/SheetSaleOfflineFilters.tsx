import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import React, { useContext, useState } from "react";
import ActionSheet, { SheetProps } from "react-native-actions-sheet";
import { Dropdown } from "react-native-element-dropdown";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { ICat002TipoDeDocumento } from "@/types/billing/cat-002-tipo-de-documento.types";
import { DatePickerModal } from "react-native-paper-dates";
import { returnDate } from "@/utils/date";
import { type_document_filter } from "@/offline/global/dte/document_to_be_issued";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import Input from "@/components/Global/components_app/Input";
import Button from "@/components/Global/components_app/Button";
import { ThemeContext } from "@/hooks/useTheme";

const SheetSaleOfflineFilters = ({
  sheetId,
  payload,
}: SheetProps<"sale-offline-filters-sheet">) => {
  const [isFocusTipoDocum, setIsFocusTipoDocum] = useState(false);
  const [typeDoc, setTypeDocument] = useState<ICat002TipoDeDocumento>(
    payload!.typeDTE
  );
  const [showCalendarStart, setShowCalendarStart] = useState(false);
  const { theme } = useContext(ThemeContext);

  const [startDate, setStartDate] = useState(
    payload?.startDate
      ? new Date(
          new Date(payload.startDate).getTime() +
            new Date().getTimezoneOffset() * 60000
        )
      : new Date()
  );
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
            <View style={{ width: "100%", marginTop: 20 }}>
              <Text style={stylesGlobals.textInput}>Tipo documento</Text>
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
                  style={[isFocusTipoDocum && { borderColor: "blue" }]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  iconStyle={styles.iconStyle}
                  containerStyle={{
                    top: "57%",
                  }}
                  data={type_document_filter}
                  itemTextStyle={{
                    fontSize: 16,
                  }}
                  search
                  maxHeight={250}
                  labelField="valores"
                  valueField="id"
                  placeholder={
                    !isFocusTipoDocum
                      ? payload?.typeDTE
                        ? payload.typeDTE.valores
                        : "Selecciona un item "
                      : "..."
                  }
                  searchPlaceholder="Escribe para buscar..."
                  value={typeDoc}
                  onFocus={() => setIsFocusTipoDocum(true)}
                  onBlur={() => setIsFocusTipoDocum(false)}
                  onChange={(item) => {
                    setTypeDocument(item);
                    setIsFocusTipoDocum(false);
                  }}
                  renderLeftIcon={() => (
                    <AntDesign
                      style={styles.icon}
                      color={isFocusTipoDocum ? "blue" : "black"}
                      name="Safety"
                      size={20}
                    />
                  )}
                />
              </SafeAreaView>
            </View>
            <View style={{ marginTop: 15, width: "100%" }}>
              <Text style={stylesGlobals.textInput}>
                Fechas de la ubicación
              </Text>
              <View style={styles.inputWrapper}>
                <Input
                  icon={"calendar-multiple"}
                  values={startDate.toLocaleDateString()}
                  onPress={() => setShowCalendarStart(true)}
                />
              </View>
            </View>
            <Text style={stylesGlobals.textInput}>Total</Text>
            <View style={styles.inputWrapper}>
              <Input
                placeholder="Total de la venta..."
                defaultValue={payload?.totalP}
                onChangeText={payload?.onChangeValueTotalP}
                icon="currency-usd"
              />
            </View>
          </View>
          <View style={stylesGlobals.viewBotton}>
            <Button
              withB={390}
              onPress={() =>
                payload?.handleConfirm(returnDate(startDate), typeDoc)
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

export default SheetSaleOfflineFilters;

const styles = StyleSheet.create({
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  icon: {
    marginRight: 5,
  },
  inputWrapper: {
    position: "relative",
    width: "100%",
    height: 50,
    justifyContent: "center",
    marginBottom: 15,
  },
  input: {
    height: "100%",
    paddingLeft: 15,
    borderColor: "#D9D9DA",
    borderWidth: 1,
    borderRadius: 15,
    fontSize: 16,
  },
  iconInput: {
    position: "absolute",
    right: 20,
    top: "50%",
    transform: [{ translateY: -15 }],
  },
});
