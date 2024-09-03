import { ThemeContext } from "@/hooks/useTheme";
import { get_box_data } from "@/plugins/async_storage";
import { useExpenseStore } from "@/store/expense.store";
import {
  IExpensePayload,
  IUpdateExpense,
} from "@/types/expenses/expense.types";
import { AntDesign } from "@expo/vector-icons";
import { Formik } from "formik";
import { useContext, useEffect, useState } from "react";
import {
  Text,
  SafeAreaView,
  ToastAndroid,
  View,

} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { ScrollView } from "react-native-gesture-handler";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import * as yup from "yup";
import stylesGlobals from "../Global/styles/StylesAppComponents";
import Input from "../Global/components_app/Input";
import Button from "../Global/components_app/Button";

interface Props {
  closeModal: () => void;
  expenses?: IExpensePayload;
  id?: number;
}

export const UpdateExpenses = (props: Props) => {
  const [isFocus, setIsFocus] = useState(false);
  const { update_expenses, getCategoryExpenses, categoryExpenses } =
    useExpenseStore();
  const [boxId, setBoxId] = useState(0);
  const [category, setCategory] = useState("");

  

  const validationSchema = yup.object().shape({
    description: yup.string().required("*La descripción es requerida"),
    total: yup
      .number()
      .required("*El total es requerido")
      .min(0.01, "*El total debe ser mayor a 0.01")
      .positive("*El total debe ser mayor a 0"),
  });

  const onSubmit = async (payload: IUpdateExpense) => {
    try {
      await update_expenses(payload, props.id!);
      props.closeModal();
    } catch (error) {
      ToastAndroid.show("Error al editar este registro", ToastAndroid.LONG);
      props.closeModal();
    }
  };

  useEffect(() => {
    const selectedCategory = () => {
      if (props.expenses?.categoryExpenseId) {
        categoryExpenses.map((data) => {
          if (data.id === props.expenses?.categoryExpenseId) {
            setCategory(data.name);
          }
        });
      }
    };
    selectedCategory();
    selectedCategory();
    getCategoryExpenses();
  }, [props.expenses?.categoryExpenseId, category, categoryExpenses]);

  return (
    <>
      <Formik
        onSubmit={onSubmit}
        validationSchema={validationSchema}
        initialValues={{
          description: props.expenses?.description ?? "",
          total: props.expenses?.total ?? 0,
          categoryExpenseId: props.expenses?.categoryExpenseId ?? 0,
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <>
            <MaterialCommunityIcons
              size={20}
              name="close"
              color="black"
              onPress={() => props.closeModal()}
              style={stylesGlobals.materialIconsStyle}
            />
            <SafeAreaView
              style={{
                ...stylesGlobals.safeAreaForm,
              }}
            >
              <View
                style={{
                  width: 260,
                }}
              >
                <ScrollView>
                  <Text style={stylesGlobals.textInput}>
                    Descripción <Text style={{ color: "#EF4444" }}>*</Text>
                  </Text>
                  <Input
                    handleBlur={handleBlur("description")}
                    onChangeText={handleChange("description")}
                    placeholder="Ingrese una descripción"
                    values={values.description}
                    defaultValue={props.expenses?.description}
                    icon={"clipboard-text"}
                  />
                  {errors.description && touched.description && (
                    <Text style={{ color: "#EF4444", marginBottom: 5 }}>
                      {errors.description}
                    </Text>
                  )}
                  <Text style={stylesGlobals.textInput}>
                    Categoría<Text style={{ color: "#EF4444" }}>*</Text>
                  </Text>
                  <Dropdown
                    style={[
                      isFocus ? stylesGlobals.isFocusStyles : {},
                      { ...stylesGlobals.styleDropdown },
                    ]}
                    placeholderStyle={stylesGlobals.placeholderStyle}
                    selectedTextStyle={stylesGlobals.selectedTextStyle}
                    iconStyle={stylesGlobals.iconStyle}
                    data={categoryExpenses}
                    itemTextStyle={{
                      fontSize: 16,
                    }}
                    search
                    maxHeight={250}
                    labelField="name"
                    valueField="id"
                    placeholder={
                      props.expenses?.categoryExpenseId
                        ? `${category}`
                        : "..." && !isFocus
                        ? "Selecciona una categoría"
                        : "..."
                    }
                    searchPlaceholder="Buscar categoría..."
                    value={
                      props.expenses?.categoryExpenseId.toString() && category
                    }
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={(item) => {
                      handleChange("categoryExpenseId")(item.id.toString());
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
                  <Text style={stylesGlobals.textInput}>
                    Total<Text style={{ color: "#EF4444" }}>*</Text>
                  </Text>
                  <Input
                    handleBlur={handleBlur("total")}
                    onChangeText={handleChange("total")}
                    values={values.total.toString()}
                    defaultValue={props.expenses?.total.toString()}
                    keyboardType="numeric"
                    icon={"cash"}
                  />
                  {errors.total && touched.total && (
                    <Text style={{ color: "#EF4444", marginBottom: 5 }}>
                      {errors.total}
                    </Text>
                  )}
                </ScrollView>
                <View style={{ right: 20 }}>
                  <Button Title="Guardar" onPress={() => handleSubmit()} />
                </View>
              </View>
            </SafeAreaView>
          </>
        )}
      </Formik>
    </>
  );
};