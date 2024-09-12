import { View } from "react-native";
import stylesGlobals from "../styles/StylesAppComponents";
import LottieView from "lottie-react-native";
import { useRef } from "react";

const Not_data = () => {
  const animation = useRef(null);

  return (
    <>
      <View style={stylesGlobals.viewLottie}>
        <LottieView
          autoPlay
          ref={animation}
          style={stylesGlobals.LottieStyle}
          source={require("@/assets/gif_json/gif_global.json")}
        />
      </View>
    </>
  );
};
export default Not_data
