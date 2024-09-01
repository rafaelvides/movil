import {
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { Fragment, useContext, useEffect, useState } from "react";
import MapView, {
  MapType,
  Marker,
  Polyline,
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
import { formatDate } from "@/utils/date";
const saved_location_tour = () => {
  const [loading, setLoading] = useState(false);
  const socket = createSocket();
  const [refreshing, setRefreshing] = useState(false);
  const [showModalMap, setShowModalMap] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [startDate, setStartDate] = useState(formatDate());
  const [selectedBranch, setSelectedBranch] = useState<IBranch>();
  const [selectedOptionMap, setSelectedOptionMap] =
    useState<MapType>("standard");
  const { OnGetLocationRouter, coordinatesRouter } = useLocationStore();
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
        OnGetLocationRouter(selectedBranch?.id ?? 0, startDate);
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
    // OnGetLocationRouter(selectedBranch?.id ?? 0, startDate);
    setRefreshing(false);
  }, [refreshing]);

  const sortedCoordinates = coordinatesRouter.map((item) =>
    [...item].sort((a, b) => a.timestamp - b.timestamp)
  );

  // Filtrar coordenadas que estan duplicadas y devuelve una cordenada mas exacta
  const cleanerCoordinates = sortedCoordinates.map((item) => {
    const unique = [];
    const map = new Map();
    for (const coord of item) {
      if (!map.has(coord.latitude + "," + coord.longitude)) {
        map.set(coord.latitude + "," + coord.longitude, true);
        unique.push(coord);
      }
    }
    return unique;
  });

  return (
    <>
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
                  SheetManager.show("map-router-filters-sheet", {
                    payload: {
                      setStartDate,
                      startDate: startDate,
                      setSelectedBranch,
                      selectedBranch: selectedBranch,
                      selectedOptionMap: selectedOptionMap,
                      setSelectedOptionMap,
                      handleConfirm(
                        selectedOptionMap,
                        selectedBranch,
                        startDate
                      ) {
                        setStartDate(startDate);
                        setSelectedBranch(selectedBranch);
                        setSelectedOptionMap(selectedOptionMap);
                        SheetManager.hide("map-router-filters-sheet");
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
                  latitude: 13.709163,
                  longitude: -89.728202,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              >
                {coordinatesRouter && coordinatesRouter.length > 0 && (
                  <>
                    {cleanerCoordinates.map((item, index) => (
                      <Fragment key={index}>
                        <Polyline
                          coordinates={item}
                          strokeWidth={6}
                          lineCap="round"
                          lineJoin="round"
                          strokeColor="#00826a"
                        />
                        <Marker
                          coordinate={item[0]}
                          title={"Comienzo: " + (index + 1)}
                          description={
                            "Hora: " +
                            new Date(item[0].timestamp).toLocaleTimeString()
                          }
                        />
                        <Marker
                          coordinate={item[item.length - 1]}
                          title={"Punto actual: " + (index + 1)}
                          description={
                            "Hora: " +
                            new Date(
                              item[item.length - 1].timestamp
                            ).toLocaleTimeString()
                          }
                        />
                      </Fragment>
                    ))}
                  </>
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
              latitude: 13.709163,
              longitude: -89.728202,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {coordinatesRouter && coordinatesRouter.length > 0 && (
              <>
                {cleanerCoordinates.map((item, index) => (
                  <Fragment key={index}>
                    <Polyline
                      coordinates={item}
                      strokeWidth={6}
                      lineCap="round"
                      lineJoin="round"
                      strokeColor="#00826a"
                    />
                    <Marker
                      coordinate={item[0]}
                      title={"Comienzo: " + (index + 1)}
                      description={
                        "Hora: " +
                        new Date(item[0].timestamp).toLocaleTimeString()
                      }
                    />
                    <Marker
                      coordinate={item[item.length - 1]}
                      title={"Punto actual: " + (index + 1)}
                      description={
                        "Hora: " +
                        new Date(
                          item[item.length - 1].timestamp
                        ).toLocaleTimeString()
                      }
                    />
                  </Fragment>
                ))}
              </>
            )}
          </MapView>
          
        </Modal>
      </>
    </>
  );
};

export default saved_location_tour;

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
