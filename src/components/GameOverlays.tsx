import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { Btn } from '../ui';
import { ACHIEVEMENT_BY_ID } from '../achievements';
import { fmtTime } from '../dates';
import { MAX_MISTAKES } from '../game/session';
import type { FinishResult, GameStatus, IconName } from '../types';

type PauseItemProps = { icon: IconName; label: string; onPress: () => void; primary?: boolean; outline?: boolean };

function PauseItem({ icon, label, onPress, primary, outline }: PauseItemProps) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        height: 54,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        marginBottom: 10,
        backgroundColor: primary ? c.primary : outline ? 'transparent' : 'rgba(255,255,255,0.1)',
        borderWidth: outline ? 1 : 0,
        borderColor: 'rgba(255,255,255,0.35)',
      }}
    >
      <Ionicons name={icon} size={22} color="#fff" />
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 14 }}>{label}</Text>
    </Pressable>
  );
}

type PauseMenuProps = { onResume: () => void; onRestart: () => void; onChangeLevel: () => void; onHome: () => void };

export function PauseMenu({ onResume, onRestart, onChangeLevel, onHome }: PauseMenuProps) {
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(9,24,66,0.95)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <View style={{ width: '100%', maxWidth: 420 }}>
        <View style={{ alignItems: 'center', marginBottom: 22 }}>
          <View
            style={{
              width: 68,
              height: 68,
              borderRadius: 34,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="pause" size={34} color="#fff" />
          </View>
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 12 }}>Duraklatıldı</Text>
        </View>
        <PauseItem icon="play" label="Devam Et" primary onPress={onResume} />
        <PauseItem icon="refresh" label="Yeniden Başla" onPress={onRestart} />
        <PauseItem icon="swap-horizontal" label="Zorluk Değiştir" onPress={onChangeLevel} />
        <PauseItem icon="home" label="Ana Menü" onPress={onHome} />
        <View style={{ height: 10 }} />
        <PauseItem icon="close" label="Kapat" outline onPress={onResume} />
      </View>
    </View>
  );
}

type ResultCardProps = {
  status: GameStatus;
  seconds: number;
  result: FinishResult | null;
  onNewGame: () => void;
  onRestart: () => void;
  onHome: () => void;
};

export function ResultCard({ status, seconds, result, onNewGame, onRestart, onHome }: ResultCardProps) {
  const { c } = useTheme();
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(8,20,60,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 28,
      }}
    >
      <View style={{ backgroundColor: c.card, borderRadius: 24, padding: 24, width: '100%', maxWidth: 420 }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: c.text, textAlign: 'center' }}>
          {status === 'won' ? 'Tebrikler! 🎉' : 'Oyun bitti'}
        </Text>
        <Text style={{ fontSize: 16, color: c.sub, textAlign: 'center', marginTop: 8 }}>
          {status === 'won'
            ? `Süre: ${fmtTime(seconds)}${result && result.record ? '  ·  Yeni rekor!' : ''}`
            : `${MAX_MISTAKES} hata yaptın, bir dahaki sefere!`}
        </Text>
        {result && result.newly && result.newly.length > 0 ? (
          <View style={{ marginTop: 14, backgroundColor: c.primarySoft, borderRadius: 14, padding: 12 }}>
            <Text style={{ color: c.primary, fontWeight: '800', textAlign: 'center' }}>Yeni başarım!</Text>
            {result.newly.map((id) => (
              <Text key={id} style={{ color: c.text, textAlign: 'center', marginTop: 4 }}>
                {ACHIEVEMENT_BY_ID[id].title}
              </Text>
            ))}
          </View>
        ) : null}
        <Btn
          label={status === 'won' ? 'Yeni Oyun' : 'Tekrar Dene'}
          onPress={status === 'won' ? onNewGame : onRestart}
          style={{ marginTop: 18 }}
        />
        <Btn label="Ana Menü" variant="outline" onPress={onHome} style={{ marginTop: 10 }} />
      </View>
    </View>
  );
}
