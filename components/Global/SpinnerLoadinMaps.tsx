import React, { useRef } from "react";
import { Text, View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

const SpinnerLoadinMaps = () => {
  const animation = useRef(null);

  return (
    <>
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
            marginBottom: -90,
          }}
          source={require("../../assets/gif_json/YJpxNw4LP7.json")}
        />
        <Text style={{ fontSize: 18, color: "#4B5563" }}>Cargando...</Text>
      </View>
    </>
  );
};

export default SpinnerLoadinMaps;

const styles = StyleSheet.create({});
