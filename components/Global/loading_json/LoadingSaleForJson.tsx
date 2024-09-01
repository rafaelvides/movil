import { StyleSheet, Text, View } from "react-native";
import React, { useRef } from "react";
import LottieView from "lottie-react-native";

const LoadingSaleForJson = () => {
  const animation = useRef(null);

  return (
    <View
      style={{
        padding: 40,
        width: "100%",
        height: "auto",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 250,
      }}
    >
      <LottieView
        autoPlay
        ref={animation}
        style={{
          width: 370,
          height: 380,
          backgroundColor: "#fff",
          marginBottom: -100,
        }}
        source={require("../../../assets/gif_json/eySVLfODQB.json")}
      />
    </View>
  );
};

export default LoadingSaleForJson;

const styles = StyleSheet.create({});
