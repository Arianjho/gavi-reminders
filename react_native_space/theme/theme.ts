export interface AppColors {
  background: string;
  card: string;
  cardElevated: string;
  surface: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  separator: string;
  primary: string;
  accent: string;
  danger: string;
  success: string;
  chipBg: string;
  chipText: string;
  overlay: string;
  inputBg: string;
  shadow: string;
}

export interface AppTheme {
  dark: boolean;
  colors: AppColors;
}

export const lightColors: AppColors = {
  background: '#F5F5F0',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#1C1C1E',
  textSecondary: '#3C3C43',
  textTertiary: '#8E8E93',
  border: '#E5E5EA',
  separator: '#EDEDED',
  primary: '#007AFF',
  accent: '#FF9500',
  danger: '#FF3B30',
  success: '#34C759',
  chipBg: '#E9E9EF',
  chipText: '#3C3C43',
  overlay: 'rgba(0,0,0,0.4)',
  inputBg: '#F2F2F7',
  shadow: '#000000',
};

export const darkColors: AppColors = {
  background: '#0A0A0A',
  card: '#1A1A1A',
  cardElevated: '#222222',
  surface: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#EBEBF5',
  textTertiary: '#8E8E93',
  border: '#2C2C2E',
  separator: '#262626',
  primary: '#0A84FF',
  accent: '#FF9F0A',
  danger: '#FF453A',
  success: '#30D158',
  chipBg: '#2C2C2E',
  chipText: '#EBEBF5',
  overlay: 'rgba(0,0,0,0.6)',
  inputBg: '#1C1C1E',
  shadow: '#000000',
};

export const lightTheme: AppTheme = { dark: false, colors: lightColors };
export const darkTheme: AppTheme = { dark: true, colors: darkColors };

export const SMART_COLORS = {
  hoy: '#007AFF',
  programadas: '#FF3B30',
  todas: '#8E8E93',
  marcadas: '#FF9500',
} as const;

export const LIST_COLORS = [
  '#FF3B30',
  '#FF9500',
  '#FFCC00',
  '#34C759',
  '#00C7BE',
  '#007AFF',
  '#5856D6',
  '#AF52DE',
  '#FF2D55',
  '#A2845E',
  '#8E8E93',
  '#636366',
];

export const EMOJI_OPTIONS = [
  '\uD83D\uDCCB', '\uD83D\uDCCC', '\uD83C\uDFE0', '\uD83D\uDCBC', '\uD83C\uDFAF', '\uD83D\uDED2',
  '\uD83D\uDCA1', '\uD83D\uDCDA', '\uD83C\uDFB5', '\uD83C\uDFCB\uFE0F', '\u2708\uFE0F', '\uD83C\uDF7D\uFE0F',
  '\uD83D\uDC36', '\uD83C\uDF31', '\uD83D\uDCB0', '\uD83C\uDF89', '\uD83D\uDCDD', '\uD83D\uDCDE',
  '\u2764\uFE0F', '\u2B50', '\uD83D\uDD14', '\uD83D\uDCC5', '\uD83C\uDFAE', '\uD83C\uDFA8',
  '\uD83D\uDE97', '\uD83C\uDFE5', '\uD83C\uDF93', '\u26BD', '\uD83C\uDF7A', '\uD83E\uDDF9',
];

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const FONTS = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
};
