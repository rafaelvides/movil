import { Dimensions } from "react-native";

const dimension = Dimensions.get("window").width;

export const global_input = {
  borderColor: "#D0D4CA",
  borderWidth: 0.75,
  borderRadius: 5,
  padding: dimension < 390 ? 10 : 12,
  paddingVertical: 8,
};

export const global_text = {
  fontSize: dimension < 390 ? 12 : 15,
};

export const global_text_sm = {
  fontSize: dimension < 390 ? 10 : 13,
};

export const icon_size = dimension < 390 ? 15 : 20;

export const icon_global = 24;
export const text_drawer = dimension < 390 ? 14 : 16;

export const height_drawer_option = {
  height: dimension < 390 ? 50 : 64,
};

export const image_drawer = {
  width: dimension < 390 ? 60 : 80,
};

export const profile_drawer = {
  height: dimension < 390 ? 150 : 170,
};

export const title_text = {
  fontSize: dimension < 390 ? 14 : 18,
};

export const rounded_button = {
  width: dimension < 390 ? 35 : 40,
  height: dimension < 390 ? 35 : 40,
};

export const rounded_button_back = {
  width: dimension < 390 ? 50 : 65,
  height: dimension < 390 ? 50 : 65,
};
export const button_global = {
  width: dimension < 390 ? 300 : 350,
  // height: dimension < 390 ? 50 : 65,
};
export const padding_global = {
  padding: dimension < 390 ? 8 : 15,
};
export const padding_global_button = {
  padding: dimension < 390 ? 8 : 13,
};

export const filter_view_height = {
  height: dimension < 390 ? 46 : 56,
};

export const text_xl = {
  fontSize: dimension < 390 ? 16 : 20,
};

export const global_shadow = {
  shadowColor: "rgba(0,0,0,0.7)",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 10,
  elevation: 3,
  borderRadius: 10,
};