import { useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  deleteRecordingFile,
  ensureRecordingPermission,
  getRecordingSize,
  prepareAudioMode,
  readRecordingAsBase64,
  RECORDING_OPTIONS,
} from '@/services/audio';
import { generateSummary } from '@/services/gemini';

/**
 * ステップ2〜3（録音とGemini API疎通）の検証用の暫定画面。
 * ステップ5でトップ画面（SCR-01）に差し替える。
 */
export default function TopScreen() {
  const recorder = useAudioRecorder(RECORDING_OPTIONS);
  const state = useAudioRecorderState(recorder);
  const [logs, setLogs] = useState<string[]>([]);
  const [lastUri, setLastUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const log = useCallback((message: string) => {
    const time = new Date().toLocaleTimeString('ja-JP');
    setLogs((prev) => [`${time}  ${message}`, ...prev]);
  }, []);

  const start = useCallback(async () => {
    try {
      const granted = await ensureRecordingPermission();
      log(`マイク権限: ${granted ? '許可' : '拒否'}`);
      if (!granted) return;

      await prepareAudioMode();
      await recorder.prepareToRecordAsync();
      recorder.record();
      log('録音を開始しました');
    } catch (error) {
      log(`録音開始に失敗: ${String(error)}`);
    }
  }, [log, recorder]);

  const stop = useCallback(async () => {
    try {
      await recorder.stop();
      const uri = recorder.uri;
      setLastUri(uri);
      log(`録音を終了。size=${uri ? getRecordingSize(uri) : '不明'} bytes`);
    } catch (error) {
      log(`録音停止に失敗: ${String(error)}`);
    }
  }, [log, recorder]);

  const summarize = useCallback(async () => {
    if (!lastUri) return;
    setBusy(true);
    try {
      const started = Date.now();
      const base64 = await readRecordingAsBase64(lastUri);
      log(`Base64化 完了 (${base64.length} 文字)。Geminiへ送信します…`);

      const result = await generateSummary(base64);
      log(`要約 完了 (${((Date.now() - started) / 1000).toFixed(1)}秒)`);
      log(`title: ${result.title}`);
      log(`summary: ${result.summary}`);
    } catch (error) {
      log(`要約に失敗: ${String(error)}`);
    } finally {
      deleteRecordingFile(lastUri);
      log('一時音声ファイルを削除しました');
      setLastUri(null);
      setBusy(false);
    }
  }, [lastUri, log]);

  const canSummarize = !!lastUri && !busy && !state.isRecording;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>録音・要約 動作確認</Text>
      <Text style={styles.status}>
        {state.isRecording ? '録音中' : '停止中'} / {Math.floor((state.durationMillis ?? 0) / 1000)}秒
      </Text>

      <View style={styles.row}>
        <Pressable
          style={[styles.button, (state.isRecording || busy) && styles.buttonDisabled]}
          disabled={state.isRecording || busy}
          onPress={start}>
          <Text style={styles.buttonLabel}>録音開始</Text>
        </Pressable>
        <Pressable
          style={[styles.button, !state.isRecording && styles.buttonDisabled]}
          disabled={!state.isRecording}
          onPress={stop}>
          <Text style={styles.buttonLabel}>録音終了</Text>
        </Pressable>
        <Pressable
          style={[styles.button, !canSummarize && styles.buttonDisabled]}
          disabled={!canSummarize}
          onPress={summarize}>
          <Text style={styles.buttonLabel}>要約する</Text>
        </Pressable>
      </View>

      {busy && (
        <View style={styles.busy}>
          <ActivityIndicator color="#CE7856" />
          <Text style={styles.busyLabel}>要約しています</Text>
        </View>
      )}

      <ScrollView style={styles.logArea}>
        {logs.map((line, index) => (
          <Text key={index} style={styles.logLine} selectable>
            {line}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBF4E9', padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#422B1E' },
  status: { marginTop: 8, fontSize: 14, color: '#8E6F52' },
  row: { flexDirection: 'row', gap: 8, marginTop: 16 },
  button: {
    flex: 1,
    backgroundColor: '#CE7856',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.35 },
  buttonLabel: { color: '#FFFFFF', fontWeight: '700' },
  busy: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  busyLabel: { color: '#8E6F52' },
  logArea: { flex: 1, marginTop: 16 },
  logLine: { fontSize: 12, color: '#43302A', marginBottom: 6 },
});
