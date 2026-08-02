/**
 * カラートークン。
 *
 * 値は確定画面デザイン画像（designs/voiceleaf-ui-design.png）から実測したもの。
 * 画面コードには直値を書かず、必ずこのトークンを参照する。
 */
export const colors = {
  /** 画面背景（クリーム）。 */
  bg: '#FBF4E9',
  /** カード・要約ボックスの背景。 */
  surface: '#FCF8F1',
  /** 録音ボタン、終了ボタン、マイクアイコン（テラコッタ）。 */
  primary: '#CE7856',
  /** 一覧の日付、録音タイマー、要約バッジの文字。 */
  accent: '#C4664A',
  /** 要約バッジの背景、一覧アイコンの下地。 */
  accentSoft: '#FAECDF',
  /** 本文・一覧タイトル。 */
  textPrimary: '#43302A',
  /** アプリタイトル・詳細タイトル。 */
  textHeading: '#422B1E',
  /** サブコピー、ヒント、日時表示。 */
  textMuted: '#8E6F52',
  /** 葉・草花の装飾。 */
  leaf: '#AE9E74',
  /** スワイプ削除ボタン。 */
  danger: '#D9463D',
  /** FABのリングなど。 */
  white: '#FFFFFF',
} as const;
