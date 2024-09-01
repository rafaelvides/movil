import { View, Text } from "react-native";
import LottieView from "lottie-react-native";
import { useRef } from "react";

const SpinLoading = (props: { is_showing?: boolean }) => {
  const animation = useRef(null);
  return (
    <>
      {props.is_showing && (
        <View
          style={{
            padding: 20,
            width: "100%",
            height: "auto",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            top: 50
          }}
        >
          <LottieView
            autoPlay
            ref={animation}
            style={{
              width: 370,
              height: 380,
            }}
            source={require("../../assets/gif_json/9CmwCxrnfm.json")}
            loop
          />
          <Text style={{ fontSize: 16, color: "#4B5563", top: -90 }}>
            Obteniendo resultados...
          </Text>
        </View>
      )}
    </>
  );
};

export default SpinLoading;
