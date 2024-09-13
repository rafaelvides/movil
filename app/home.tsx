import { ThemeContext } from "@/hooks/useTheme";
import { get_theme_by_transmitter } from "@/services/personalization.service";
import React from "react";
import { useContext, useEffect, useState } from "react";
import { View, Text, RefreshControl, ToastAndroid } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

function home() {
  const [refreshing, setRefreshing] = useState(false);

  const { toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const GetThemeConfiguration = async () => {
      try {
        const { data } = await get_theme_by_transmitter();
        if (data.ok) {
          const theme = {
            name: data.personalization.name,
            context: data.personalization.context,
            colors: data.personalization.colors,
          };
          toggleTheme({
            ...theme,
            colors: theme.colors,
            name: theme.name,
            context: theme.context === "light" ? "dark" : "light",
          });
        } else {
          throw new Error("No tienes tema seleccionado");
        }
      } catch (e) {}
    };

    GetThemeConfiguration();
  }, []);

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing;
            }}
          />
        }
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <Text>Welcome home!</Text>
        </View>
      </ScrollView>
    </>
  );
}

export default home;
