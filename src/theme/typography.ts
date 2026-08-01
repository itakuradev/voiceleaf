import type { TextStyle } from 'react-native';

import { colors } from './colors';

/**
 * タイポグラフィのトークン。
 *
 * デザイン画像は明朝体だが、カスタムフォントは同梱せずAndroid標準のゴシック体を使う
 * （設計書 12章 #13）。印象差はウェイトと行間で補うため、`fontFamily` は指定しない。
 */
export const typography = {
  /** アプリタイトル（トップ画面）。 */
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textHeading,
  },
  /** 画面見出し（「録音中」「要約しています」、詳細タイトル）。 */
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textHeading,
    lineHeight: 38,
  },
  /** 一覧項目のタイトル。 */
  listTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  /** 一覧項目の日付。 */
  listDate: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.accent,
  },
  /** 要約の本文。行間を広めに取り、明朝体のゆったりした印象へ寄せる。 */
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textPrimary,
    lineHeight: 30,
  },
  /** 要約内の見出し。 */
  bodyHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textHeading,
    lineHeight: 28,
  },
  /** サブコピー、録音画面のヒント、日時表示。 */
  caption: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textMuted,
  },
  /** 録音経過時間。 */
  timer: {
    fontSize: 30,
    fontWeight: '600',
    color: colors.accent,
  },
  /** ボタンのラベル。 */
  button: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },
} as const satisfies Record<string, TextStyle>;
