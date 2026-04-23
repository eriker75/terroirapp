import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardAvoidingView, KeyboardProvider } from 'react-native-keyboard-controller';
import { Platform, StyleSheet, View } from 'react-native';
import { COLORS } from '@/src/constants/colors';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <StatusBar style="dark" backgroundColor={COLORS.lightBeige} />
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
          >
            <SafeAreaView style={styles.topSafeArea} edges={['top']} />
            <View style={styles.content}>
              <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="welcome" />
                <Stack.Screen name="login" />
                <Stack.Screen name="registro" />
                <Stack.Screen name="forgot-password" />
              </Stack>
            </View>
          </KeyboardAvoidingView>
          <SafeAreaView style={styles.bottomSafeArea} edges={['bottom']} />
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topSafeArea: { backgroundColor: COLORS.lightBeige },
  content: { flex: 1 },
  bottomSafeArea: { backgroundColor: COLORS.lightBeige },
});
