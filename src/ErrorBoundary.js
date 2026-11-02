import React from 'react';
import { Pressable, Text, View } from 'react-native';

// Beklenmedik bir hata uygulamayı beyaz ekranda bırakmasın
export default class ErrorBoundary extends React.Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#F4F9FF' }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#10243E', textAlign: 'center' }}>Bir sorun oluştu</Text>
        <Text style={{ fontSize: 15, color: '#5B6B82', textAlign: 'center', marginTop: 8 }}>
          Kayıtlı oyunun güvende. Tekrar deneyebilirsin.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tekrar dene"
          onPress={() => this.setState({ failed: false })}
          style={{ marginTop: 20, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 24, backgroundColor: '#1F6BF5' }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Tekrar Dene</Text>
        </Pressable>
      </View>
    );
  }
}
