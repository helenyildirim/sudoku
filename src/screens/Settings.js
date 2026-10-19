import React from 'react';
import { Pressable, ScrollView, Share, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Header } from '../ui';
import { BOARD_COLORS, useTheme } from '../theme';

function SectionTitle({ children }) {
  const { c } = useTheme();
  return <Text style={{ fontSize: 15, fontWeight: '800', color: c.text, marginTop: 22, marginBottom: 10 }}>{children}</Text>;
}

function ToggleRow({ icon, label, note, value, onValueChange, disabled, last }) {
  const { c } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: c.border,
      }}
    >
      <Ionicons name={icon} size={22} color={c.primary} />
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={{ fontSize: 15, color: c.text, fontWeight: '600' }}>{label}</Text>
        {note ? <Text style={{ fontSize: 12, color: c.sub, marginTop: 2 }}>{note}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: c.border, true: c.primary }}
        thumbColor="#fff"
      />
    </View>
  );
}

function LinkRow({ icon, label, onPress, last }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: c.border,
      }}
    >
      <Ionicons name={icon} size={22} color={c.primary} />
      <Text style={{ flex: 1, marginLeft: 14, fontSize: 15, color: c.text, fontWeight: '600' }}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={c.sub} />
    </Pressable>
  );
}

export default function Settings({ settings, onChange, onBack, onLegal }) {
  const { c } = useTheme();

  const share = () => {
    Share.share({ message: 'Sudoku oynuyorum, sen de dene! 🧩' }).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title="Ayarlar" onBack={onBack} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <SectionTitle>Görünüm</SectionTitle>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 15, color: c.text, fontWeight: '600', marginRight: 14 }}>Tema</Text>
          <View style={{ flex: 1, flexDirection: 'row', backgroundColor: c.primarySoft, borderRadius: 20, padding: 4 }}>
            {[
              ['light', 'Açık'],
              ['dark', 'Koyu'],
            ].map(([key, label]) => {
              const on = settings.theme === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => onChange({ theme: key })}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: 8,
                    borderRadius: 16,
                    backgroundColor: on ? c.primary : 'transparent',
                  }}
                >
                  <Text style={{ fontWeight: '700', color: on ? '#fff' : c.sub }}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <SectionTitle>Tahta Rengi</SectionTitle>
        <View style={{ flexDirection: 'row' }}>
          {BOARD_COLORS.map((col) => {
            const on = settings.boardColor === col;
            return (
              <Pressable
                key={col}
                onPress={() => onChange({ boardColor: col })}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  marginRight: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: on ? 3 : 0,
                  borderColor: col,
                }}
              >
                <View style={{ width: on ? 28 : 40, height: on ? 28 : 40, borderRadius: 20, backgroundColor: col }} />
              </Pressable>
            );
          })}
        </View>

        <SectionTitle>Oyun Ayarları</SectionTitle>
        <Card style={{ paddingVertical: 2 }}>
          <ToggleRow
            icon="phone-portrait-outline"
            label="Titreşim"
            note="Doğru ve yanlış hamlede hafif titreşim."
            value={settings.haptics}
            onValueChange={(v) => onChange({ haptics: v })}
          />
          <ToggleRow
            icon="create-outline"
            label="Otomatik Notlar"
            note="Yeni oyunda olası sayılar not olarak doldurulur."
            value={settings.autoNotes}
            onValueChange={(v) => onChange({ autoNotes: v })}
            last
          />
        </Card>

        <SectionTitle>Diğer</SectionTitle>
        <Card style={{ paddingVertical: 2 }}>
          <LinkRow icon="shield-outline" label="Gizlilik Politikası" onPress={() => onLegal('privacy')} />
          <LinkRow icon="document-text-outline" label="Kullanım Koşulları" onPress={() => onLegal('terms')} />
          <LinkRow icon="share-outline" label="Uygulamayı Paylaş" onPress={share} last />
        </Card>
      </ScrollView>
    </View>
  );
}
