import { useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  deleteRecordingFile,
  ensureRecordingPermission,
  getRecordingSize,
  prepareAudioMode,
  RECORDING_OPTIONS,
} from '@/services/audio';

/**
 * ステップ2（録音の動作確認）用の暫定画面。
 * ステップ5でトップ画面（SCR-01）に差し替える。
 */
export default function TopScreen() {
  const recorder = useAudioRecorder(RECORDING_OPTIONS);
  const state = useAudioRecorderState(recorder);
  const [logs, setLogs] = useState<string[]>([]);
  const [lastUri, setLastUri] = useState<string | null>(null);

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
      const size = uri ? getRecordingSize(uri) : null;
      log(`録音を終了。size=${size ?? '不明'} bytes`);
      log(`uri=${uri ?? 'なし'}`);
    } catch (error) {
      log(`録音停止に失敗: ${String(error)}`);
    }
  }, [log, recorder]);

  const remove = useCallback(() => {
    deleteRecordingFile(lastUri);
    const size = lastUri ? getRecordingSize(lastUri) : null;
    log(`削除実行。削除後のsize=${size === null ? 'ファイルなし（OK）' : size}`);
  }, [lastUri, log]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>録音動作確認</Text>
      <Text style={styles.status}>
        {state.isRecording ? '録音中' : '停止中'} / {state.durationMillis ?? 0} ms
      </Text>

      <View style={styles.row}>
        <Pressable
          style={[styles.button, state.isRecording && styles.buttonDisabled]}
          disabled={state.isRecording}
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
          style={[styles.button, !lastUri && styles.buttonDisabled]}
          disabled={!lastUri}
          onPress={remove}>
          <Text style={styles.buttonLabel}>削除</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.logArea}>
        {logs.map((line, index) => (
          <Text key={index} style={styles.logLine}>
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
  logArea: { flex: 1, marginTop: 16 },
  logLine: { fontSize: 12, color: '#43302A', marginBottom: 4 },
});
