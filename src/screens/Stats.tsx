import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, LEVEL_INFO, LevelIcon } from '../ui';
import { LEVELS, LEVEL_KEYS, useTheme } from '../theme';
import { currentStreak, fmtTime, longestStreak } from '../dates';
import type { DailyData, IconName, Stats as StatsData } from '../types';

export const pct = (won: number, played: number): number => (played > 0 ? Math.round((won / played) * 100) : 0);

export function StatCard({ icon, label, value }: { icon: IconName; label: string; value: string | number }) {
  const { c } = useTheme();
  return (
    <Card style={{ width: '48%', marginBottom: 12, paddingVertical: 16 }}>
      <Ionicons name={icon} size={26} color={c.primary} />
      <Text style={{ fontSize: 12, color: c.sub, marginTop: 10 }}>{label}</Text>
      <Text style={{ fontSize: 24, fontWeight: '800', color: c.text, marginTop: 2 }}>{value}</Text>
    </Card>
  );
}

const TABS = ['Genel', 'Zorluklar', 'Mücadele'];

export default function Stats({ stats, daily }: { stats: StatsData; daily: DailyData }) {
  const { c } = useTheme();
  const [tab, setTab] = useState(0);
  const longest = longestStreak(daily.done);
  const doneCount = Object.keys(daily.done).length;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12 }}>
        <Ionicons name="stats-chart" size={24} color={c.primary} />
        <Text style={{ fontSize: 24, fontWeight: '800', color: c.text, marginLeft: 10 }}>İstatistikler</Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: 20,
          marginTop: 16,
          backgroundColor: c.primarySoft,
          borderRadius: 20,
          padding: 4,
        }}
      >
        {TABS.map((t, i) => (
          <Pressable
            key={t}
            onPress={() => setTab(i)}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 9,
              borderRadius: 16,
              backgroundColor: tab === i ? c.primary : 'transparent',
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: tab === i ? '#fff' : c.sub }}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 24 }}>
        {tab === 0 ? (
          <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <StatCard icon="game-controller-outline" label="Toplam Oyun" value={stats.played} />
              <StatCard icon="analytics-outline" label="Başarı Oranı" value={`%${pct(stats.won, stats.played)}`} />
              <StatCard icon="time-outline" label="En İyi Süre" value={fmtTime(stats.bestTime)} />
              <StatCard icon="flame-outline" label="En Uzun Seri" value={`${longest} gün`} />
            </View>
            <Text style={{ fontSize: 17, fontWeight: '800', color: c.text, marginTop: 8, marginBottom: 12 }}>
              Zorluk Seviyelerine Göre
            </Text>
            {LEVEL_KEYS.map((lv) => {
              const s = stats.levels[lv];
              const p = pct(s.won, s.played);
              return (
                <View key={lv} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                  <LevelIcon level={lv} size={30} />
                  <Text style={{ width: 56, marginLeft: 10, color: c.text, fontSize: 13, fontWeight: '600' }}>
                    {LEVELS[lv]}
                  </Text>
                  <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: c.border, overflow: 'hidden' }}>
                    <View style={{ width: `${p}%`, height: 8, borderRadius: 4, backgroundColor: LEVEL_INFO[lv].color }} />
                  </View>
                  <Text style={{ width: 44, textAlign: 'right', color: c.sub, fontSize: 12 }}>%{p}</Text>
                </View>
              );
            })}
          </>
        ) : null}

        {tab === 1
          ? LEVEL_KEYS.map((lv) => {
              const s = stats.levels[lv];
              return (
                <Card key={lv} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <LevelIcon level={lv} size={38} />
                    <Text style={{ fontSize: 17, fontWeight: '700', color: c.text, marginLeft: 12 }}>{LEVELS[lv]}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 14 }}>
                    {[
                      ['Oynanan', s.played],
                      ['Kazanılan', s.won],
                      ['En İyi Süre', fmtTime(s.best)],
                    ].map(([label, val]) => (
                      <View key={label} style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, color: c.sub }}>{label}</Text>
                        <Text style={{ fontSize: 18, fontWeight: '800', color: c.text, marginTop: 2 }}>{val}</Text>
                      </View>
                    ))}
                  </View>
                </Card>
              );
            })
          : null}

        {tab === 2 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <StatCard icon="calendar-outline" label="Tamamlanan Gün" value={doneCount} />
            <StatCard icon="flame-outline" label="Güncel Seri" value={`${currentStreak(daily.done)} gün`} />
            <StatCard icon="trophy-outline" label="En Uzun Seri" value={`${longest} gün`} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
