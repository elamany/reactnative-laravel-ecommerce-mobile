import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import SignInPrompt from '@/components/SignInPrompt';

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <SignInPrompt 
        icon="person-circle-outline"
        title="Sign in required" 
        message="Log in to view your profile and manage your account." 
      />
    );
  }

  const initial = user.name
    ? user.name.charAt(0).toUpperCase()
    : '?';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Name</Text>
          <Text style={styles.rowValue}>{user.name}</Text>
        </View>
        <View style={[styles.row, styles.rowBorder]}>
          <Text style={styles.rowLabel}>Email</Text>
          <Text style={styles.rowValue}>{user.email}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={logout}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 40 },

  header: { alignItems: 'center', marginBottom: 32 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: { color: '#fff', fontSize: 40, fontWeight: '700' },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  email: { fontSize: 14, color: '#6b7280' },

  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  row: { paddingVertical: 16 },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  rowValue: { fontSize: 15, color: '#111827' },

  logoutButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});