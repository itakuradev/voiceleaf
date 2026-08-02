import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RecordingsProvider } from '@/contexts/RecordingsContext';
import { cleanupLeftoverRecordings } from '@/services/audio';
import { colors } from '@/theme/colors';

export default function RootLayout() {
  // プロセスが強制終了した場合に備え、起動時にも残存音声を掃除する
  useEffect(() => {
    cleanupLeftoverRecordings();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RecordingsProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: 'slide_from_right',
            }}
          />
        </RecordingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
