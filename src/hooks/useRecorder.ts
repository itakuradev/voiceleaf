import { useAudioRecorder } from 'expo-audio';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, BackHandler } from 'react-native';

import { MAX_RECORDING_SECONDS } from '@/config';
import { useRecordings } from '@/contexts/RecordingsContext';
import {
  deleteRecordingFile,
  prepareAudioMode,
  readRecordingAsBase64,
  RECORDING_OPTIONS,
} from '@/services/audio';
import { generateSummary } from '@/services/gemini';

/** 録音画面の状態（設計書 4.3）。 */
export type RecorderPhase = 'preparing' | 'recording' | 'processing';

/**
 * 録音画面の状態機械。
 *
 * 画面のマウントと同時に録音を開始し、終了・中断のいずれの経路でも
 * 一時音声ファイルを削除してトップ画面へ戻る（FN-07, FN-16）。
 */
export function useRecorder() {
  const router = useRouter();
  const { add } = useRecordings();
  const recorder = useAudioRecorder(RECORDING_OPTIONS);

  const [phase, setPhase] = useState<RecorderPhase>('preparing');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  /** 録音開始日時。記録の recordedAt に使う。 */
  const startedAtRef = useRef('');
  /** 経過時間の基準時刻。setInterval のずれを避けるため実時間から算出する。 */
  const startTimeRef = useRef(0);
  /** 終了・中断が二重に走らないようにするガード。 */
  const doneRef = useRef(false);

  const leave = useCallback(() => {
    router.replace('/');
  }, [router]);

  /** 録音を終了し、要約して保存する（FN-06, FN-09, FN-11）。 */
  const finish = useCallback(async () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setPhase('processing');

    let uri: string | null = null;
    try {
      await recorder.stop();
      uri = recorder.uri;
      if (!uri) throw new Error('録音ファイルを取得できませんでした');

      const base64 = await readRecordingAsBase64(uri);
      const { title, summary } = await generateSummary(base64);
      await add({ recordedAt: startedAtRef.current, title, summary });
    } catch (error) {
      // 要件により再試行はしない。記録も保存しない（FN-17）
      console.warn('[useRecorder] 要約に失敗しました', error);
      Alert.alert('要約に失敗しました', 'もう一度お試しください。');
    } finally {
      deleteRecordingFile(uri);
      leave();
    }
  }, [add, leave, recorder]);

  /** 録音を中断し、記録を保存せずに戻る（FN-07）。 */
  const cancel = useCallback(async () => {
    if (doneRef.current) return;
    doneRef.current = true;

    let uri: string | null = null;
    try {
      await recorder.stop();
      uri = recorder.uri;
    } catch (error) {
      console.warn('[useRecorder] 録音の停止に失敗しました', error);
    }
    deleteRecordingFile(uri);
    leave();
  }, [leave, recorder]);

  // タイマーから最新の finish を呼べるようにする
  const finishRef = useRef(finish);
  finishRef.current = finish;

  // 画面表示と同時に録音を開始する
  useEffect(() => {
    let disposed = false;
    (async () => {
      try {
        await prepareAudioMode();
        await recorder.prepareToRecordAsync();
        if (disposed) return;

        recorder.record();
        startedAtRef.current = new Date().toISOString();
        startTimeRef.current = Date.now();
        setPhase('recording');
      } catch (error) {
        console.warn('[useRecorder] 録音を開始できませんでした', error);
        Alert.alert('録音を開始できませんでした', 'もう一度お試しください。');
        doneRef.current = true;
        leave();
      }
    })();
    return () => {
      disposed = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 経過時間の更新と、3分到達時の自動終了（FN-05, FN-06）
  useEffect(() => {
    if (phase !== 'recording') return;

    const id = setInterval(() => {
      const seconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedSeconds(seconds);
      if (seconds >= MAX_RECORDING_SECONDS) void finishRef.current();
    }, 200);

    return () => clearInterval(id);
  }, [phase]);

  // AI処理中は戻る操作を受け付けない（FN-08）
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (phase !== 'processing') void cancel();
      return true;
    });
    return () => subscription.remove();
  }, [cancel, phase]);

  return { phase, elapsedSeconds, finish, cancel };
}
