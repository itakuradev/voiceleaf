import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  createRecordingId,
  loadRecordings,
  saveRecordings,
  sortByRecordedAtDesc,
} from '@/services/storage';
import type { Recording } from '@/types';

type RecordingsContextValue = {
  /** 録音日時の降順に並んだ記録。 */
  recordings: Recording[];
  /** 起動直後の読み込み中かどうか。 */
  isLoading: boolean;
  /** 記録を追加して保存する（FN-11）。 */
  add: (input: Omit<Recording, 'id'>) => Promise<void>;
  /** 記録を削除する（FN-15）。 */
  remove: (id: string) => void;
  /** IDで記録を取得する。 */
  getById: (id: string) => Recording | undefined;
};

const RecordingsContext = createContext<RecordingsContextValue | null>(null);

export function RecordingsProvider({ children }: { children: React.ReactNode }) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 起動時に一度だけ読み込む。以降はメモリ上の配列を正とする。
  useEffect(() => {
    let active = true;
    loadRecordings().then((loaded) => {
      if (!active) return;
      setRecordings(loaded);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const add = useCallback(async (input: Omit<Recording, 'id'>) => {
    const created: Recording = { ...input, id: createRecordingId() };
    let next: Recording[] = [];
    setRecordings((prev) => {
      next = sortByRecordedAtDesc([created, ...prev]);
      return next;
    });
    await saveRecordings(next);
  }, []);

  const remove = useCallback((id: string) => {
    // 一覧へ即座に反映し、保存は非同期で追いかける
    setRecordings((prev) => {
      const next = prev.filter((item) => item.id !== id);
      void saveRecordings(next);
      return next;
    });
  }, []);

  const getById = useCallback(
    (id: string) => recordings.find((item) => item.id === id),
    [recordings]
  );

  const value = useMemo(
    () => ({ recordings, isLoading, add, remove, getById }),
    [recordings, isLoading, add, remove, getById]
  );

  return <RecordingsContext.Provider value={value}>{children}</RecordingsContext.Provider>;
}

export function useRecordings(): RecordingsContextValue {
  const value = useContext(RecordingsContext);
  if (!value) {
    throw new Error('useRecordings は RecordingsProvider の内側で使ってください');
  }
  return value;
}
