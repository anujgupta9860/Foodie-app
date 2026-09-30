import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../src/store';
import { DebugErrorBoundary } from '../src/components/DebugError';

export default function RootLayout() {
  return (
    <DebugErrorBoundary>
      <AppProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
      </AppProvider>
    </DebugErrorBoundary>
  );
}
