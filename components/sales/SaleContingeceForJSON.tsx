import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { Dispatch, SetStateAction, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DocumentSale from "../seleccDocumen/DocumentSale";

const SaleContingenceForJSON = ({
  setShowModalDTE,
}: {
  setShowModalDTE: Dispatch<SetStateAction<boolean>>;
}) => {
  const [json, setJson] = useState<string>("");

  return (
    <View style={styles.productContainer}>
      <Pressable
        onPress={() => setShowModalDTE(false)}
        style={styles.closeButton}
      >
        <MaterialCommunityIcons name="close" size={30} color="#2C3377" />
      </Pressable>
      

    </View>
  );
};

export default SaleContingenceForJSON;

const styles = StyleSheet.create({
  productContainer: {
    flex: 1,
    width: "100%",
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
  },
  titleText: {
    fontSize: 20,
    textAlign: "center"
  },
});
