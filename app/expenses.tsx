import AnimatedButton from "@/components/Global/AnimatedButtom";
import SpinLoading from "@/components/Global/SpinLoading";
import SpinnerInitPage from "@/components/Global/SpinnerInitPage";
import { ThemeContext } from "@/hooks/useTheme";
import { get_box_data } from "@/plugins/async_storage";
import { useExpenseStore } from "@/store/expense.store";
import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  Modal,
} from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import { ScrollView } from "react-native-gesture-handler";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import CreateExpense from "@/components/expense/create_expense";
import Pagination from "@/components/Global/Pagination";
import { UpdateExpenses } from "@/components/expense/update_expenses";
import { IExpensePayload } from "@/types/expenses/expense.types";
import AlertWithAnimation from "@/components/Global/manners/Alert";
import noResult from "@/assets/gif_json/bx8ntOOR1D.json";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import Card from "@/components/Global/components_app/Card";
import ButtonForCard from "@/components/Global/components_app/ButtonForCard";
import LottieView from "lottie-react-native";
const expenses = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteShow, setDeleteShow] = useState(false);
  const [expenseId, setExpenseId] = useState(0);
  const [selectedExpenses, setSelectedExpenses] = useState<IExpensePayload>();
  const [selectedId, setSelectedId] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [category, setCategory] = useState("");
  const [idBox, setIdBox] = useState(0);
  const [isShowUpdate, setIsShowUpdate] = useState(false);
  const {
    delete_expense,
    expenses,
    getPaginatedExpenses,
    is_loading,
    pagination_expenses,
  } = useExpenseStore();
  const totalPages = pagination_expenses?.totalPag ?? 1;
  const { theme } = useContext(ThemeContext);
  const animation = useRef(null);
  // --------useFocusEffect-----------
  useFocusEffect(
    React.useCallback(() => {
      setIsLoading(true);
      setRefreshing(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }, [])
  );

  useEffect(() => {
    get_box_data().then((data) => {
      if (data) {
        setIdBox(Number(data.id));
      }
    });
  }, []);

  //--------useEffect----------
  useEffect(() => {
    getPaginatedExpenses(idBox, currentPage, 5, category);
    setRefreshing(false);
  }, [refreshing]);

  const handleRefresh = () => {
    setRefreshing(true);
    getPaginatedExpenses(idBox, currentPage, 5, category);
    setRefreshing(false);
  };

  const fetchExpenses = (page: any) => {
    getPaginatedExpenses(idBox, page, 5, category);
  };

  useEffect(() => {
    fetchExpenses(currentPage);
  }, [currentPage, 5, category]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const deleteExpense = (id: number) => {
    delete_expense(id);
  };

  const handleChangeExpenses = (expenses: IExpensePayload) => {
    const payload_expenses: IExpensePayload = {
      description: expenses.description,
      total: expenses.total,
      categoryExpenseId: expenses.categoryExpenseId,
      boxId: expenses.boxId,
      isActive: expenses.isActive,
      id: expenses.id,
    };
    setSelectedExpenses(payload_expenses);
    setSelectedId(expenses.id);
  };

  const clearClose = () => {
    handleChangeExpenses({} as IExpensePayload), setSelectedId(0);
  };
  return (
    <>
      <StatusBar style="dark" />
      {loading ? (
        <>
          <View style={stylesGlobals.viewSpinnerInit}>
            <SpinnerInitPage />
          </View>
        </>
      ) : (
        <>
          <SafeAreaView style={stylesGlobals.safeAreaForm}>
            {is_loading ? (
              <SpinLoading is_showing={is_loading} />
            ) : (
              <>
                <View style={stylesGlobals.filter}>
                  <AnimatedButton
                    handleClick={() => {
                      SheetManager.show("expense-filters-sheet", {
                        payload: {
                          setCategory,
                          category: category,
                          handleConfirm(category) {
                            setCategory(category);
                            setRefreshing(true);
                            SheetManager.hide("expense-filters-sheet");
                          },
                        },
                      });
                    }}
                    iconName="filter"
                    buttonColor={theme.colors.third}
                    width={40}
                    height={40}
                    right={42}
                    left={10}
                    size={25}
                    top={0}
                  />
                  <AnimatedButton
                    handleClick={() => setShowModal(true)}
                    buttonColor={theme.colors.third}
                    iconName="plus"
                    width={42}
                    height={42}
                    right={10}
                    size={25}
                    top={0}
                  />
                </View>
                <ScrollView
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={() => setRefreshing(true)}
                    />
                  }
                >
                  <View style={stylesGlobals.viewScroll}>
                    <>
                      {expenses && expenses.length > 0 ? (
                        <>
                          {expenses &&
                            expenses.map((expense, index) => (
                              <Card key={index} style={stylesGlobals.styleCard}>
                                <View style={stylesGlobals.ViewCard}>
                                  <MaterialCommunityIcons
                                    color={theme.colors.secondary}
                                    name="clipboard-text"
                                    size={22}
                                    style={{
                                      position: "absolute",
                                      left: 7,
                                    }}
                                  />
                                  <Text style={stylesGlobals.textCard}>
                                    {expense.description}
                                  </Text>
                                </View>
                                <View style={stylesGlobals.ViewCard}>
                                  <MaterialCommunityIcons
                                    color={theme.colors.dark}
                                    name="equal-box"
                                    size={22}
                                    style={{
                                      position: "absolute",
                                      left: 7,
                                    }}
                                  />
                                  <Text style={stylesGlobals.textCard}>
                                    {expense.categoryExpense.name}
                                  </Text>
                                </View>
                                <View style={stylesGlobals.ViewCard}>
                                  <MaterialCommunityIcons
                                    color={theme.colors.third}
                                    name="cash"
                                    size={22}
                                    style={{
                                      position: "absolute",
                                      left: 7,
                                    }}
                                  />
                                  <Text style={stylesGlobals.textCard}>
                                    {expense.total}
                                  </Text>
                                </View>
                                <View style={stylesGlobals.ViewGroupButton}>
                                  <ButtonForCard
                                    onPress={() => {
                                      handleChangeExpenses(expense);
                                      setIsShowUpdate(true);
                                    }}
                                    icon={"pencil"}
                                  />
                                  <ButtonForCard
                                    onPress={() => {
                                      setDeleteShow(true);
                                      setExpenseId(expense.id);
                                    }}
                                    icon={"delete"}
                                    color={theme.colors.danger}
                                  />
                                </View>
                              </Card>
                            ))}
                        </>
                      ) : (
                        <View
                          style={stylesGlobals.viewLottie}
                        >
                          <LottieView
                            autoPlay
                            ref={animation}
                            style={stylesGlobals.LottieStyle}
                          source={require("@/assets/gif_json/gif_global.json")}
                          />
                        </View>
                      )}
                    </>
                  </View>
                  {expenses.length > 0 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </ScrollView>
              </>
            )}
          </SafeAreaView>

          <AlertWithAnimation
            visible={deleteShow}
            onClose={() => setDeleteShow(false)}
            onPress={() => deleteExpense(expenseId)}
            title="¿Estas seguro que deseas eliminar este registro?"
          />
          <View style={styles.centeredView}>
            <Modal visible={showModal} animationType="slide">
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <CreateExpense closeModal={() => setShowModal(false)} />
                </View>
              </View>
            </Modal>
          </View>
          <View style={styles.centeredView}>
            <Modal visible={isShowUpdate} animationType="slide">
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <UpdateExpenses
                    closeModal={() => {
                      setIsShowUpdate(false);
                      clearClose();
                    }}
                    expenses={selectedExpenses}
                    id={selectedId}
                  />
                </View>
              </View>
            </Modal>
          </View>
        </>
      )}
    </>
  );
};
export default expenses;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    backgroundColor: "rgba(80, 80, 80, 0.8)",
  },
  modalView: {
    margin: 10,
    height: 380,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    zIndex: 10,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  filter: {
    justifyContent: "center",
    width: "100%",
    paddingLeft: 20,
    marginTop: 15,
    borderBottomWidth: 0.5,
    height: 56,
    alignItems: "center",
  },
});
