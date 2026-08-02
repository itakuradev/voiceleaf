import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/BackButton';
import { SummaryText } from '@/components/SummaryText';
import { useRecordings } from '@/contexts/RecordingsContext';
import { formatDateTime } from '@/lib/datetime';
import { colors } from '@/theme/colors';
import { cardShadow, layout } from '@/theme/layout';
import { typography } from '@/theme/typography';

/** SCR-03 詳細画面。 */
export default function DetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById } = useRecordings();
  const recording = id ? getById(id) : undefined;

  // 削除直後などで対象が見つからない場合はトップへ戻す
  useEffect(() => {
    if (!recording) router.replace('/');
  }, [recording, router]);

  if (!recording) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Image
          source={require('../../assets/images/deco-note.png')}
          style={styles.note}
          resizeMode="contain"
        />

        <Text style={[typography.heading, styles.title]}>{recording.title}</Text>

        <View style={styles.dateRow}>
          <Feather name="calendar" size={15} color={colors.textMuted} />
          <Text style={typography.caption}>{formatDateTime(recording.recordedAt)}</Text>
        </View>

        <View style={styles.cardWrapper}>
          <View style={styles.card}>
            <View style={styles.badge}>
              <Feather name="bookmark" size={15} color={colors.accent} />
              <Text style={styles.badgeLabel}>要約</Text>
            </View>

            <SummaryText summary={recording.summary} />
          </View>

          <Image
            source={require('../../assets/images/deco-branch.png')}
            style={styles.branch}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
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
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 80,
  },
  note: { alignSelf: 'center', width: 205, height: 108, marginBottom: 18 },
  title: { marginBottom: 10 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  cardWrapper: { position: 'relative' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius + 4,
    padding: 20,
    ...cardShadow,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  badgeLabel: { fontSize: 14, fontWeight: '700', color: colors.accent },
  branch: {
    position: 'absolute',
    right: -26,
    bottom: -52,
    width: 118,
    height: 152,
  },
});
