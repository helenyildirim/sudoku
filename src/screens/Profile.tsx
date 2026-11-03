import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, NameModal } from '../ui';
import { useTheme } from '../theme';
import { ACHIEVEMENTS } from '../achievements';
import { StatCard, pct } from './Stats';
import type { Achievement, IconName, Profile as ProfileData, Stats, ThemeName } from '../types';

type RowProps = { icon: IconName; label: string; right?: string; onPress?: () => void; last?: boolean };

function Row({ icon, label, right, onPress, last }: RowProps) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
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
      {right ? <Text style={{ color: c.sub, fontSize: 13, marginRight: 6 }}>{right}</Text> : null}
      {onPress ? <Ionicons name="chevron-forward" size={18} color={c.sub} /> : null}
    </Pressable>
  );
}

type Props = {
  profile: ProfileData | null;
  stats: Stats;
  theme: ThemeName;
  onEditName: (name: string) => void;
  onToggleTheme: () => void;
  onLogout: () => void;
};

export default function Profile({ profile, stats, theme, onEditName, onToggleTheme, onLogout }: Props) {
  const { c } = useTheme();
  const [editing, setEditing] = useState(false);
  const name = (profile && profile.name) || 'Oyuncu';
  const unlockedCount = ACHIEVEMENTS.filter((a) => stats.unlocked[a.id]).length;

  const showAchievement = (a: Achievement) => {
    const on = !!stats.unlocked[a.id];
    Alert.alert(a.title, `${a.desc}${on ? '\n\nKazanıldı ✓' : '\n\nHenüz kilitli.'}`);
  };

  const accountSettings = () =>
    Alert.alert('Hesap', 'Çıkış yapınca ilk açılış ekranı yeniden gösterilir. İstatistiklerin silinmez.', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Çıkış yap', style: 'destructive', onPress: onLogout },
    ]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 20, paddingBottom: 24 }}>
      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <View>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: c.primarySoft,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 3,
              borderColor: c.card,
            }}
          >
            <Text style={{ fontSize: 44, fontWeight: '800', color: c.primary }}>{name.charAt(0).toUpperCase()}</Text>
          </View>
          <Pressable
            onPress={() => setEditing(true)}
            style={{
              position: 'absolute',
              right: -2,
              bottom: 0,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: c.primary,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: c.bg,
            }}
          >
            <Ionicons name="pencil" size={15} color="#fff" />
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: c.text }}>{name}</Text>
          <MaterialCommunityIcons name="crown" size={22} color={c.primary} style={{ marginLeft: 8 }} />
        </View>
        <Text style={{ fontSize: 14, color: c.primary, marginTop: 2 }}>Sudoku Tutkunu</Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
        <StatCard icon="game-controller-outline" label="Toplam Oyun" value={stats.played} />
        <StatCard icon="analytics-outline" label="Başarı Oranı" value={`%${pct(stats.won, stats.played)}`} />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, marginBottom: 12 }}>
        <Text style={{ fontSize: 17, fontWeight: '800', color: c.text }}>Başarımlar</Text>
        <Text style={{ fontSize: 14, color: c.sub }}>
          {unlockedCount}/{ACHIEVEMENTS.length}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 12 }}>
        {ACHIEVEMENTS.map((a) => {
          const on = !!stats.unlocked[a.id];
          return (
            <Pressable key={a.id} onPress={() => showAchievement(a)} style={{ width: '16.66%', alignItems: 'center' }}>
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  backgroundColor: on ? c.primarySoft : c.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: on ? 2 : 0,
                  borderColor: c.primary,
                }}
              >
                <Ionicons name={on ? a.icon : 'lock-closed'} size={22} color={on ? c.primary : c.sub} />
              </View>
            </Pressable>
          );
        })}
      </View>

      <Card style={{ marginTop: 22, paddingVertical: 4 }}>
        <Row icon="person-outline" label="Kişisel Bilgiler" onPress={() => setEditing(true)} />
        <Row
          icon="color-palette-outline"
          label="Tema"
          right={theme === 'dark' ? 'Koyu Tema' : 'Açık Tema'}
          onPress={onToggleTheme}
        />
        <Row icon="settings-outline" label="Hesap Ayarları" onPress={accountSettings} last />
      </Card>

      <NameModal
        visible={editing}
        title="Adını değiştir"
        initial={name}
        confirmLabel="Kaydet"
        onSave={(n) => {
          setEditing(false);
          onEditName(n);
        }}
        onCancel={() => setEditing(false)}
      />
    </ScrollView>
  );
}
