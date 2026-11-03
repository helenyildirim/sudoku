import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../ui';
import { LEVELS, useTheme } from '../theme';
import { fmtTime, todayKey } from '../dates';
import type { DailyData, IconName, Profile, SavedGame } from '../types';

function Tile({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: '48%',
        backgroundColor: c.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: c.border,
        alignItems: 'center',
        paddingVertical: 22,
        marginBottom: 14,
      }}
    >
      <Ionicons name={icon} size={30} color={c.primary} />
      <Text style={{ marginTop: 8, fontSize: 15, fontWeight: '700', color: c.text, textAlign: 'center' }}>{label}</Text>
    </Pressable>
  );
}

type Props = {
  profile: Profile | null;
  saved: SavedGame | null;
  daily: DailyData;
  lessonsDone?: number;
  onLearn: () => void;
  onNewGame: () => void;
  onResume: () => void;
  onDaily: () => void;
  onStats: () => void;
  onProfile: () => void;
  onSettings: () => void;
};

export default function Home({
  profile,
  saved,
  daily,
  lessonsDone = 0,
  onLearn,
  onNewGame,
  onResume,
  onDaily,
  onStats,
  onProfile,
  onSettings,
}: Props) {
  const { c } = useTheme();
  const name = (profile && profile.name) || 'Oyuncu';
  const dailyDone = !!daily.done[todayKey()];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 20, paddingBottom: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Image source={require('../../assets/icon.png')} style={{ width: 56, height: 56, borderRadius: 16, marginRight: 12 }} />
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ fontSize: 18, color: c.sub }}>Merhaba,</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 30, fontWeight: '800', color: c.text }} numberOfLines={1}>
              {name}
            </Text>
            <MaterialCommunityIcons name="crown" size={24} color={c.primary} style={{ marginLeft: 8 }} />
          </View>
          <Text style={{ fontSize: 14, color: c.sub, marginTop: 2 }}>Bugün de harika bir gün!</Text>
        </View>
        <Pressable
          onPress={onSettings}
          hitSlop={10}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="settings-outline" size={22} color={c.primary} />
        </Pressable>
      </View>

      {saved ? (
        <Card onPress={onResume} style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="play-circle" size={40} color={c.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>Devam Et</Text>
            <Text style={{ fontSize: 13, color: c.sub, marginTop: 2 }}>
              {saved.mode === 'daily' ? 'Günlük mücadele' : LEVELS[saved.level]} · {fmtTime(saved.seconds)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={c.sub} />
        </Card>
      ) : null}

      <Card onPress={onLearn} style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: c.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="school-outline" size={24} color={c.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>Sudoku Okulu</Text>
          <Text style={{ fontSize: 13, color: c.sub, marginTop: 2 }}>
            {lessonsDone === 0 ? 'Yeni başlayanlar için adım adım eğitim' : `${lessonsDone}/5 ders tamamlandı`}
          </Text>
        </View>
        <Ionicons name={lessonsDone >= 5 ? 'checkmark-circle' : 'chevron-forward'} size={22} color={lessonsDone >= 5 ? c.success : c.sub} />
      </Card>

      <Card onPress={onDaily} style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: c.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="calendar-outline" size={24} color={c.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>Günlük Mücadele</Text>
          <Text style={{ fontSize: 13, color: c.sub, marginTop: 2 }}>
            {dailyDone ? 'Bugünün bulmacasını çözdün!' : 'Bugünün bulmacası seni bekliyor!'}
          </Text>
        </View>
        <Ionicons name={dailyDone ? 'checkmark-circle' : 'chevron-forward'} size={22} color={dailyDone ? c.success : c.sub} />
      </Card>

      <Pressable
        onPress={onNewGame}
        style={{
          marginTop: 14,
          backgroundColor: c.primary,
          borderRadius: 22,
          paddingVertical: 20,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="play" size={34} color="#fff" />
        <View style={{ marginLeft: 14 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff' }}>Yeni Oyun</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>Zorluk seviyeni seç ve başla</Text>
        </View>
      </Pressable>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 18 }}>
        <Tile icon="trophy-outline" label="Günlük Mücadele" onPress={onDaily} />
        <Tile icon="stats-chart-outline" label="İstatistikler" onPress={onStats} />
        <Tile icon="star-outline" label="Başarılar" onPress={onProfile} />
        <Tile icon="settings-outline" label="Ayarlar" onPress={onSettings} />
      </View>
    </ScrollView>
  );
}
