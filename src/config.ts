import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as {
  geminiApiKey?: string;
};

/** Gemini APIキー。.env → app.config.js の extra 経由で受け取る。 */
export const GEMINI_API_KEY = extra.geminiApiKey ?? '';

/**
 * 使用するGeminiモデル。
 *
 * 当初は gemini-2.5-flash を予定していたが、2.5系は新規ユーザーへの提供が
 * 終了しており 404 になるため、後継の 3.6-flash を使う。
 */
export const GEMINI_MODEL = 'gemini-3.6-flash';

/** Gemini APIのタイムアウト（ミリ秒）。 */
export const GEMINI_TIMEOUT_MS = 120_000;

/** 最大録音時間（秒）。到達時は自動で録音を終了する。 */
export const MAX_RECORDING_SECONDS = 180;

if (!GEMINI_API_KEY) {
  console.warn(
    '[config] GEMINI_API_KEY が未設定です。プロジェクト直下の .env に設定し、開発サーバーを再起動してください。'
  );
}
