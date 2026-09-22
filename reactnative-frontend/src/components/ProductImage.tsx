import { View, Image, StyleSheet, ImageStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  uri: string | null;
  style?: StyleProp<ImageStyle>;
}

export default function ProductImage({ uri, style }: Props) {
  if (!uri) {
    return (
      <View style={[styles.placeholder, style]}>
        <Ionicons name="image-outline" size={32} color="#9ca3af" />
      </View>
    );
  }

  return <Image source={{ uri }} style={style} resizeMode="cover" />;
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});