export interface Props {
    children: React.ReactNode;
  }
  export interface Color {
    danger: string;
    primary: string;
    secondary: string;
    third: string;
    warning: string;
    dark: string;
  }
  
  export interface Theme {
    name: string;
    context: "light" | "dark";
    colors: Color;
  }
  export interface ThemeContextType {
    theme: Theme;
    toggleTheme: (themeName: Theme) => void;
    navbar: string;
    toggleNavBar: (themeName: string) => void;
    context: "light" | "dark";
    toggleContext: (context: "light" | "dark") => void;
  }
  
  