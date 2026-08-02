import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MicButton } from '@/components/MicButton';
import { RecordingListItem } from '@/components/RecordingListItem';
import { useRecordings } from '@/contexts/RecordingsContext';
import { ensureRecordingPermission } from '@/services/audio';
import { isOnline } from '@/services/network';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { typography } from '@/theme/typography';

/** SCR-01 トップ画面。 */
export default function TopScreen() {
  const router = useRouter();
  const { recordings, isLoading, remove } = useRecordings();

  /** 録音開始前の事前チェック（FN-02, FN-03）。 */
  const startRecording = useCallback(async () => {
    if (!(await isOnline())) {
      Alert.alert(
        '通信できません',
        'インターネットに接続されていません。接続を確認してからもう一度お試しください。'
      );
      return;
    }

    if (!(await ensureRecordingPermission())) {
      Alert.alert(
        'マイクを使用できません',
        'マイクの使用が許可されていません。端末の設定から許可してください。'
      );
      return;
    }

    router.push('/record');
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Image
          source={require('../assets/images/leaf-title.png')}
          style={styles.headerLeaf}
          resizeMode="contain"
        />
        <View style={styles.headerTexts}>
          <Text style={typography.appTitle}>独り言要約</Text>
          <Text style={[typography.caption, styles.subtitle]}>
            話すだけで、頭の中をスッキリ整理。
          </Text>
        </View>
      </View>

      <FlatList
        data={recordings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <RecordingListItem
            recording={item}
            onPress={() => router.push(`/detail/${item.id}`)}
            onDelete={() => remove(item.id)}
          />
        )}
        ListEmptyComponent={
          isLoading ? null : (
            <Text style={[typography.caption, styles.empty]}>
              まだ記録がありません。{'\n'}下のボタンから話しはじめてみましょう。
            </Text>
          )
        }
      />

      <View style={styles.footer} pointerEvents="box-none">
        <Image
          source={require('../assets/images/deco-bottom-left.png')}
          style={styles.decoLeft}
          resizeMode="contain"
        />
        <Image
          source={require('../assets/images/deco-bottom-right.png')}
          style={styles.decoRight}
          resizeMode="contain"
        />
        <View style={styles.fab}>
          <MicButton onPress={startRecording} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const FOOTER_HEIGHT = 200;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerLeaf: { width: 32, height: 55, marginTop: -4 },
  headerTexts: { flex: 1 },
  subtitle: { marginTop: 6 },
  listContent: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: FOOTER_HEIGHT,
  },
  empty: { textAlign: 'center', marginTop: 40, lineHeight: 24 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: FOOTER_HEIGHT,
  },
  decoLeft: { position: 'absolute', left: 0, bottom: 0, width: 93, height: 195 },
  decoRight: { position: 'absolute', right: 0, bottom: 0, width: 185, height: 160 },
  fab: { position: 'absolute', alignSelf: 'center', bottom: 58 },
});
