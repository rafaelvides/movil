import { StyleSheet } from "react-native";

const stylesGlobals = StyleSheet.create({
  //Spinners
  viewSpinnerInit: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    zIndex: 1000,
  },
  //====================================
  safeAreaViewStyle: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "white",
    paddingHorizontal: 8,
  },
  safeAreaForm: {
    width: "100%",
    height: "100%",
    backgroundColor: "white",
    paddingHorizontal: 8,
  },
  //Filters=============================
  filter: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: "100%",
    marginTop: 15,
    borderBottomWidth: 0.5,
    height: 56,
  },
  //view inside the scroll===============
  viewScroll: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  //Card=================================
  styleCard: {
    width: "95%",
    height: "auto",
  },
  ViewCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    width: "100%",
    justifyContent: "flex-start",
  },
  textCard: {
    fontWeight: "400",
    color: "#4B5563",
    marginLeft: 60,
  },
  //Input styles===============================
  viewInput: {
    position: "relative",
    width: "100%",
    height: 50,
    justifyContent: "center",
    marginBottom: 15,
  },
  textInput: {
    marginLeft: "3%",
    fontWeight: "500",
    marginBottom: 5,
  },
  //Button======================================
  viewBotton: {
    width: "auto",
    marginTop: 5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  ViewGroupButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    width: "100%",
  },
  //============================================
});
export default stylesGlobals;
