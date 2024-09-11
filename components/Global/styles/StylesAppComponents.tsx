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
    marginBottom: -10,
  },
  ViewGroupButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    width: "100%",
  },
  //Dropdown============================================
  styleDropdown: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 15,
    height: 50,
  },
  isFocusStyles: {
    borderColor: "blue",
    borderRadius: 15,
  },
  placeholderStyle: {
    fontSize: 14,
    // marginTop: 14,
    marginLeft: 8,
  },
  selectedTextStyle: {
    fontSize: 14,
     marginLeft: 6,
  },
  inputSearchStyle: {
    fontSize: 16,
    height: 40,
  },
  iconStyle: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  renderLeftIcon: {
   marginLeft: 10,
  },
  //ViewDetailsCustomers============================================
  materialIconsStyle: {
    justifyContent: "flex-end",
    top: 20,
    right: 20,
    position: "absolute",
  },
  titleDetailsCustomer: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    justifyContent: "center",
    marginTop: 20,
    top: 35,
    padding: 20,
  },
  viewContent: {
    backgroundColor: "white",
    borderWidth: 1,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    borderColor: "#fff",
    height: "85%",
    marginTop: 65,
    width: "100%",
    borderEndEndRadius: 0,
    borderEndStartRadius: 0,
  },
  viewInMaterial: {
    marginTop: 50,
    marginLeft: 30,
    flexDirection: "row",
  },
  iconsStyles: {
    position: "absolute",
    marginRight: 60,
    top: "30%",
    transform: [{ translateY: -15 }],
  },
  textIconStyle: {
    marginLeft: 50,
    color: "black",
    fontSize: 16,
    textAlign: "center",
  },

  // box_close============================================
  CardBox: {
    width: 170,
    height: 160,
    marginRight: 10,
    backgroundColor: "white",
    borderRadius: 20,
  },
  ViewBox: {
    height: 60,
    marginTop: 40,
    marginLeft: 5,
    justifyContent: "center",
  },
  textCardBox: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 10,
    color: "black",
  },

  // boxAccounting============================================
  View: {
    flexDirection: "row",
    width: "100%",
    height: "100%",
    flexWrap: "wrap",
    marginTop: 10,
    marginBottom: 14,
    borderBottomColor: "green",
  },
  card: {
    height: 90,
    width: 170,
    backgroundColor: "white",
  },
  textContentInCard: {
    fontSize: 16,
    textAlign: "center",
  },
  styleTextData: {
    fontSize: 16,
    textAlign: "center",
    color: "blue",
  },
  //style Settings ============================================
  viewMain: {
    marginTop: 35,
    flexDirection: "row",
    padding: 10,
  },
  textSettings: {
    margin:10,
    fontSize: 16,
    marginTop: 35,
    color: "#4B5563",
    fontWeight: "bold",
  },
  styleView: {
    width: 50,
    height: 50,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  dividerStyle: {
    width: "80%",
    backgroundColor: "blue",
  },
  textComponent: {
    fontSize: 14,
    textAlign: "left",
    width: "50%",
    marginLeft: 70,
    color: "#000",
  },
  styleSwitch: {
    transform: [{ scaleX: 1.0 }, { scaleY: 1.0 }],
    marginLeft: 10,
  },

  //LottieVie ============================================
  viewLottie: {
    padding: 40,
    width: "100%",
    height: "auto",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  LottieStyle: {
    marginTop: 50,
    width: 380,
    height: 380,
  },
  // ============================================
});
export default stylesGlobals;
