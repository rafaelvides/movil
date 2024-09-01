import { ThemeContext } from "@/hooks/useTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useContext, useEffect, useRef } from "react";
import { Animated, View, StyleSheet, Text } from "react-native";

interface Props {
  message?: string;
  visible: boolean;
  title?: string;
  onPressRetry?: () => void;
  onPressVerify?: () => void;
  onPressSendContingency?: () => void;
  onClose: () => void;
}

const ErrorAlert = (props: Props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { theme } = useContext(ThemeContext);
  useEffect(() => {
    if (props.visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => props.onClose());
    }
  }, [props.visible]);
  if (!props.visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.alertBox,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.alertMessage}>{props.message ?? ""}</Text>
        <Text style={styles.alertText}>{props.title ?? ""}</Text>

        <MaterialCommunityIcons
          name="shield-alert-outline"
          size={120}
          color={"red"}
        />
        <View style={{ flexDirection: "row", columnGap: 20, marginTop: 10 }}>
        
        </View>
      </Animated.View>
    </View>
  );
};

export default ErrorAlert;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  alertBox: {
    width: "98%",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    elevation: 5,
  },
  alertText: {
    marginBottom: 4,
    fontSize: 14,
    textAlign: "center",
    color: "red",
  },
  alertMessage: {
    marginBottom: 4,
    fontSize: 16,
    textAlign: "center",
  },
});
