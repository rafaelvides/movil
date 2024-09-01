import { Tabs } from "expo-router";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import React, { useContext, useEffect, useReducer, useRef } from "react";
import {
  Pressable,
  StatusBar,
  StyleSheet,
  View,
  Text,
  LayoutChangeEvent,
} from "react-native";
import {
  BottomTabBarProps,
  BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useDerivedValue,
} from "react-native-reanimated";
import { ThemeContext } from "@/hooks/useTheme";

const App = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <>
      <StatusBar barStyle="light-content" />
      <Tabs tabBar={(props) => <AnimatedTabBar {...props} />}>
        <Tabs.Screen
          name="processed_sales"
          options={{
            // @ts-ignore
            headerShown: false,
            tabBarIcon: () => (
              <MaterialCommunityIcons
                name="book-check"
                color={theme.colors.primary}
                size={30}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="contingency_sales"
          options={{
            // @ts-ignore
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="book-clock" color={"#fff"} size={30} />
            ),
          }}
        />
        <Tabs.Screen
          name="invalidated_sales"
          options={{
            // @ts-ignore
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="book-cancel" color={"#fff"} size={30} />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

const AnimatedTabBar = ({
  state: { index: activeIndex, routes },
  navigation,
  descriptors,
}: BottomTabBarProps) => {
  const { bottom } = useSafeAreaInsets();
  const AnimatedSvg = Animated.createAnimatedComponent(Svg);

  const {theme} = useContext(ThemeContext)

  const reducer = (state: any, action: { x: number; index: number }) => {
    return [...state, { x: action.x, index: action.index }];
  };

  const [layout, dispatch] = useReducer(reducer, []);

  const handleLayout = (event: LayoutChangeEvent, index: number) => {
    dispatch({ x: event.nativeEvent.layout.x, index });
  };

  const xOffset = useDerivedValue(() => {
    if (!layout || !routes || layout.length !== routes.length) return 0;
    return [...layout].find(({ index }) => index === activeIndex)!.x - 25;
  }, [activeIndex, layout]);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withTiming(xOffset.value, { duration: 250 }) }],
    };
  });
  const style = {
    backgroundColor: theme.colors.dark,
  };
  return (
    <View style={[style, { paddingBottom: bottom }]}>
      <AnimatedSvg
        width={110}
        height={60}
        viewBox="0 0 110 60"
        style={[styles.activeBackground, animatedStyles]}
      >
        <Path
          fill="#fff"
          d="M20 0H0c11.046 0 20 8.953 20 20v5c0 19.33 15.67 35 35 35s35-15.67 35-35v-5c0-11.045 8.954-20 20-20H20z"
        />
      </AnimatedSvg>

      <View style={styles.tabBarContainer}>
        {routes.map((route, index) => {
          const active = index === activeIndex;
          const { options } = descriptors[route.key];

          return (
            <TabBarComponent
              key={route.key}
              active={active}
              options={options}
              onLayout={(e) => handleLayout(e, index)}
              onPress={() => navigation.navigate(route.name)}
            />
          );
        })}
      </View>
    </View>
  );
};

type TabBarComponentProps = {
  active?: boolean;
  options: BottomTabNavigationOptions;
  onLayout: (e: LayoutChangeEvent) => void;
  onPress: () => void;
};

const TabBarComponent = ({
  active,
  options,
  onLayout,
  onPress,
}: TabBarComponentProps) => {
  const ref = useRef(null);


  useEffect(() => {
    if (active && ref?.current) {
      // @ts-ignore
      ref.current.play();
    }
  }, [active]);

  const animatedComponentCircleStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withTiming(active ? 1 : 0, { duration: 250 }),
        },
      ],
    };
  });

  const animatedIconContainerStyles = useAnimatedStyle(() => {
    return {
      opacity: withTiming(active ? 1 : 0.5, { duration: 250 }),
    };
  });
  const { theme } = useContext(ThemeContext);

  return (
    <Pressable onPress={onPress} onLayout={onLayout} style={styles.component}>
      <Animated.View
        style={[
          {
            backgroundColor: theme.colors.dark,
            ...styles.componentCircle,
          },
          animatedComponentCircleStyles,
        ]}
      />
      <Animated.View
        style={[styles.iconContainer, animatedIconContainerStyles]}
      >
        {/* @ts-ignore */}
        {options.tabBarIcon ? options.tabBarIcon({ ref }) : <Text>?</Text>}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  activeBackground: {
    position: "absolute",
  },
  tabBarContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 7,
  },
  component: {
    height: 60,
    width: 60,
    marginTop: -5,
  },
  componentCircle: {
    flex: 1,
    borderRadius: 30,
  },
  iconContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    height: 36,
    width: 36,
  },
});

export default App;
