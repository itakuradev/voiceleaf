import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { colors } from '@/theme/colors';
import { cardShadow, layout } from '@/theme/layout';

type Props = {
  onPress: () => void;
  disabled?: boolean;
};

/** トップ画面の録音開始ボタン（白いリングで縁取ったテラコッタ円）。 */
export function MicButton({ onPress, disabled }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.ring, pressed && styles.pressed, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel="録音を開始"
      accessibilityRole="button">
      <Feather name="mic" size={34} color={colors.white} />
    </Pressable>
  );
}

const size = layout.fabSize;
const ringWidth = layout.fabRingWidth;

const styles = StyleSheet.create({
  ring: {
    width: size + ringWidth * 2,
    height: size + ringWidth * 2,
    borderRadius: (size + ringWidth * 2) / 2,
    borderWidth: ringWidth,
    borderColor: colors.white,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...cardShadow,
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
});
