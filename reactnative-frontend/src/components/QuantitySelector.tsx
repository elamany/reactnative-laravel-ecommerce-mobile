import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  size?: 'small' | 'large';
}

export default function QuantitySelector({
  value,
  onIncrement,
  onDecrement,
  min = 1,
  max = 99,
  size = 'small',
}: Props) {
  const atMin = value <= min;
  const atMax = value >= max;
  const isLarge = size === 'large';

  return (
    <View style={[styles.row, isLarge && styles.rowLarge]}>
      <TouchableOpacity
        onPress={onDecrement}
        disabled={atMin}
        style={[
          styles.button,
          isLarge && styles.buttonLarge,
          atMin && styles.buttonDisabled,
        ]}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.symbol,
            isLarge && styles.symbolLarge,
            atMin && styles.symbolDisabled,
          ]}
        >
          −
        </Text>
      </TouchableOpacity>

      <Text style={[styles.value, isLarge && styles.valueLarge]}>
        {value}
      </Text>

      <TouchableOpacity
        onPress={onIncrement}
        disabled={atMax}
        style={[
          styles.button,
          isLarge && styles.buttonLarge,
          atMax && styles.buttonDisabled,
        ]}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.symbol,
            isLarge && styles.symbolLarge,
            atMax && styles.symbolDisabled,
          ]}
        >
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
  },
  rowLarge: {
    borderRadius: 10,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
  },
  buttonLarge: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  symbol: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 20,
  },
  symbolLarge: {
    fontSize: 20,
    lineHeight: 24,
  },
  symbolDisabled: {
    color: '#9ca3af',
  },
  value: {
    minWidth: 36,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  valueLarge: {
    minWidth: 48,
    fontSize: 16,
  },
});