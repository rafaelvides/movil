import {
  StyleSheet,
  View,
  TextInput,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  KeyboardTypeOptions,
} from "react-native";
import React from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const Input = ({
  onChangeText,
  handleBlur,
  values,
  placeholder,
  keyboardType,
  icon,
  defaultValue,
}: {
  values?: string;
  placeholder?: string;
  defaultValue?: string;
  icon: string;
  keyboardType?: KeyboardTypeOptions | undefined;
  onChangeText?: (text: string) => void | undefined;
  handleBlur?: (
    e: NativeSyntheticEvent<TextInputFocusEventData>
  ) => void | undefined;
}) => {
  return (
    <View style={styles.inputWrapper}>
      <MaterialCommunityIcons
        color={"#AFB0B1"}
        name={icon}
        size={23}
        style={styles.icon}
      />
      <TextInput
        //   secureTextEntry
        defaultValue={defaultValue}
        style={styles.input}
        onChangeText={onChangeText}
        value={values}
        onBlur={handleBlur}
        placeholder={placeholder}
        keyboardType={keyboardType}
      />
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  input: {
    height: "100%",
    paddingLeft: 40,
    borderColor: "#D9D9DA",
    borderWidth: 1,
    borderRadius: 15,
  },
  icon: {
    position: "absolute",
    left: 7,
    top: "50%",
    transform: [{ translateY: -12 }],
  },
  inputWrapper: {
    position: "relative",
    width: "100%",
    height: 50,
    justifyContent: "center",
    marginBottom: 2,
  },
});
