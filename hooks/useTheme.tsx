import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Props, Theme, ThemeContextType } from "./types/theme.types";
import { defaultTheme } from "../utils/constants";
import { useFocusEffect } from "expo-router";
import { StatusBar } from "react-native";
import { useAuthStore } from "@/store/auth.store";

export const ThemeContext = React.createContext<ThemeContextType>({
  theme: {} as Theme,
  toggleTheme: () => {},
  navbar: "",
  toggleNavBar: () => {},
  context: "light",
  toggleContext: () => {},
});

function ThemeProvider(props: Props) {
  const [themeConfigured, setThemeConfigured] = React.useState<string | null>(
    null
  );


  useFocusEffect(
    React.useCallback(()=>{
      const fetchData = async ()=>{
        const storedTheme = await AsyncStorage.getItem("theme");
        if(storedTheme !== null){
          setThemeConfigured(storedTheme);
        }
      }
      fetchData()
    },[])
  )


  const [theme, setTheme] = React.useState(themeConfigured ? JSON.parse(themeConfigured) : (defaultTheme as Theme) )


  const [navbar, setNavbar] = React.useState("sidebar");

  const toggleNavBar = (barType: string) => {
    setNavbar(barType);
  };

  const toggleTheme = (themeName: Theme) => {
    setTheme(themeName);
    AsyncStorage.setItem("theme", JSON.stringify(themeName));
  };

const contextValue = AsyncStorage.getItem("context") as unknown;
const [context, setContext] = React.useState<"light" | "dark">(contextValue as "light" | "dark");

  const toggleContext = (context: "light" | "dark") => {
    setContext(context);
    AsyncStorage.setItem("context", context);
  };

  React.useEffect(()=>{
    if(context === "light"){
      StatusBar.setBarStyle("dark-content");
    }else{
      StatusBar.setBarStyle("light-content");
    }
  },[context])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        navbar,
        toggleNavBar,
        context,
        toggleContext,
      }}
    >
      {props.children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
