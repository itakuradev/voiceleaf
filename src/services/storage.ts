import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Recording } from '@/types';

const STORAGE_KEY = 'voiceleaf.recordings.v1';

/** 録音日時の降順に並べ替える（FN-12）。 */
export function sortByRecordedAtDesc(recordings: Recording[]): Recording[] {
  return [...recordings].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
}

/** 記録のIDを生成する。個人利用の規模では衝突しない粒度で十分。 */
export function createRecordingId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * 保存済みの記録をすべて読み出す（FN-01）。
 *
 * データが壊れていた場合は空配列にフォールバックする。要件上、復旧処理は行わない。
 */
export async function loadRecordings(): Promise<Recording[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return sortByRecordedAtDesc(parsed.filter(isRecording));
  } catch (error) {
    console.warn('[storage] 保存データを読み込めませんでした', error);
    return [];
  }
}

/** 記録を全件上書き保存する。 */
export async function saveRecordings(recordings: Recording[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sortByRecordedAtDesc(recordings)));
  } catch (error) {
    console.warn('[storage] 保存に失敗しました', error);
  }
}

function isRecording(value: unknown): value is Recording {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Partial<Recording>;
  return (
    typeof v.id === 'string' &&
    typeof v.recordedAt === 'string' &&
    typeof v.title === 'string' &&
    typeof v.summary === 'string'
  );
}
