import Button from "@/components/Global/components_app/Button";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import { ThemeContext } from "@/hooks/useTheme";
import { useExpenseStore } from "@/store/expense.store";
import { AntDesign } from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import ActionSheet, { SheetProps } from "react-native-actions-sheet";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";

const SheetExpenseFilters = ({
  sheetId,
  payload,
}: SheetProps<"expense-filters-sheet">) => {
  const [category, setCategory] = useState(payload?.category || "");
  const [isFocus, setIsFocus] = useState(false);
  const { getCategoryExpenses, categoryExpenses } = useExpenseStore();
  const { theme } = useContext(ThemeContext);
  //--------useEffect------
  useEffect(() => {
    getCategoryExpenses();
  }, []);

  const handleCategory = (item: any) => {
    setCategory(item.name);
  };

  return (
    <>
      <ActionSheet
        id={sheetId}
        statusBarTranslucent={true}
        drawUnderStatusBar={false}
        gestureEnabled={true}
        containerStyle={{ paddingHorizontal: 12, 
          height: "auto" }}
        springOffset={50}
        defaultOverlayOpacity={0.4}
      >
        <View style={{ marginBottom: "10%" }}>
          <View
            style={{justifyContent: "center",  alignItems: "center"}}>
            <Text style={{ fontSize: 20 }}>Filtros disponibles</Text>
          </View>
          <View style={{width: "100%",marginTop:10}}>
            <Text style={stylesGlobals.textInput}>
              Categoría de gastos
            </Text>
            <SafeAreaView
              style={{
                width:"100%",
                borderWidth:1,
                borderColor: "#D1D5DB",
                padding: 12,
                borderRadius: 15,
              }}
            >
              <Dropdown
                style={[isFocus && { borderColor: "blue" }]}
                containerStyle={{
                  marginVertical: "50%",
                }}                
                placeholderStyle={stylesGlobals.placeholderStyle}
                selectedTextStyle={stylesGlobals.selectedTextStyle}
                inputSearchStyle={stylesGlobals.inputSearchStyle}
                iconStyle={stylesGlobals.iconStyle}
                data={categoryExpenses}
                itemTextStyle={{
                  fontSize: 16,
                }}
                search
                maxHeight={250}
                labelField="name"
                valueField="name"
                searchPlaceholder="Escribe para buscar..."
                placeholder={!isFocus ? "Selecciona un item " : "..."}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={(item) => {
                  handleCategory(item);
                  setIsFocus(false);
                }}
                renderLeftIcon={() => (
                  <AntDesign
                    style={stylesGlobals.renderLeftIcon}
                    color={isFocus ? "blue" : "black"}
                    name="Safety"
                    size={20}
                  />
                )}
              />
            </SafeAreaView>
          </View>

          <View style={stylesGlobals.viewBotton}>
            <Button
              withB={390}
              onPress={() => payload?.handleConfirm(category)}
              Title="Filtrar"
              color={theme.colors.dark}
            />
          </View>
        </View>
      </ActionSheet>
    </>
  );
};

export default SheetExpenseFilters;

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
    borderWidth: 1,
    borderRadius: 15,
    fontSize: 16,
  },
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
  iconExpense: {
    marginRight: 5,
  },
});
