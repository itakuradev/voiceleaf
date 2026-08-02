import { Feather } from '@expo/vector-icons';
import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

import { formatDate } from '@/lib/datetime';
import { colors } from '@/theme/colors';
import { cardShadow, layout } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { Recording } from '@/types';

type Props = {
  recording: Recording;
  onPress: () => void;
  onDelete: () => void;
};

/**
 * トップ画面の一覧項目（SCR-01）。
 *
 * 左スワイプで右側に赤いゴミ箱ボタンを表示し（FN-14）、
 * タップすると確認なしで削除する（FN-15）。
 */
export function RecordingListItem({ recording, onPress, onDelete }: Props) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-layout.swipeActionWidth, 0],
      outputRange: [1, 0.6],
      extrapolate: 'clamp',
    });

    return (
      <Pressable
        style={styles.deleteAction}
        onPress={onDelete}
        accessibilityLabel="この記録を削除"
        accessibilityRole="button">
        <Animated.View style={{ transform: [{ scale }] }}>
          <Feather name="trash-2" size={22} color={colors.white} />
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
      containerStyle={styles.swipeContainer}>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={onPress}
        accessibilityRole="button">
        <View style={styles.icon}>
          <Feather name="file-text" size={20} color={colors.accent} />
        </View>

        <View style={styles.texts}>
          <Text style={typography.listDate}>{formatDate(recording.recordedAt)}</Text>
          <Text style={[typography.listTitle, styles.title]} numberOfLines={1}>
            {recording.title}
          </Text>
        </View>

        <Feather name="chevron-right" size={20} color={colors.accent} />
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    marginBottom: layout.cardGap,
    borderRadius: layout.cardRadius,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    padding: layout.cardPadding,
    ...cardShadow,
  },
  cardPressed: { opacity: 0.7 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1, gap: 2 },
  title: { marginTop: 2 },
  deleteAction: {
    width: layout.swipeActionWidth,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: layout.cardRadius,
    borderBottomRightRadius: layout.cardRadius,
  },
});
