import { StyleSheet, Text, View } from 'react-native';

import { typography } from '@/theme/typography';

/**
 * 要約テキストの簡易レンダラー（設計書 7.3）。
 *
 * Markdownライブラリは導入せず、`## 見出し` と空行による段落だけを解釈する。
 * プロンプト側で記法を制限しているため、これで表示要件を満たせる。
 * 想定外の記法が来た場合もプレーンテキストとして表示されるだけで破綻しない。
 */
export function SummaryText({ summary }: { summary: string }) {
  const lines = summary.replace(/\r\n/g, '\n').split('\n');

  return (
    <View>
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (trimmed === '') {
          return <View key={index} style={styles.spacer} />;
        }

        if (trimmed.startsWith('## ')) {
          return (
            <Text key={index} style={[typography.bodyHeading, styles.heading]}>
              {trimmed.slice(3).trim()}
            </Text>
          );
        }

        return (
          <Text key={index} style={typography.body}>
            {trimmed}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  spacer: { height: 14 },
  heading: { marginTop: 18, marginBottom: 6 },
});
