import React, { useRef } from "react";
import { Text, View } from "react-native";
import LottieView from "lottie-react-native";

const SpinnerButton = () => {
  const animation = useRef(null);

  return (
    <>
      <LottieView
        autoPlay
        ref={animation}
        style={{
          width: 200,
          height: 100,
        }}
        source={require("../../assets/gif_json/Animation - 1722438986599 (1).json")}
      />
    </>
  );
};

export default SpinnerButton;
