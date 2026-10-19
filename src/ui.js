import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from './theme';

// ---------- Logo (tasarımdaki ikonun kod ile çizilmiş hali) ----------
export function LogoMark({ size = 120 }) {
  const pad = Math.round(size * 0.09);
  const gap = Math.max(2, Math.round(size * 0.03));
  const cell = Math.floor((size - pad * 2 - gap * 2) / 3);
  const grid = [1, 2, 3, 6, 0, 9, 7, 8, 9];
  return (
    <View style={{ alignItems: 'center' }}>
      <MaterialCommunityIcons
        name="crown"
        size={Math.round(size * 0.3)}
        color="#1F6BF5"
        style={{ marginBottom: -Math.round(size * 0.05), zIndex: 1 }}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.22),
          backgroundColor: '#1F6BF5',
          padding: pad,
          flexDirection: 'row',
          flexWrap: 'wrap',
          rowGap: gap,
          columnGap: gap,
          shadowColor: '#1F6BF5',
          shadowOpacity: 0.35,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        }}
      >
        {grid.map((n, i) => (
          <View
            key={i}
            style={{
              width: cell,
              height: cell,
              borderRadius: Math.round(cell * 0.22),
              backgroundColor: n === 0 ? '#6DB3FF' : '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {n !== 0 && (
              <Text style={{ fontSize: Math.round(cell * 0.6), fontWeight: '800', color: '#12327A' }}>{n}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

// ---------- Zorluk seviyesi bilgileri ----------
export const LEVEL_INFO = {
  easy: { lib: 'ion', icon: 'leaf', color: '#10B981', bg: '#D9F5EA', desc: 'Yeni başlayanlar için ideal.' },
  medium: { lib: 'ion', icon: 'star', color: '#1F6BF5', bg: '#DCEBFF', desc: 'Daha fazla düşün, daha fazla keyif.' },
  hard: { lib: 'mci', icon: 'crown', color: '#F43F5E', bg: '#FFE1E6', desc: 'Gerçek bulmaca severler için.' },
  expert: { lib: 'ion', icon: 'diamond', color: '#0EA5E9', bg: '#D7F0FB', desc: 'Sınırlarını zorla.' },
};

export function LevelIcon({ level, size = 44 }) {
  const info = LEVEL_INFO[level];
  const Icon = info.lib === 'mci' ? MaterialCommunityIcons : Ionicons;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: info.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={info.icon} size={Math.round(size * 0.5)} color={info.color} />
    </View>
  );
}

// ---------- Ortak parçalar ----------
export function Header({ title, subtitle, onBack, right }) {
  const { c } = useTheme();
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 36 }}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12}>
            <Ionicons name="chevron-back" size={26} color={c.text} />
          </Pressable>
        ) : (
          <View />
        )}
        {right || <View />}
      </View>
      <Text style={{ fontSize: 26, fontWeight: '800', color: c.text, marginTop: 6 }}>{title}</Text>
      {subtitle ? <Text style={{ fontSize: 14, color: c.sub, marginTop: 4 }}>{subtitle}</Text> : null}
    </View>
  );
}

export function Btn({ label, onPress, icon, variant = 'primary', style, disabled }) {
  const { c } = useTheme();
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          height: 54,
          borderRadius: 27,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: primary ? c.primary : c.card,
          borderWidth: primary ? 0 : 1,
          borderColor: c.border,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {icon ? (
        <Ionicons name={icon} size={20} color={primary ? '#fff' : c.text} style={{ marginRight: 8 }} />
      ) : null}
      <Text style={{ fontSize: 17, fontWeight: '700', color: primary ? '#fff' : c.text }}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style, onPress }) {
  const { c } = useTheme();
  const base = {
    backgroundColor: c.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: c.border,
    padding: 16,
  };
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={[base, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}

const TABS = [
  { key: 'home', label: 'Ana Sayfa', icon: 'home' },
  { key: 'play', label: 'Oyun', icon: 'game-controller' },
  { key: 'stats', label: 'İstatistikler', icon: 'stats-chart' },
  { key: 'profile', label: 'Profil', icon: 'person' },
];

export function TabBar({ active, onTab }) {
  const { c } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: c.tab,
        borderTopWidth: 1,
        borderTopColor: c.border,
        paddingTop: 8,
        paddingBottom: 6,
      }}
    >
      {TABS.map((t) => {
        const on = active === t.key;
        return (
          <Pressable key={t.key} onPress={() => onTab(t.key)} style={{ flex: 1, alignItems: 'center' }}>
            <Ionicons name={on ? t.icon : `${t.icon}-outline`} size={24} color={on ? c.primary : c.sub} />
            <Text style={{ fontSize: 11, marginTop: 2, color: on ? c.primary : c.sub, fontWeight: on ? '700' : '500' }}>
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------- İsim girme penceresi ----------
export function NameModal({ visible, title, subtitle, initial, confirmLabel = 'Devam', onSave, onCancel }) {
  const { c } = useTheme();
  const [text, setText] = useState(initial || '');

  useEffect(() => {
    if (visible) setText(initial || '');
  }, [visible, initial]);

  const name = text.trim();

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View style={styles.modalBg}>
        <View style={{ backgroundColor: c.card, borderRadius: 24, padding: 22, width: '100%' }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: c.text, textAlign: 'center' }}>{title}</Text>
          {subtitle ? (
            <Text style={{ fontSize: 13, color: c.sub, textAlign: 'center', marginTop: 6 }}>{subtitle}</Text>
          ) : null}
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Adın"
            placeholderTextColor={c.sub}
            maxLength={20}
            autoFocus
            style={{
              marginTop: 16,
              height: 50,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: c.border,
              paddingHorizontal: 14,
              fontSize: 16,
              color: c.text,
              backgroundColor: c.bg,
            }}
          />
          <Btn
            label={confirmLabel}
            onPress={() => name && onSave(name)}
            disabled={!name}
            style={{ marginTop: 16 }}
          />
          {onCancel ? (
            <Pressable onPress={onCancel} style={{ alignItems: 'center', marginTop: 14 }}>
              <Text style={{ color: c.sub, fontSize: 15 }}>Vazgeç</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(8,20,60,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
});
