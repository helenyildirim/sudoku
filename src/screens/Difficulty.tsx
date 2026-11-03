import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Btn, Header, LEVEL_INFO, LevelIcon } from '../ui';
import { LEVELS, LEVEL_KEYS, useTheme } from '../theme';
import type { Level } from '../game/sudoku';

type Props = { onBack: () => void; onStart: (level: Level) => void };

export default function Difficulty({ onBack, onStart }: Props) {
  const { c } = useTheme();
  const [selected, setSelected] = useState<Level>('easy');

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title="Zorluk Seviyesi" subtitle="Kendine uygun seviyeyi seç." onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 8 }}>
        {LEVEL_KEYS.map((lv) => {
          const on = selected === lv;
          return (
            <Pressable
              key={lv}
              onPress={() => setSelected(lv)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: c.card,
                borderRadius: 20,
                borderWidth: on ? 2 : 1,
                borderColor: on ? c.primary : c.border,
                padding: 14,
                marginBottom: 12,
              }}
            >
              <LevelIcon level={lv} size={48} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: c.text }}>{LEVELS[lv]}</Text>
                <Text style={{ fontSize: 13, color: c.sub, marginTop: 2 }}>{LEVEL_INFO[lv].desc}</Text>
              </View>
              <Ionicons name={on ? 'checkmark-circle' : 'chevron-forward'} size={22} color={on ? c.primary : c.sub} />
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={{ padding: 20, paddingTop: 8 }}>
        <Btn label="Başla" onPress={() => onStart(selected)} />
      </View>
    </View>
  );
}
