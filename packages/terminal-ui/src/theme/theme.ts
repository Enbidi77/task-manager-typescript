export interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  muted: string;
  border: string;
}

export const themes: Record<string, ColorTheme> = {
  dark: {
    primary: 'cyan',
    secondary: 'blue',
    accent: 'magenta',
    success: 'green',
    warning: 'yellow',
    danger: 'red',
    muted: 'gray',
    border: 'gray',
  },
  light: {
    primary: 'blue',
    secondary: 'cyan',
    accent: 'magenta',
    success: 'green',
    warning: 'yellow',
    danger: 'red',
    muted: 'gray',
    border: 'black',
  },
  nord: {
    primary: 'cyanBright',
    secondary: 'blueBright',
    accent: 'magentaBright',
    success: 'greenBright',
    warning: 'yellowBright',
    danger: 'redBright',
    muted: 'gray',
    border: 'blue',
  },
  matrix: {
    primary: 'greenBright',
    secondary: 'green',
    accent: 'whiteBright',
    success: 'greenBright',
    warning: 'yellow',
    danger: 'redBright',
    muted: 'gray',
    border: 'green',
  },
};

export function getTheme(themeName: string = 'dark'): ColorTheme {
  return themes[themeName] || themes.dark;
}
