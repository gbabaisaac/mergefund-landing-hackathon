export default ({ config }) => ({
  ...config,
  name: 'RowRunner',
  slug: 'RowRunner',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'rowrunner',
  userInterfaceStyle: 'automatic',
  newArchEnabled: false,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.cdosreis.appRowRunner',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    package: 'com.cdosreis.appRowRunner',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 300,
        resizeMode: 'contain',
        backgroundColor: '#F7F8FA',
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission: 'RowRunner uses your location to find the nearest venue.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    router: {},
    eas: {
      projectId: 'd9241b56-f9e4-40d2-9941-8f70a20f82f7',
    },
  },
  owner: 'cdosreis',
  updates: {
    url: 'https://u.expo.dev/d9241b56-f9e4-40d2-9941-8f70a20f82f7',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
});
