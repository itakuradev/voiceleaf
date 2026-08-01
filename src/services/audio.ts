import {
  getRecordingPermissionsAsync,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  type RecordingOptions,
} from 'expo-audio';
import { Directory, File, Paths } from 'expo-file-system';

/** 録音音声のMIMEタイプ。Gemini APIへ送る際にも使用する。 */
export const RECORDING_MIME_TYPE = 'audio/mp4';

/**
 * 録音設定。
 *
 * HIGH_QUALITY プリセット（.m4a / AAC）をベースに、モノラル・64kbps へ落としている。
 * 用途が音声要約であり音楽品質は不要なうえ、3分で 1.5MB 程度に収まるため
 * Gemini API への送信（Base64インライン）が安定する。
 */
export const RECORDING_OPTIONS: RecordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  numberOfChannels: 1,
  bitRate: 64_000,
};

/**
 * マイク権限を確認し、未許可であれば要求する。
 *
 * @returns 権限が得られた場合は true
 */
export async function ensureRecordingPermission(): Promise<boolean> {
  const current = await getRecordingPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;

  const requested = await requestRecordingPermissionsAsync();
  return requested.granted;
}

/** 録音のためのオーディオモードを設定する。録音開始前に一度呼ぶ。 */
export async function prepareAudioMode(): Promise<void> {
  await setAudioModeAsync({
    allowsRecording: true,
    playsInSilentMode: true,
  });
}

/** 録音ファイルをBase64文字列として読み出す。 */
export async function readRecordingAsBase64(uri: string): Promise<string> {
  return new File(uri).base64();
}

/** 録音ファイルのバイト数を返す。取得できない場合は null。 */
export function getRecordingSize(uri: string): number | null {
  try {
    const file = new File(uri);
    return file.exists ? file.size : null;
  } catch {
    return null;
  }
}

/**
 * 一時音声ファイルを削除する（FN-16）。
 *
 * AI処理の成否や中断にかかわらず呼ばれるため、失敗しても例外は投げない。
 */
export function deleteRecordingFile(uri: string | null | undefined): void {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch (error) {
    console.warn('[audio] 一時音声ファイルの削除に失敗しました', error);
  }
}

/**
 * キャッシュ領域に残った録音ファイルを削除する。
 *
 * 通常は録音処理の中で削除されるが、プロセスが強制終了した場合に備えて
 * アプリ起動時にも呼び、音声が端末内へ残り続けないようにする。
 */
export function cleanupLeftoverRecordings(): void {
  try {
    for (const entry of Paths.cache.list()) {
      if (entry instanceof File) {
        if (entry.name.endsWith('.m4a')) entry.delete();
      } else if (entry instanceof Directory && entry.name === 'Audio') {
        for (const child of entry.list()) {
          if (child instanceof File && child.name.endsWith('.m4a')) child.delete();
        }
      }
    }
  } catch (error) {
    console.warn('[audio] 残存録音ファイルの削除に失敗しました', error);
  }
}
