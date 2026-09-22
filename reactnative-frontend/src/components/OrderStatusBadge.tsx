import { View, Text, StyleSheet } from 'react-native';

interface Props {
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
}

export default function OrderStatusBadge({ status }: Props) {
  const config = {
    SUCCESS: { bg: '#dcfce7', fg: '#166534', label: 'Paid' },
    PENDING: { bg: '#fef3c7', fg: '#92400e', label: 'Pending' },
    FAILED: { bg: '#fee2e2', fg: '#991b1b', label: 'Failed' },
  }[status];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.fg }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});