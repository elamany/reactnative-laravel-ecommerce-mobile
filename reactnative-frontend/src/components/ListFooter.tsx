import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface Props {
  loadingMore: boolean;
  hasMore: boolean;
  /** Text shown when the end is reached. Defaults to "End of list". */
  endText?: string;
}

export default function ListFooter({
  loadingMore,
  hasMore,
  endText = 'End of list',
}: Props) {
  if (loadingMore) {
    return (
      <View style={styles.footer}>
        <ActivityIndicator color="#2563EB" />
      </View>
    );
  }

  if (!hasMore) {
    return (
      <View style={styles.footer}>
        <Text style={styles.text}>— {endText} —</Text>
      </View>
    );
  }

  // Still has more, but not loading right now. Return a small spacer so
  // the footer's height stays consistent — prevents the layout from
  // jumping when the spinner appears.
  return <View style={styles.spacer} />;
}

const styles = StyleSheet.create({
  footer: { paddingVertical: 24, alignItems: 'center' },
  text: { color: '#9ca3af', fontSize: 13 },
  spacer: { height: 40 },
});