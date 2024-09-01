import AnimatedButton from "@/components/Global/AnimatedButtom";
import SpinLoading from "@/components/Global/SpinLoading";
import SpinnerInitPage from "@/components/Global/SpinnerInitPage";
import { ThemeContext } from "@/hooks/useTheme";
import { get_box_data } from "@/plugins/async_storage";
import { useExpenseStore } from "@/store/expense.store";
import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { useContext, useState } from "react";
import {
  Pressable,
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
import {
  IExpensePayload,
  IExpensePayloads,
} from "@/types/expenses/expense.types";
import AlertWithAnimation from "@/components/Global/manners/Alert";
import noResult from "@/assets/gif_json/bx8ntOOR1D.json";
const expenses = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteShow, setDeleteShow] = useState(false);
  const [expenseId, setExpenseId] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedExpenses, setSelectedExpenses] = useState<IExpensePayload>();
  const [selectedId, setSelectedId] = useState(0);
  const [limit, setLimit] = useState(5);
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
    getPaginatedExpenses(idBox, currentPage, limit, category);
    setRefreshing(false);
  }, [refreshing]);

  const handleRefresh = () => {
    setRefreshing(true);
    getPaginatedExpenses(idBox, currentPage, limit, category);
    setRefreshing(false);
  };

  const fetchExpenses = (page: any) => {
    getPaginatedExpenses(idBox, page, limit, category);
  };

  useEffect(() => {
    fetchExpenses(currentPage);
  }, [currentPage, limit, category]);

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
          <View
            style={{
              flex: 1,
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#fff",
            }}
          >
            <SpinnerInitPage />
          </View>
        </>
      ) : (
        <>
          <View
            style={{
              backgroundColor: "#fff",
              height: "100%",
            }}
          >
            <SafeAreaView
              style={{
                flex: 1,
                width: "100%",
                height: "100%",
                backgroundColor: "#FFFFFF",
                paddingHorizontal: 8,
              }}
            >
              <View style={styles.filter}>
                <View
                  style={{
                    position: "absolute",
                    justifyContent: "space-between",
                    gap: 100,
                  }}
                >
                  <AnimatedButton
                    handleClick={() => {
                      SheetManager.show("expense-filters-sheet", {
                        payload: {
                          limit: limit,
                          setLimit,
                          setCategory,
                          category: category,
                          handleConfirm(limit, category) {
                            setLimit(limit);
                            setCategory(category);
                            setRefreshing(true);
                            SheetManager.hide("expense-filters-sheet");
                          },
                        },
                      });
                    }}
                    iconName="filter"
                    buttonColor={theme.colors.third}
                    width={42}
                    height={42}
                    right={100}
                    size={30}
                    top={0}
                  />
                  <AnimatedButton
                    handleClick={() => setShowModal(true)}
                    buttonColor={theme.colors.third}
                    iconName="plus"
                    width={42}
                    height={42}
                    right={100}
                    size={30}
                    left={100}
                    top={0}
                  />
                </View>
              </View>
              <View style={{ height: "82%" }}>
                {/* <Pressable
                  onPress={() =>
                    SheetManager.show("expense-filters-sheet", {
                      payload: {
                        limit: limit,
                        setLimit,
                        setCategory,
                        category: category,
                        handleConfirm(limit, category) {
                          setLimit(limit);
                          setCategory(category);
                          setRefreshing(true);
                          SheetManager.hide("expense-filters-sheet");
                        },
                      },
                    })
                  }
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    width: "90%",
                    marginLeft: 18,
                    paddingLeft: 20,
                    marginTop: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: "#D1D5DB",
                    height: 56,
                    backgroundColor: "#f9f9f9",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#718096",
                      fontSize: 16,
                    }}
                  >
                    Filtros disponibles
                  </Text>
                  <Pressable
                    style={{
                      position: "absolute",
                      right: 20,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="filter"
                      size={25}
                      color="#607274"
                    />
                  </Pressable>
                </Pressable> */}

                <View
                  style={{
                    height: "100%",
                  }}
                >
                  <ScrollView
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                      />
                    }
                  >
                    {is_loading ? (
                      <View
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                          flex: 1,
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <View
                          style={{
                            width: "100%",
                            height: "100%",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <SpinLoading is_showing={is_loading} />
                        </View>
                      </View>
                    ) : (
                      <View
                        style={{
                          top:10,
                          // backgroundColor: theme.colors.secondary,
                          justifyContent:"center",
                          alignItems: "center",
                          
                        }}
                      >
                        {expenses.length > 0 ? (
                          <>
                            {!is_loading &&
                              expenses.map((expense, index) => (
                               <></>
                              ))}
                          </>
                        ) : (
                          <>
                             <View
                              style={{
                                padding: 40,
                                width: "100%",
                                height: "auto",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <LottieView
                                autoPlay
                                ref={animation}
                                style={{
                                  marginTop: 50,
                                  width: 380,
                                  height: 380,
                                }}
                                source={noResult}
                              />
                            </View>
                          </>
                        )}
                      </View>
                    )}
                  </ScrollView>
                </View>
              </View>
              <View style={{
                bottom:4,
              }}>
              {expenses.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
                </View>
              
            </SafeAreaView>
          </View>
          {/* */}

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
          <AlertWithAnimation
            visible={deleteShow}
            onClose={() => setDeleteShow(false)}
            onPress={() => deleteExpense(expenseId)}
            title="¿Estas seguro que deseas eliminar este registro?"
          />
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
    height: "62%",

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
