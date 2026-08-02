import { Feather } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/BackButton';
import { WaveIndicator } from '@/components/WaveIndicator';
import { useRecorder } from '@/hooks/useRecorder';
import { formatDuration } from '@/lib/datetime';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { typography } from '@/theme/typography';

/**
 * SCR-02 録音画面。
 *
 * 画面を追加せず、状態の切り替えで「録音中」と「要約しています」を表現する
 * （要件定義 5.1 / 設計書 4.3）。
 */
export default function RecordScreen() {
  const { phase, elapsedSeconds, finish, cancel } = useRecorder();
  const isProcessing = phase === 'processing';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        {!isProcessing && <BackButton onPress={cancel} />}
      </View>

      <View style={styles.body}>
        <Image
          source={require('../assets/images/leaf-small.png')}
          style={styles.leaf}
          resizeMode="contain"
        />

        <Text style={typography.heading}>{isProcessing ? '要約しています' : '録音中'}</Text>

        {!isProcessing && (
          <View style={styles.timer}>
            <View style={styles.dot} />
            <Text style={typography.timer}>{formatDuration(elapsedSeconds)}</Text>
          </View>
        )}

        <View style={styles.indicator}>
          <WaveIndicator mode={phase === 'preparing' ? 'idle' : phase} />
        </View>

        <Image
          source={require('../assets/images/please-talke-me.png')}
          style={styles.hint}
          resizeMode="contain"
        />
      </View>

      <View style={styles.footer}>
        {!isProcessing && (
          <Pressable
            style={({ pressed }) => [styles.stopButton, pressed && styles.stopButtonPressed]}
            onPress={finish}
            accessibilityLabel="録音を終了"
            accessibilityRole="button">
            <Feather name="square" size={18} color={colors.white} />
            <Text style={typography.button}>録音を終了</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    height: layout.minTapSize + 12,
    justifyContent: 'center',
    paddingHorizontal: layout.screenPadding - 10,
    paddingTop: 12,
  },
  body: { flex: 1, alignItems: 'center' },
  leaf: { width: 26, height: 48, marginBottom: 4 },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  indicator: { flex: 1, justifyContent: 'center' },
  hint: { width: 230, height: 62, marginBottom: 8 },
  footer: {
    height: 96,
    paddingHorizontal: layout.screenPadding,
    justifyContent: 'center',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 64,
    borderRadius: layout.pillRadius,
    backgroundColor: colors.primary,
  },
  stopButtonPressed: { opacity: 0.85 },
});
