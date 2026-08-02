import { Feather } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';

const CENTER_SIZE = 132;
const RING_SIZES = [170, 208, 246];
const BAR_HEIGHTS = [20, 36, 54, 32, 18];

type Props = {
  /** 録音中はアニメーションさせる。処理中は中央をスピナーに差し替える。 */
  mode: 'idle' | 'recording' | 'processing';
};

/**
 * 録音画面中央の同心円とマイク、左右の波形。
 *
 * 波形は実音量には連動させず、標準の Animated API による繰り返しで表現する
 * （設計書 12章 #11）。
 */
export function WaveIndicator({ mode }: Props) {
  const active = mode === 'recording';

  return (
    <View style={styles.container}>
      {RING_SIZES.map((size, index) => (
        <View
          key={size}
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              opacity: 0.5 - index * 0.13,
              borderStyle: index === 2 ? 'dashed' : 'solid',
            },
          ]}
        />
      ))}

      <PulseRing active={active} />

      <View style={styles.center}>
        {mode === 'processing' ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <Feather name="mic" size={54} color={colors.primary} />
        )}
      </View>

      <View style={[styles.bars, styles.barsLeft]}>
        <WaveBars active={active} />
      </View>
      <View style={[styles.bars, styles.barsRight]}>
        <WaveBars active={active} />
      </View>
    </View>
  );
}

/** 外側へ広がりながら消えるリング。 */
function PulseRing({ active }: { active: boolean }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      progress.setValue(0);
      return;
    }
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 2600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [active, progress]);

  const size = RING_SIZES[0];

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
          transform: [
            { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] }) },
          ],
        },
      ]}
    />
  );
}

/** 縦棒が上下する波形。 */
function WaveBars({ active }: { active: boolean }) {
  const values = useRef(BAR_HEIGHTS.map(() => new Animated.Value(0.55))).current;

  useEffect(() => {
    if (!active) {
      values.forEach((value) => value.setValue(0.55));
      return;
    }
    const animations = values.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 110),
          Animated.timing(value, {
            toValue: 1,
            duration: 480,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.45,
            duration: 480,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      )
    );
    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [active, values]);

  return (
    <>
      {BAR_HEIGHTS.map((height, index) => (
        <Animated.View
          key={index}
          style={[styles.bar, { height, transform: [{ scaleY: values[index] }] }]}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: RING_SIZES[2] + 130,
    height: RING_SIZES[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  center: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bars: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barsLeft: { left: 0 },
  barsRight: { right: 0 },
  bar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    opacity: 0.65,
  },
});
