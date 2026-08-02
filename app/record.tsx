import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

/** SCR-02 録音画面。ステップ6で実装する。 */
export default function RecordScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={typography.heading}>録音画面</Text>
      <Pressable onPress={() => router.back()}>
        <Text style={typography.caption}>戻る</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
});
