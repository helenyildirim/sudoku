import React, { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Board } from '../components/Board';
import { HintCard, NumberPad, Tool } from '../components/GameControls';
import { PauseMenu, ResultCard } from '../components/GameOverlays';
import { fmtTime } from '../dates';
import {
  MAX_HINTS,
  MAX_MISTAKES,
  eraseCell,
  isLocked,
  isSolved,
  placeValue,
  remaining,
  toggleNote,
  type BoardState,
} from '../game/session';
import { autoNotes, findHint, type Hint } from '../game/sudoku';
import { bad, good, tap } from '../haptics';
import { clearGame, saveGame } from '../storage';
import { LEVELS, useTheme } from '../theme';
import type { FinishResult, GameOutcome, GameStatus, SavedGame, Settings } from '../types';

type Props = {
  initial: SavedGame;
  settings: Settings;
  onExit: () => void;
  onFinish: (outcome: GameOutcome) => Promise<FinishResult>;
  onChangeLevel: () => void;
};

export default function Game({ initial, settings, onExit, onFinish, onChangeLevel }: Props) {
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
  const [status, setStatus] = useState<GameStatus>(initial.status);
  const [selected, setSelected] = useState<number | null>(null);
  const [notesMode, setNotesMode] = useState(false);
  const [history, setHistory] = useState<BoardState[]>([]);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<FinishResult | null>(null);
  const [hintInfo, setHintInfo] = useState<Hint | null>(null);
  const finishedRef = useRef(false);

  const currentState = (): SavedGame => ({
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

  const applyMove = (next: BoardState) => {
    setValues(next.values);
    setNotes(next.notes);
  };

  const completeMove = (next: BoardState) => {
    applyMove(next);
    if (isSolved(next.values, solution)) {
      good(settings.haptics);
      setStatus('won');
    } else tap(settings.haptics);
  };

  const input = (n: number) => {
    if (!canPlay || selected == null || isLocked(puzzle, values, solution, selected)) return;
    if (notesMode) {
      if (values[selected] !== 0) return;
      snapshot();
      setNotes(toggleNote(notes, selected, n));
      return;
    }
    snapshot();
    const correct = n === solution[selected];
    const next = placeValue({ values, notes }, selected, n, correct);
    if (correct) {
      completeMove(next);
    } else {
      applyMove(next);
      bad(settings.haptics);
      const m = mistakes + 1;
      setMistakes(m);
      if (m >= MAX_MISTAKES) setStatus('lost');
    }
  };

  const erase = () => {
    if (!canPlay || selected == null || isLocked(puzzle, values, solution, selected)) return;
    if (values[selected] === 0 && notes[selected] === 0) return;
    snapshot();
    applyMove(eraseCell({ values, notes }, selected));
  };

  const undo = () => {
    if (!canPlay || history.length === 0) return;
    applyMove(history[history.length - 1]);
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
    const { cell: target, value } = hintInfo;
    snapshot();
    setSelected(target);
    completeMove(placeValue({ values, notes }, target, value, true));
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

  const leave = async (fn: () => void) => {
    if (status === 'play') await saveGame(currentState());
    fn();
  };

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

        {hintInfo ? <HintCard hintInfo={hintInfo} onClose={() => setHintInfo(null)} onApply={applyHint} /> : null}

        <NumberPad
          padW={padW}
          remaining={(n) => remaining(values, solution, n)}
          onInput={input}
          onErase={erase}
        />
      </ScrollView>

      {paused && status === 'play' ? (
        <PauseMenu
          onResume={() => setPaused(false)}
          onRestart={restart}
          onChangeLevel={() => leave(onChangeLevel)}
          onHome={() => leave(onExit)}
        />
      ) : null}

      {status !== 'play' ? (
        <ResultCard
          status={status}
          seconds={seconds}
          result={result}
          onNewGame={onChangeLevel}
          onRestart={restart}
          onHome={onExit}
        />
      ) : null}
    </View>
  );
}
