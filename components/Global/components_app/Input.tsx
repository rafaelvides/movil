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
  withI
}: {
  values?: string;
  placeholder?: string;
  defaultValue?: string;
  icon: string;
  keyboardType?: KeyboardTypeOptions | undefined;
  onChangeText?: (text: string) => void | undefined;
  onChange?:((e: NativeSyntheticEvent<TextInputChangeEventData>) => void)
  | undefined;
  handleBlur?: (
    e: NativeSyntheticEvent<TextInputFocusEventData>
  ) => void | undefined;
  onPress?: (e: NativeSyntheticEvent<NativeTouchEvent>) => void | undefined;
  onFocus?: ((e: NativeSyntheticEvent<TextInputFocusEventData>) => void) | undefined
  placeholderTextColor?: string | undefined
  withI?: number
}) => {
  const width2 = withI ? withI : 100
  const screenWidth = Dimensions.get('window').width;
  const width = screenWidth * width2;
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
        style={{...styles.input, width: `${width2}%`}}
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
