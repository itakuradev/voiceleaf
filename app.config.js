/**
 * Expo アプリ設定。
 *
 * Gemini APIキーは .env（Git管理外）から読み込み、extra 経由でアプリへ渡す。
 * 詳細は docs/02-design.md 10章を参照。
 */
export default {
  expo: {
    name: '独り言要約',
    slug: 'voiceleaf',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'voiceleaf',
    userInterfaceStyle: 'light',
    ios: {
      supportsTablet: true,
    },
    android: {
      package: 'com.itakuradev.voiceleaf',
      adaptiveIcon: {
        backgroundColor: '#FBF4E9',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-audio',
        {
          microphonePermission: '独り言を録音するためにマイクを使用します。',
        },
      ],
    ],
    extra: {
      geminiApiKey: process.env.GEMINI_API_KEY,
    },
  },
};
