import {
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import MapView, {
  Callout,
  MapType,
  Marker,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { StatusBar } from "expo-status-bar";
import { SheetManager } from "react-native-actions-sheet";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import SpinnerLoadinMaps from "@/components/Global/SpinnerLoadinMaps";
import { useFocusEffect } from "expo-router";
import { createSocket } from "@/hooks/useSocket";
import { useLocationStore } from "@/store/locations.store";
import { IBranch } from "@/types/branch/branch.types";
import { useBranchStore } from "@/store/branch.store";
import { update_active_location } from "@/services/locations.service";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "@/hooks/useTheme";

const Location_real_time = () => {
  const [loading, setLoading] = useState(false);
  const socket = createSocket();
  const [refreshing, setRefreshing] = useState(false);
  const [showModalMap, setShowModalMap] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<IBranch>();
  const [selectedOptionMap, setSelectedOptionMap] =
    useState<MapType>("standard");
  const { OnGetLocation, coordinatesRealTime } = useLocationStore();
  const { OnGetBranchList } = useBranchStore();
  const { theme } = useContext(ThemeContext);

  useFocusEffect(
    React.useCallback(() => {
      setSelectedOptionMap("standard");
      setSelectedBranch(undefined);
      setLoading(true);
      setRefreshing(true);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }, [])
  );
  useEffect(() => {
    socket.on("reload", () => {
      if (isEnabled) {
        OnGetLocation(selectedBranch?.id ?? 0);
        update_active_location(1, true);
      }
    });
    return () => {
      socket.off("reload");
      socket.disconnect();
    };
  }, [isEnabled]);

  useEffect(() => {
    OnGetBranchList();
    // OnGetLocation(selectedBranch?.id ?? 0);
    setRefreshing(false);
  }, [refreshing]);

  return (
    <>
      <StatusBar style="dark" />
      {loading ? (
        <>
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
            }}
          >
            <SpinnerLoadinMaps />
          </View>
        </>
      ) : (
        <>
          <SafeAreaView
            style={{
              width: "100%",
              height: 70,
              backgroundColor: "#fff",
              paddingHorizontal: 8,
            }}
          >
            <Pressable
              onPress={() =>
                SheetManager.show("map-real-time-filters-sheet", {
                  payload: {
                    setSelectedBranch,
                    selectedBranch: selectedBranch,
                    selectedOptionMap: selectedOptionMap,
                    setSelectedOptionMap,
                    handleConfirm(selectedOptionMap, selectedBranch) {
                      setSelectedBranch(selectedBranch);
                      setSelectedOptionMap(selectedOptionMap);
                      SheetManager.hide("map-real-time-filters-sheet");
                    },
                  },
                })
              }
              style={styles.filter}
            >
              <Text
                style={{
                  color: "#718096",
                  fontSize: 16,
                }}
              >
                Filtros disponibles
              </Text>
              <Pressable
                style={{
                  position: "absolute",
                  right: 20,
                }}
              >
                <MaterialCommunityIcons
                  name="filter"
                  size={25}
                  color="#607274"
                />
              </Pressable>
            </Pressable>
          </SafeAreaView>

          <View style={styles.container}>
            <MapView
              style={styles.map}
              zoomEnabled
              provider={PROVIDER_GOOGLE}
              mapType={selectedOptionMap}
              initialRegion={{
                latitude: coordinatesRealTime.latitude
                  ? coordinatesRealTime.latitude
                  : 13.709163,
                longitude: coordinatesRealTime.longitude
                  ? coordinatesRealTime.longitude
                  : -89.728202,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              {selectedBranch &&
                coordinatesRealTime.longitude !== undefined &&
                coordinatesRealTime.latitude !== undefined && (
                  <Marker coordinate={coordinatesRealTime}>
                    <Callout style={{ width: 150 }}>
                      <Text
                        style={{
                          marginLeft: 25,
                          fontSize: 15,
                        }}
                      >
                        Mi ubicación
                      </Text>
                      <Text>
                        Hora:{" "}
                        {new Date(
                          coordinatesRealTime.timestamp
                        ).toLocaleTimeString()}
                      </Text>
                    </Callout>
                  </Marker>
                )}
            </MapView>
          </View>
          
        </>
      )}
      <Modal visible={showModalMap} animationType="fade">
        <MapView
          style={styles.map}
          zoomEnabled
          provider={PROVIDER_GOOGLE}
          mapType={selectedOptionMap}
          initialRegion={{
            latitude: coordinatesRealTime.latitude
              ? coordinatesRealTime.latitude
              : 13.709163,
            longitude: coordinatesRealTime.longitude
              ? coordinatesRealTime.longitude
              : -89.728202,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          zoomTapEnabled
        >
          {coordinatesRealTime.longitude !== undefined &&
            coordinatesRealTime.latitude !== undefined && (
              <Marker coordinate={coordinatesRealTime}>
                <Callout style={{ width: 150 }}>
                  <Text
                    style={{
                      marginLeft: 25,
                      fontSize: 15,
                    }}
                  >
                    Mi ubicación
                  </Text>
                  <Text>
                    Hora:{" "}
                    {new Date(
                      coordinatesRealTime.timestamp
                    ).toLocaleTimeString()}
                  </Text>
                </Callout>
              </Marker>
            )}
        </MapView>
       
      </Modal>
    </>
  );
};

export default Location_real_time;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  filter: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    paddingLeft: 20,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
    height: 56,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
});
