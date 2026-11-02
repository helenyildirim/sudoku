import React, { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LEVELS, useTheme } from '../theme';
import { autoNotes, cellName, findHint, isPeer } from '../../sudoku';
import { clearGame, saveGame } from '../storage';
import { fmtTime } from '../dates';
import { Btn } from '../ui';
import { ACHIEVEMENT_BY_ID } from '../achievements';
import { bad, good, tap } from '../haptics';

const MAX_MISTAKES = 3;
const MAX_HINTS = 3;

// Tahta ayrı bir bileşen: süre her saniye değişse de tahta yeniden çizilmez
const Board = React.memo(function Board({ values, notes, puzzle, solution, selected, onSelect, cell, c, boardColor, hintArea, hintCell }) {
  const selVal = selected != null ? values[selected] : 0;
  return (
    <View
      style={{
        width: cell * 9 + 4,
        height: cell * 9 + 4,
        borderWidth: 2,
        borderColor: c.line,
        borderRadius: 8,
        overflow: 'hidden',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'center',
        backgroundColor: c.cell,
      }}
    >
      {values.map((v, i) => {
        const r = Math.floor(i / 9);
        const col = i % 9;
        const isGiven = puzzle[i] !== 0;
        const isWrong = v !== 0 && v !== solution[i];
        let bg = c.cell;
        if (selected != null) {
          if (isPeer(selected, i)) bg = boardColor + '14';
          if (selVal !== 0 && v === selVal) bg = boardColor + '30';
          if (i === selected) bg = boardColor + '45';
        }
        if (hintArea && hintArea.includes(i)) bg = '#F59E0B33';
        if (i === hintCell) bg = '#F59E0B77';
        if (isWrong) bg = c.wrongBg;
        const thickR = col % 3 === 2 && col !== 8;
        const thickB = r % 3 === 2 && r !== 8;
        return (
          <Pressable
            key={i}
            onPress={() => onSelect(i)}
            accessibilityRole="button"
            accessibilityLabel={`${cellName(i)}: ${v || 'boş'}`}
            style={{
              width: cell,
              height: cell,
              backgroundColor: bg,
              alignItems: 'center',
              justifyContent: 'center',
              borderRightWidth: col === 8 ? 0 : thickR ? 2 : 0.5,
              borderBottomWidth: r === 8 ? 0 : thickB ? 2 : 0.5,
              borderRightColor: thickR ? c.line : c.lineSoft,
              borderBottomColor: thickB ? c.line : c.lineSoft,
            }}
          >
            {v !== 0 ? (
              <Text
                style={{
                  fontSize: cell * 0.55,
                  fontWeight: isGiven ? '700' : '500',
                  color: isWrong ? c.wrong : isGiven ? c.text : boardColor,
                }}
              >
                {v}
              </Text>
            ) : notes[i] ? (
              <View style={{ width: cell, height: cell, flexDirection: 'row', flexWrap: 'wrap', padding: 1 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <View
                    key={n}
                    style={{
                      width: (cell - 2) / 3,
                      height: (cell - 2) / 3,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: cell * 0.24, color: c.sub }}>{notes[i] & (1 << n) ? n : ''}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
});

function Tool({ icon, label, onPress, active, disabled, badge }) {
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

function PauseItem({ icon, label, onPress, primary, outline }) {
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

export default function Game({ initial, settings, onExit, onFinish, onChangeLevel }) {
  const { c, boardColor } = useTheme();
  const { width } = useWindowDimensions();
  const cell = Math.floor(Math.min(width - 28, 430) / 9);
  const padW = Math.floor((Math.min(width, 480) - 40 - 4 * 10) / 5);

  const { level, puzzle, solution, mode, dateKey } = initial;
  const [values, setValues] = useState(initial.values);
  const [notes, setNotes] = useState(initial.notes);
  const [mistakes, setMistakes] = useState(initial.mistakes);
  const [hints, setHints] = useState(initial.hints);
  const [seconds, setSeconds] = useState(initial.seconds);
  const [status, setStatus] = useState(initial.status);
  const [selected, setSelected] = useState(null);
  const [notesMode, setNotesMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState(null);
  const [hintInfo, setHintInfo] = useState(null);
  const finishedRef = useRef(false);

  const currentState = () => ({
    level, puzzle, solution, mode, dateKey, values, notes, mistakes, hints, seconds, status,
  });

  // Süre: duraklatılınca ya da oyun bitince durur
  useEffect(() => {
    if (status !== 'play' || paused) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [status, paused]);

  // Uygulama arka plana gidince otomatik duraklat
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s !== 'active') setPaused(true);
    });
    return () => sub.remove();
  }, []);

  // Otomatik kayıt
  const secBucket = Math.floor(seconds / 5);
  useEffect(() => {
    if (status === 'play') saveGame(currentState());
    else clearGame(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, notes, mistakes, hints, status, secBucket]);

  // Oyun bitince sonucu kaydet
  useEffect(() => {
    if (status === 'play' || finishedRef.current) return;
    finishedRef.current = true;
    (async () => {
      const r = await onFinish({ won: status === 'won', level, seconds, mistakes, hints, mode, dateKey });
      setResult(r);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const snapshot = () => {
    setHintInfo(null);
    setHistory((h) => [...h.slice(-99), { values, notes }]);
  };
  const canPlay = status === 'play' && !paused;

  const afterPlace = (nv, nn, idx, n) => {
    for (let i = 0; i < 81; i++) if (isPeer(idx, i)) nn[i] &= ~(1 << n);
    setValues(nv);
    setNotes(nn);
    if (nv.every((v, i) => v === solution[i])) {
      good(settings.haptics);
      setStatus('won');
    } else tap(settings.haptics);
  };

  const input = (n) => {
    if (!canPlay || selected == null) return;
    if (puzzle[selected] !== 0 || values[selected] === solution[selected]) return;
    if (notesMode) {
      if (values[selected] !== 0) return;
      snapshot();
      const nn = [...notes];
      nn[selected] ^= 1 << n;
      setNotes(nn);
      return;
    }
    snapshot();
    const nv = [...values];
    nv[selected] = n;
    const nn = [...notes];
    nn[selected] = 0;
    if (n === solution[selected]) {
      afterPlace(nv, nn, selected, n);
    } else {
      setValues(nv);
      setNotes(nn);
      bad(settings.haptics);
      const m = mistakes + 1;
      setMistakes(m);
      if (m >= MAX_MISTAKES) setStatus('lost');
    }
  };

  const erase = () => {
    if (!canPlay || selected == null) return;
    if (puzzle[selected] !== 0 || values[selected] === solution[selected]) return;
    if (values[selected] === 0 && notes[selected] === 0) return;
    snapshot();
    const nv = [...values];
    nv[selected] = 0;
    const nn = [...notes];
    nn[selected] = 0;
    setValues(nv);
    setNotes(nn);
  };

  const undo = () => {
    if (!canPlay || history.length === 0) return;
    const last = history[history.length - 1];
    setValues(last.values);
    setNotes(last.notes);
    setHintInfo(null);
    setHistory((h) => h.slice(0, -1));
  };

  // Akıllı ipucu: nedenini açıklar ve ilgili hücreleri işaretler
  const hint = () => {
    if (!canPlay || hints >= MAX_HINTS) return;
    const h = findHint(values, solution);
    if (!h) return;
    setHintInfo(h);
    setSelected(h.cell);
    setHints(hints + 1);
  };

  const applyHint = () => {
    if (!hintInfo || !canPlay) return;
    const { cell, value } = hintInfo;
    snapshot();
    const nv = [...values];
    nv[cell] = value;
    const nn = [...notes];
    nn[cell] = 0;
    setSelected(cell);
    afterPlace(nv, nn, cell, value);
  };

  // Oto Not: tüm boş hücrelerin olası sayılarını doldurur
  const fillNotes = () => {
    if (!canPlay) return;
    snapshot();
    setNotes(autoNotes(values));
  };

  const restart = () => {
    const v = [...puzzle];
    setValues(v);
    setNotes(settings.autoNotes ? autoNotes(v) : Array(81).fill(0));
    setMistakes(0);
    setHints(0);
    setSeconds(0);
    setStatus('play');
    setHistory([]);
    setSelected(null);
    setNotesMode(false);
    setPaused(false);
    setResult(null);
    setHintInfo(null);
    finishedRef.current = false;
  };

  const leave = async (fn) => {
    if (status === 'play') await saveGame(currentState());
    fn();
  };

  const remaining = (n) => 9 - values.filter((v, i) => v === n && v === solution[i]).length;
  const title = mode === 'daily' ? 'Günlük Mücadele' : LEVELS[level];

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        {/* Üst çubuk */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 }}>
          <Pressable
            onPress={() => leave(onExit)}
            hitSlop={12}
            style={{ width: 44 }}
            accessibilityRole="button"
            accessibilityLabel="Oyundan çık"
          >
            <Ionicons name="chevron-back" size={26} color={c.text} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 19, fontWeight: '800', color: c.text }}>{title}</Text>
            <View
              style={{
                marginTop: 4,
                backgroundColor: c.primarySoft,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 3,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: c.primary, fontVariant: ['tabular-nums'] }}>
                {fmtTime(seconds)}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => setPaused(true)}
            hitSlop={8}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: c.primarySoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="pause" size={22} color={c.primary} />
          </Pressable>
        </View>

        <Text style={{ textAlign: 'center', color: c.sub, fontSize: 13, marginVertical: 10 }}>
          Hata: {mistakes}/{MAX_MISTAKES}
        </Text>

        <Board
          values={values}
          notes={notes}
          puzzle={puzzle}
          solution={solution}
          selected={selected}
          onSelect={setSelected}
          hintArea={hintInfo ? hintInfo.area : null}
          hintCell={hintInfo ? hintInfo.cell : null}
          cell={cell}
          c={c}
          boardColor={boardColor}
        />

        {/* Araçlar */}
        <View style={{ flexDirection: 'row', marginTop: 18, paddingHorizontal: 12 }}>
          <Tool icon="arrow-undo" label="Geri Al" onPress={undo} />
          <Tool icon="trash-outline" label="Temizle" onPress={erase} />
          <Tool icon="pencil" label="Kalem" active={notesMode} onPress={() => setNotesMode((x) => !x)} />
          <Tool icon="sparkles-outline" label="Oto Not" onPress={fillNotes} />
          <Tool icon="bulb-outline" label="İpucu" badge={MAX_HINTS - hints} disabled={hints >= MAX_HINTS} onPress={hint} />
        </View>

        {hintInfo ? (
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
              <Btn label="Kapat" variant="outline" onPress={() => setHintInfo(null)} style={{ flex: 1, height: 44, marginRight: 8 }} />
              <Btn label="Yerleştir" onPress={applyHint} style={{ flex: 1, height: 44 }} />
            </View>
          </View>
        ) : null}

        {/* Sayı tuşları */}
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
                onPress={() => input(n)}
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
            onPress={erase}
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
      </ScrollView>

      {/* Duraklatma menüsü */}
      {paused && status === 'play' ? (
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
            <PauseItem icon="play" label="Devam Et" primary onPress={() => setPaused(false)} />
            <PauseItem icon="refresh" label="Yeniden Başla" onPress={restart} />
            <PauseItem icon="swap-horizontal" label="Zorluk Değiştir" onPress={() => leave(onChangeLevel)} />
            <PauseItem icon="home" label="Ana Menü" onPress={() => leave(onExit)} />
            <View style={{ height: 10 }} />
            <PauseItem icon="close" label="Kapat" outline onPress={() => setPaused(false)} />
          </View>
        </View>
      ) : null}

      {/* Oyun sonu */}
      {status !== 'play' ? (
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
              onPress={status === 'won' ? onChangeLevel : restart}
              style={{ marginTop: 18 }}
            />
            <Btn label="Ana Menü" variant="outline" onPress={onExit} style={{ marginTop: 10 }} />
          </View>
        </View>
      ) : null}
    </View>
  );
}
