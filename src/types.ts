/** 端末内に保存する独り言記録。 */
export type Recording = {
  /** 一意なID。 */
  id: string;
  /** 録音開始日時（ISO 8601）。 */
  recordedAt: string;
  /** Geminiが生成したタイトル。 */
  title: string;
  /** Geminiが生成した要約。見出しは "## " 形式のMarkdownのみ含みうる。 */
  summary: string;
};
