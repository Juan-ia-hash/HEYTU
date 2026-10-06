import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = { children: ReactNode; onReset?: () => void };
type State = { error: Error | null };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (__DEV__)
      console.error('Application rendering error', error, info.componentStack);
  }

  private reset = (): void => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="mb-4 text-center text-base text-slate-900">
          Algo salió mal. Inténtalo de nuevo.
        </Text>
        {__DEV__ ? (
          <Text className="mb-4 text-center text-sm text-red-700">
            {this.state.error.message}
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver a cargar la aplicación"
          onPress={this.reset}
          className="rounded-xl bg-indigo-600 px-5 py-3"
        >
          <Text className="font-semibold text-white">Intentar de nuevo</Text>
        </Pressable>
      </View>
    );
  }
}
