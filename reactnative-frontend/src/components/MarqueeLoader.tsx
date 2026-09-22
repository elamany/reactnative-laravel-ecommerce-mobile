import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

interface Props {
  height?: number;
}

export default function MarqueeLoader({ height = 3 }: Props) {
  const screenWidth = Dimensions.get('window').width;
  const barWidth = screenWidth * 0.4;

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 1400,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  // Sweep from fully off the left (-barWidth) to fully off the right (screenWidth)
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-barWidth, screenWidth],
  });

  return (
    <View style={[styles.container, { height }]}>
      <Animated.View
        style={[
          styles.bar,
          {
            width: barWidth,
            height,
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  bar: {
    backgroundColor: '#2563EB',
    borderRadius: 2,
  },
});