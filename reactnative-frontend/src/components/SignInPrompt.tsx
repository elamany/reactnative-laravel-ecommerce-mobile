import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LoginSheet from '@/components/LoginSheet';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface Props {
  icon: IoniconName;
  title: string;
  message: string;
}

export default function SignInPrompt({ icon, title, message }: Props) {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={48} color="#2563EB" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowLogin(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>

      <LoginSheet
        visible={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => setShowLogin(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: '#2563EB',
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});