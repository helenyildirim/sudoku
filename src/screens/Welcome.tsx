import React from 'react';
import { ImageBackground, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Btn } from '../ui';

// Tasarımdaki açılış görseli. showStart=true: ilk açılış (Başla butonu var).
export default function Welcome({ showStart, onStart }: { showStart: boolean; onStart: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <ImageBackground
      source={require('../../assets/splash.jpg')}
      resizeMode="cover"
      style={{ flex: 1, backgroundColor: '#F4F9FF' }}
    >
      {showStart ? (
        <View style={{ position: 'absolute', bottom: insets.bottom + 40, left: 28, right: 28 }}>
          <Btn label="Başla" onPress={onStart} />
        </View>
      ) : null}
    </ImageBackground>
  );
}
