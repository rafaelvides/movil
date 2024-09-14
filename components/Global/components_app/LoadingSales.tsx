import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { sending_steps } from "@/utils/dte";

const LoadingSales = ({ step }: { step: number }) => {
  return (
    <View style={styles.overlay}>
      <ActivityIndicator
        size="large"
        color="#16a34a"
        style={{ marginBottom: 30 }}
      />
      <Text style={styles.processingText}>Procesando solicitud...</Text>

      <View style={styles.stepsContainer}>
        {sending_steps.map((ste, index) => (
          <View key={index} style={styles.stepRow}>
            <View style={styles.progressContainer}>
              <View key={index} style={styles.stepIndicator}>
                <Animated.View
                  style={[
                    styles.circle,
                    {
                      backgroundColor: index <= step ? "#16a34a" : "#e0e0e0",
                      transform: [{ scale: index === step ? 1.2 : 1 }],
                      shadowColor: index <= step ? "#16a34a" : "#757575",
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                    },
                  ]}
                >
                  <Icon
                    name={index < step ? "check-circle" : "check-circle"}
                    size={24}
                    color={index <= step ? "#fff" : "#757575"}
                  />
                </Animated.View>
              </View>
            </View>
            <View style={styles.stepInfo}>
              <Text
                style={[
                  styles.stepLabel,
                  index <= step
                    ? styles.activeStepLabel
                    : styles.inactiveStepLabel,
                ]}
              >
                {ste.label}
              </Text>
              {ste.description && (
                <Text style={styles.stepDescription}>{ste.description}</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default LoadingSales;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 5 },
  },
  processingText: {
    fontSize: 21,
    color: "#4b5563",
    fontWeight: "600",
    marginBottom: 20,
  },
  stepsContainer: {
    flexDirection: "column",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },

  stepInfo: {
    marginLeft: 16,
  },
  stepLabel: {
    fontSize: 19,
    fontWeight: "600",
  },
  activeStepLabel: {
    color: "#16a34a",
  },
  inactiveStepLabel: {
    color: "#6b7280",
  },
  stepDescription: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
});
