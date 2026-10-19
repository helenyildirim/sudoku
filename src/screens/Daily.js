import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Btn, Card, Header } from '../ui';
import { useTheme } from '../theme';
import { currentStreak, fmtTime, todayKey, weekDays } from '../dates';

export default function Daily({ daily, onBack, onPlay }) {
  const { c } = useTheme();
  const days = weekDays();
  const today = todayKey();
  const todayResult = daily.done[today];
  const streak = currentStreak(daily.done);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header
        title="Günlük Mücadele"
        subtitle="Her gün yeni bir bulmaca, yeni bir meydan okuma!"
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 8 }}>
        {/* Hafta şeridi */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 }}>
          {days.map((d) => (
            <View key={d.key} style={{ alignItems: 'center', width: 42 }}>
              <Text style={{ fontSize: 11, color: c.sub, marginBottom: 6 }}>{d.label}</Text>
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: d.isToday ? c.primary : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: d.isToday ? '#fff' : c.text }}>{d.day}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Bugünün bulmacası */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: c.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="trophy" size={26} color="#fff" />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: c.text }}>Bugünün Bulmacası</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Ionicons name="timer-outline" size={14} color={c.sub} />
                <Text style={{ fontSize: 13, color: c.sub, marginLeft: 4 }}>
                  {todayResult ? `Çözüldü · ${fmtTime(todayResult.seconds)}` : 'Orta Seviye · 9x9'}
                </Text>
              </View>
            </View>
          </View>
          <Btn label={todayResult ? 'Tekrar Oyna' : 'Oyna'} onPress={onPlay} style={{ marginTop: 16, height: 48 }} />
        </Card>

        {/* Günlük seri */}
        <Card style={{ marginTop: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="flame" size={30} color="#F97316" />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>Günlük Seri</Text>
              <Text style={{ fontSize: 13, color: c.sub, marginTop: 2 }}>
                {streak > 0 ? `${streak} gün üst üste oynadın!` : 'Bugün oyna, serini başlat!'}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
            {days.map((d) => {
              const done = !!daily.done[d.key];
              return (
                <View key={d.key} style={{ alignItems: 'center', width: 36 }}>
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      backgroundColor: done ? c.success : 'transparent',
                      borderWidth: done ? 0 : 1.5,
                      borderColor: d.isToday ? c.primary : c.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {done ? <Ionicons name="checkmark" size={18} color="#fff" /> : null}
                  </View>
                  <Text style={{ fontSize: 11, color: c.sub, marginTop: 4 }}>{d.label}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        <Card style={{ marginTop: 14, backgroundColor: c.primarySoft, borderColor: c.primarySoft }}>
          <Text style={{ textAlign: 'center', color: c.sub, fontSize: 15, fontStyle: 'italic', lineHeight: 22 }}>
            “Her çözüm,{'\n'}yeni bir başlangıçtır.”
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}
