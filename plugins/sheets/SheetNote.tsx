import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  Animated,
} from "react-native";
import React, { useState } from "react";
import ActionSheet, { SheetProps } from "react-native-actions-sheet";

const SheetNote = ({ sheetId, payload }: SheetProps<"note-sheet">) => {
  const [scaleValue] = useState(new Animated.Value(1));
  const [scaleValue2] = useState(new Animated.Value(1));
  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };
  const handlePressIn2 = () => {
    Animated.spring(scaleValue2, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut2 = () => {
    Animated.spring(scaleValue2, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };
  return (
    <>
      <ActionSheet
        id={sheetId}
        statusBarTranslucent={true}
        drawUnderStatusBar={false}
        gestureEnabled={true}
        containerStyle={{
          paddingHorizontal: 12,
          height: "auto",
        }}
        springOffset={50}
        defaultOverlayOpacity={0.4}
      >
        <View style={{ marginBottom: "10%" }}>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 20 }}>
              Realizar notas de Crédito/Débito
            </Text>
          </View>
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              gap: 80,
              justifyContent: "center",
              alignContent: "center",
              marginTop: 25,
            }}
          >
            <Animated.View style={[{ transform: [{ scale: scaleValue2 }] }]}>
              <Pressable
                style={{
                  flexDirection: "row",
                  marginTop: 5,
                  width: 70,
                  height: 70,
                  backgroundColor: "#034",
                  borderRadius: 10,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 15,
                  padding: 5,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                  elevation: 10,
                }}
                onPressIn={handlePressIn2}
                onPressOut={handlePressOut2}
                onPress={() => payload?.handleConfirm("01")}
              >
                <Image
                  style={{ width: 80, height: 60 }}
                  resizeMode="contain"
                  alt="logo"
                  source={require("../../assets/images/logo/UntitledD1.png")}
                />
              </Pressable>
            </Animated.View>
            <Animated.View style={[{ transform: [{ scale: scaleValue }] }]}>
              <Pressable
                style={{
                  flexDirection: "row",
                  marginTop: 5,
                  width: 70,
                  height: 70,
                  backgroundColor: "#034",
                  borderRadius: 10,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 15,
                  padding: 5,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                  elevation: 10,
                }}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => payload?.handleConfirm("02")}
              >
                <Image
                  style={{ width: 80, height: 60 }}
                  resizeMode="contain"
                  alt="logo"
                  source={require("../../assets/images/logo/UntitledC.png")}
                />
              </Pressable>
            </Animated.View>
          </View>
        </View>
      </ActionSheet>
    </>
  );
};

export default SheetNote;

const styles = StyleSheet.create({
  inputWrapper: {
    position: "relative",
    width: "100%",
    height: 50,
    justifyContent: "center",
    marginBottom: 15,
  },
  icon: {
    position: "absolute",
    right: 20,
    top: "50%",
    transform: [{ translateY: -15 }],
  },
  input: {
    height: "100%",
    paddingLeft: 15,
    borderColor: "#D9D9DA",
    borderWidth: 1,
    borderRadius: 15,
    fontSize: 16,
  },
  iconContainer: {
    flexDirection: "row",
    backgroundColor: "#91B1C5",
    // backgroundColor: "#fff" #d3d7e7,
    height: 50,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    width: "95%",
  },
});
