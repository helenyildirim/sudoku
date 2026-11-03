import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { Btn } from '../ui';
import type { Hint } from '../game/sudoku';
import type { IconName } from '../types';

type ToolProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
  badge?: number;
};

export function Tool({ icon, label, onPress, active, disabled, badge }: ToolProps) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active, disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      style={{ flex: 1, alignItems: 'center', opacity: disabled ? 0.35 : 1 }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: active ? c.primary : c.card,
          borderWidth: 1,
          borderColor: active ? c.primary : c.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={22} color={active ? '#fff' : c.text} />
        {badge != null ? (
          <View
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: c.primary,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 4,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={{ fontSize: 12, color: c.sub, marginTop: 5 }}>{label}</Text>
    </Pressable>
  );
}

type HintCardProps = { hintInfo: Hint; onClose: () => void; onApply: () => void };

export function HintCard({ hintInfo, onClose, onApply }: HintCardProps) {
  const { c } = useTheme();
  return (
    <View
      style={{
        marginHorizontal: 20,
        marginTop: 14,
        padding: 14,
        borderRadius: 16,
        backgroundColor: c.card,
        borderWidth: 1,
        borderColor: '#F59E0B',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name="bulb" size={20} color="#F59E0B" />
        <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: '800', color: c.text }}>{hintInfo.title}</Text>
      </View>
      <Text style={{ marginTop: 6, fontSize: 14, lineHeight: 20, color: c.text }}>{hintInfo.text}</Text>
      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        <Btn label="Kapat" variant="outline" onPress={onClose} style={{ flex: 1, height: 44, marginRight: 8 }} />
        <Btn label="Yerleştir" onPress={onApply} style={{ flex: 1, height: 44 }} />
      </View>
    </View>
  );
}

type NumberPadProps = {
  padW: number;
  remaining: (n: number) => number;
  onInput: (n: number) => void;
  onErase: () => void;
};

export function NumberPad({ padW, remaining, onInput, onErase }: NumberPadProps) {
  const { c } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        rowGap: 10,
        columnGap: 10,
        marginTop: 18,
        paddingHorizontal: 20,
      }}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
        const left = remaining(n);
        return (
          <Pressable
            key={n}
            onPress={() => onInput(n)}
            disabled={left === 0}
            accessibilityRole="button"
            accessibilityLabel={`${n} sayısı, ${left} kaldı`}
            style={{
              width: padW,
              height: Math.round(padW * 0.9),
              borderRadius: 14,
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.border,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: left === 0 ? 0.3 : 1,
            }}
          >
            <Text style={{ fontSize: 26, fontWeight: '600', color: c.primary }}>{n}</Text>
          </Pressable>
        );
      })}
      <Pressable
        onPress={onErase}
        style={{
          width: padW,
          height: Math.round(padW * 0.9),
          borderRadius: 14,
          backgroundColor: c.card,
          borderWidth: 1,
          borderColor: c.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="backspace-outline" size={26} color={c.primary} />
      </Pressable>
    </View>
  );
}
