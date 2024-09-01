import React, { useRef } from "react";
import { Text, View } from "react-native";
import LottieView from "lottie-react-native";

const SpinnerInitPage = () => {
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
            marginBottom: -100
          }}
          source={require("../../assets/gif_json/lhw8P0H8Ry.json")}
        />
        <Text style={{ fontSize: 18, color: "#4B5563" }}>Cargando...</Text>
      </View>
    </>
  );
};

export default SpinnerInitPage;
