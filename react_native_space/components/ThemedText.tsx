import React from 'react';
import { Platform, StyleProp, Text, TextProps, TextStyle } from 'react-native';
import { FONTS } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';

type Variant = 'display' | 'h1' | 'h2' | 'body' | 'bodyBold' | 'caption' | 'captionBold';

const FALLBACK = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'Arial',
});

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

const VARIANT_STYLE: Record<Variant, TextStyle> = {
  display: { fontSize: 32, fontFamily: FONTS.extrabold },
  h1: { fontSize: 24, fontFamily: FONTS.bold },
  h2: { fontSize: 20, fontFamily: FONTS.bold },
  body: { fontSize: 16, fontFamily: FONTS.regular },
  bodyBold: { fontSize: 16, fontFamily: FONTS.semibold },
  caption: { fontSize: 13, fontFamily: FONTS.regular },
  captionBold: { fontSize: 13, fontFamily: FONTS.semibold },
};

export const ThemedText: React.FC<Props> = ({
  variant = 'body',
  color,
  style,
  children,
  ...rest
}) => {
  const { theme } = useTheme();
  const base = VARIANT_STYLE[variant] ?? VARIANT_STYLE.body;
  return (
    <Text
      {...rest}
      style={[
        { color: color ?? theme.colors.text },
        base,
        { fontFamily: base.fontFamily ?? FALLBACK },
        style,
      ]}
    >
      {children}
    </Text>
  );
};
