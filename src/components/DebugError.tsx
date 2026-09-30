import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ErrorUtils } from 'react-native';

interface ErrorInfo {
  message: string;
  stack: string;
}

interface State {
  error: ErrorInfo | null;
}

function toErrorInfo(prefix: string, error: any): ErrorInfo {
  return {
    message: `${prefix}: ${String(error?.message ?? error)}`,
    stack: String(error?.stack ?? ''),
  };
}

/**
 * TEMPORARY diagnostic wrapper (build 13 only).
 * Catches any JS error (render errors via the boundary, event-handler /
 * promise errors via the global handler) and displays it on screen
 * instead of letting it go to RCTExceptionsManager.reportFatal,
 * which is currently aborting the app natively.
 */
export class DebugErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: any): State {
    return { error: toErrorInfo('RENDER', error) };
  }

  componentDidCatch(error: any) {
    this.setState({ error: toErrorInfo('RENDER', error) });
  }

  componentDidMount() {
    ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
      this.setState({ error: toErrorInfo(isFatal ? 'GLOBAL FATAL' : 'GLOBAL', error) });
      // Deliberately NOT calling the previous handler: the default
      // handler calls reportFatal, which is aborting the app natively.
    });
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>JS error caught (debug build)</Text>
          <ScrollView style={styles.scroll}>
            <Text selectable style={styles.message}>
              {error.message}
            </Text>
            <Text selectable style={styles.stack}>
              {error.stack}
            </Text>
          </ScrollView>
          <Text style={styles.hint}>Please screenshot this screen and send it to GoGo.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 60 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#b00020', marginBottom: 12 },
  scroll: { flex: 1 },
  message: { fontSize: 14, color: '#111', marginBottom: 12 },
  stack: { fontSize: 11, color: '#555' },
  hint: { fontSize: 13, color: '#888', marginTop: 12, textAlign: 'center' },
});
