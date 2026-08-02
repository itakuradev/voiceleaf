import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';

/** 戻る「←」。録音画面（SCR-02）と詳細画面（SCR-03）で共通に使う。 */
export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={onPress}
      hitSlop={8}
      accessibilityLabel="戻る"
      accessibilityRole="button">
      <Feather name="arrow-left" size={layout.backIconSize} color={colors.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: layout.minTapSize,
    height: layout.minTapSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
});
