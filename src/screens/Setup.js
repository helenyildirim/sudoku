import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { Btn, LogoMark } from '../ui';
import { useTheme } from '../theme';

// Sadece ilk açılışta görünen "Adın nedir?" ekranı
export default function Setup({ onDone }) {
  const { c } = useTheme();
  const [text, setText] = useState('');
  const name = text.trim();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 28 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <LogoMark size={104} />
        </View>
        <Text style={{ fontSize: 28, fontWeight: '800', color: c.text, textAlign: 'center' }}>Hoş geldin!</Text>
        <Text style={{ fontSize: 15, color: c.sub, textAlign: 'center', marginTop: 8 }}>
          Sana nasıl hitap edelim?
        </Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Adın"
          placeholderTextColor={c.sub}
          maxLength={20}
          returnKeyType="done"
          onSubmitEditing={() => name && onDone(name)}
          style={{
            marginTop: 24,
            height: 54,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: c.border,
            paddingHorizontal: 16,
            fontSize: 17,
            color: c.text,
            backgroundColor: c.card,
          }}
        />
        <Btn label="Devam" onPress={() => name && onDone(name)} disabled={!name} style={{ marginTop: 16 }} />
        <Text style={{ color: c.sub, fontSize: 12, textAlign: 'center', marginTop: 14 }}>
          Bu ekran yalnızca ilk açılışta görünür.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
