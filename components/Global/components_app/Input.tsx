import {
  StyleSheet,
  View,
  TextInput,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  KeyboardTypeOptions,
  NativeTouchEvent,
  TextInputChangeEventData,
  Dimensions,
} from "react-native";
import React from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const Input = ({
  onChangeText,
  handleBlur,
  onChange,
  onPress,
  onFocus,
  values,
  placeholder,
  keyboardType,
  icon,
  defaultValue,
  placeholderTextColor,
  showSoftInputOnFocus,
  caretHidden,
}: {
  values?: string;
  placeholder?: string;
  defaultValue?: string;
  icon: string;
  keyboardType?: KeyboardTypeOptions | undefined;
  onChangeText?: (text: string) => void | undefined;
  onChange?:
    | ((e: NativeSyntheticEvent<TextInputChangeEventData>) => void)
    | undefined;
  handleBlur?: (
    e: NativeSyntheticEvent<TextInputFocusEventData>
  ) => void | undefined;
  onPress?: (e: NativeSyntheticEvent<NativeTouchEvent>) => void | undefined;
  onFocus?:
    | ((e: NativeSyntheticEvent<TextInputFocusEventData>) => void)
    | undefined;
  placeholderTextColor?: string | undefined;
  showSoftInputOnFocus?: boolean;
  caretHidden?: boolean;
}) => {
  const keypad = showSoftInputOnFocus ?? true;
  const linea = caretHidden ? caretHidden : false;
  return (
    <View style={styles.inputWrapper}>
      <MaterialCommunityIcons
        color={"#AFB0B1"}
        name={icon}
        size={23}
        style={styles.icon}
      />
      <TextInput
        showSoftInputOnFocus={keypad}
        caretHidden={linea}
        //   secureTextEntry
        defaultValue={defaultValue}
        style={styles.input}
        onChangeText={onChangeText}
        value={values}
        onFocus={onFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        keyboardType={keyboardType}
        onPress={onPress}
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
    width: "100%",
  },
  icon: {
    position: "absolute",
    left: 7,
    top: "50%",
    transform: [{ translateY: -12 }],
  },
  inputWrapper: {
    position: "relative",
    height: 50,
    justifyContent: "center",
    marginBottom: 2,
  },
});
