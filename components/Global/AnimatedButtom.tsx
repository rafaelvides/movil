import { useEffect, useState } from "react";
import { View, Animated, Easing, Pressable } from "react-native";
import {
  rounded_button,
  rounded_button_back,
} from "../../components/Global/styles/responsiveButton";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
interface Props {
  handleClick: () => void;
  iconName: string;
  size?: number;
  buttonColor: string;
  right?: number;
  top?: number;
  width?: number;
  height?: number;
  left?: number
  bottom?: number
}

const AnimatedButton = (props: Props) => {
  const [opacityValue, _] = useState(new Animated.Value(0));
  const dimensionValue = {
    with: props.width,
    height: props.height,
  };
  const startAnimation = () => {
    Animated.sequence([
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 750,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 750,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start(() => {
      startAnimation();
    });
  };

  useEffect(() => {
    startAnimation();
  }, []);
  
  return (
    <View
      style={{
        width: 70,
        position: "absolute",
        top: props.top ?? 40,
        right: props.right ?? undefined,
        left: props.left ?? undefined,
        zIndex: 100,
        bottom: props.bottom ?? 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Pressable
        onPress={props.handleClick}
        style={{
          backgroundColor: props.buttonColor,
          position: "absolute",
          zIndex: 30,
          width: dimensionValue.with
            ? dimensionValue.with
            : rounded_button.width,
          height: dimensionValue.height
            ? dimensionValue.height
            : rounded_button.height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 10,
        }}
      >
        <MaterialCommunityIcons
          name={props.iconName}
          size={props.size ?? 30}
          color="#ffffff"
        />
      </Pressable>
      <Animated.View
        style={{
          backgroundColor: "rgba(8, 105, 156, 0.1)",
          position: "absolute",
          opacity: opacityValue,
          zIndex: 20,
          ...rounded_button_back,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 100,
        }}
      ></Animated.View>
    </View>
  );
};

export default AnimatedButton;
