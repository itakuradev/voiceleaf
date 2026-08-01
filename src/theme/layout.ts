import { Platform, type ViewStyle } from 'react-native';

/** 余白・角丸・サイズのトークン。 */
export const layout = {
  /** 画面左右のパディング。 */
  screenPadding: 20,
  /** カードの角丸。 */
  cardRadius: 16,
  /** カード内のパディング。 */
  cardPadding: 16,
  /** カード同士の間隔。 */
  cardGap: 12,
  /** ピル型ボタンの角丸。 */
  pillRadius: 32,
  /** 録音FABの直径（白リングを含まない）。 */
  fabSize: 76,
  /** FABを囲む白リングの幅。 */
  fabRingWidth: 6,
  /** スワイプで現れる削除ボタンの幅。 */
  swipeActionWidth: 80,
  /** 戻るボタンのアイコンサイズ。 */
  backIconSize: 26,
  /** 最小タップ領域（非機能要件のアクセシビリティ）。 */
  minTapSize: 44,
} as const;

/** カードに用いる控えめな影。 */
export const cardShadow: ViewStyle = Platform.select({
  android: { elevation: 2 },
  default: {
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
}) as ViewStyle;
