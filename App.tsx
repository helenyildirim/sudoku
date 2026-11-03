import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, BackHandler, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { DARK, LIGHT, ThemeContext } from './src/theme';
import { TabBar, type TabKey } from './src/ui';
import ErrorBoundary from './src/ErrorBoundary';
import { autoNotes, generatePuzzle, type Level } from './src/game/sudoku';
import { recordResult } from './src/game/progress';
import { seedFromKey, todayKey } from './src/dates';
import {
  DEFAULT_DAILY,
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  clearGame,
  clearProfile,
  loadAll,
  loadGame,
  saveDaily,
  saveProfile,
  saveSettings,
  saveStats,
} from './src/storage';

import Welcome from './src/screens/Welcome';
import Setup from './src/screens/Setup';
import Home from './src/screens/Home';
import Difficulty from './src/screens/Difficulty';
import Game from './src/screens/Game';
import Daily from './src/screens/Daily';
import Stats from './src/screens/Stats';
import Profile from './src/screens/Profile';
import Settings from './src/screens/Settings';
import Tutorial from './src/screens/Tutorial';
import Legal, { type LegalKind } from './src/screens/Legal';
import type { DailyData, GameMode, GameOutcome, Profile as ProfileData, SavedGame, Settings as SettingsData, Stats as StatsData } from './src/types';

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <Root />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

// Alt çubuğu olan ekranlar ve hangi sekmeyi yaktıkları
const TAB_OF: Partial<Record<Screen, TabKey>> = { home: 'home', difficulty: 'play', stats: 'stats', profile: 'profile' };

type Screen =
  | 'boot'
  | 'welcome'
  | 'splash'
  | 'setup'
  | 'home'
  | 'tutorial'
  | 'difficulty'
  | 'generating'
  | 'game'
  | 'daily'
  | 'stats'
  | 'profile'
  | 'settings'
  | 'legal';

function Root() {
  const [screen, setScreen] = useState<Screen>('boot');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<StatsData>(DEFAULT_STATS);
  const [daily, setDaily] = useState<DailyData>(DEFAULT_DAILY);
  const [saved, setSaved] = useState<SavedGame | null>(null);
  const [savedDaily, setSavedDaily] = useState<SavedGame | null>(null);
  const [game, setGame] = useState<SavedGame | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [legal, setLegal] = useState<LegalKind>('privacy');

  // Açılışta kayıtlı verileri yükle
  useEffect(() => {
    (async () => {
      const d = await loadAll();
      setProfile(d.profile);
      setSettings(d.settings);
      setStats(d.stats);
      setDaily(d.daily);
      setSaved(d.game);
      if (d.dailyGame && d.dailyGame.dateKey === todayKey()) {
        setSavedDaily(d.dailyGame);
      } else if (d.dailyGame) {
        clearGame('daily');
      }
      // İlk açılışta karşılama + isim ekranı, sonrakilerde kısa açılış ekranı
      setScreen(d.profile ? 'splash' : 'welcome');
    })();
  }, []);

  useEffect(() => {
    if (screen !== 'splash') return;
    // Hiç ders almamış oyuncuya eğitimi bir kere otomatik göster
    const first = !(settings.lessons && Object.keys(settings.lessons).length) && !settings.lessonsSeen;
    const t = setTimeout(() => {
      if (first) changeSettings({ lessonsSeen: true });
      setScreen(first ? 'tutorial' : 'home');
    }, 1500);
    return () => clearTimeout(t);
  }, [screen]);

  // Android geri tuşu
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'home' || screen === 'splash' || screen === 'welcome' || screen === 'boot') return false;
      if (screen === 'setup') {
        setScreen('welcome');
        return true;
      }
      if (screen === 'game') {
        exitGame();
        return true;
      }
      setScreen(screen === 'legal' ? 'settings' : 'home');
      return true;
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const c = settings.theme === 'dark' ? DARK : LIGHT;
  const themeValue = useMemo(() => ({ c, boardColor: settings.boardColor }), [c, settings.boardColor]);

  const changeSettings = (patch: Partial<SettingsData>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  };

  const finishSetup = (name: string) => {
    const p = { name };
    setProfile(p);
    saveProfile(p);
    changeSettings({ lessonsSeen: true });
    setScreen('tutorial');
  };

  const updateName = (name: string) => {
    const p = { ...profile, name };
    setProfile(p);
    saveProfile(p);
  };

  const logout = async () => {
    await clearProfile();
    setProfile(null);
    setScreen('welcome');
  };

  const startGame = (level: Level, mode: GameMode = 'normal') => {
    // Zor bulmacalar yavaş telefonda zaman alabilir: önce yükleme ekranı çizilsin
    setScreen('generating');
    setTimeout(() => {
      const key = todayKey();
      const seed = mode === 'daily' ? seedFromKey(key) : null;
      const { puzzle, solution } = generatePuzzle(level, seed);
      const values = [...puzzle];
      setGame({
        level,
        puzzle,
        solution,
        mode,
        dateKey: mode === 'daily' ? key : null,
        values,
        notes: settings.autoNotes ? autoNotes(values) : Array(81).fill(0),
        mistakes: 0,
        hints: 0,
        seconds: 0,
        status: 'play',
      });
      setGameKey((k) => k + 1);
      setScreen('game');
    }, 30);
  };

  const openDaily = () => {
    if (savedDaily && savedDaily.dateKey === todayKey()) {
      setGame(savedDaily);
      setGameKey((k) => k + 1);
      setScreen('game');
    } else {
      startGame('medium', 'daily');
    }
  };

  const reloadSaved = async () => {
    const [normal, today] = await Promise.all([loadGame('normal'), loadGame('daily')]);
    setSaved(normal);
    setSavedDaily(today);
  };

  const resume = () => {
    if (!saved) return;
    setGame(saved);
    setGameKey((k) => k + 1);
    setScreen('game');
  };

  const exitGame = async () => {
    await reloadSaved();
    setScreen('home');
  };

  const changeLevel = async () => {
    await reloadSaved();
    setScreen('difficulty');
  };

  // Oyun bitince istatistik, günlük seri ve başarımları güncelle
  const handleFinish = async (res: GameOutcome) => {
    const next = recordResult(stats, daily, res);
    if (next.daily !== daily) {
      setDaily(next.daily);
      await saveDaily(next.daily);
    }
    setStats(next.stats);
    await saveStats(next.stats);
    return { newly: next.newly, record: next.record };
  };

  if (screen === 'boot') {
    return <View style={{ flex: 1, backgroundColor: '#F4F9FF' }} />;
  }

  // Tam ekran açılış görselleri
  if (screen === 'welcome' || screen === 'splash') {
    return (
      <ThemeContext.Provider value={themeValue}>
        <StatusBar style="dark" />
        <Welcome showStart={screen === 'welcome'} onStart={() => setScreen('setup')} />
      </ThemeContext.Provider>
    );
  }

  let body = null;
  switch (screen) {
    case 'setup':
      body = <Setup onDone={finishSetup} />;
      break;
    case 'home':
      body = (
        <Home
          profile={profile}
          saved={saved}
          daily={daily}
          lessonsDone={Object.keys(settings.lessons || {}).length}
          onLearn={() => setScreen('tutorial')}
          onNewGame={() => setScreen('difficulty')}
          onResume={resume}
          onDaily={() => setScreen('daily')}
          onStats={() => setScreen('stats')}
          onProfile={() => setScreen('profile')}
          onSettings={() => setScreen('settings')}
        />
      );
      break;
    case 'tutorial':
      body = (
        <Tutorial
          done={settings.lessons || {}}
          onBack={() => setScreen('home')}
          onComplete={(id) => changeSettings({ lessons: { ...(settings.lessons || {}), [id]: true } })}
          onPlay={() => setScreen('difficulty')}
        />
      );
      break;
    case 'difficulty':
      body = <Difficulty onBack={() => setScreen('home')} onStart={(lv) => startGame(lv)} />;
      break;
    case 'game':
      body = game ? (
        <Game
          key={gameKey}
          initial={game}
          settings={settings}
          onExit={exitGame}
          onFinish={handleFinish}
          onChangeLevel={changeLevel}
        />
      ) : null;
      break;
    case 'daily':
      body = <Daily daily={daily} onBack={() => setScreen('home')} onPlay={openDaily} />;
      break;
    case 'stats':
      body = <Stats stats={stats} daily={daily} />;
      break;
    case 'profile':
      body = (
        <Profile
          profile={profile}
          stats={stats}
          theme={settings.theme}
          onEditName={updateName}
          onToggleTheme={() => changeSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
          onLogout={logout}
        />
      );
      break;
    case 'settings':
      body = (
        <Settings
          settings={settings}
          onChange={changeSettings}
          onBack={() => setScreen('home')}
          onLegal={(k) => {
            setLegal(k);
            setScreen('legal');
          }}
        />
      );
      break;
    case 'generating':
      body = (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={c.primary} />
          <Text style={{ marginTop: 14, fontSize: 15, color: c.sub }}>Bulmaca hazırlanıyor...</Text>
        </View>
      );
      break;
    case 'legal':
      body = <Legal kind={legal} onBack={() => setScreen('settings')} />;
      break;
    default:
      body = null;
  }

  const tab = TAB_OF[screen];
  const onTab = (key: TabKey) => setScreen(key === 'play' ? 'difficulty' : key);

  return (
    <ThemeContext.Provider value={themeValue}>
      <StatusBar style={c.dark ? 'light' : 'dark'} />
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={['top', 'bottom']}>
        <View style={{ flex: 1 }}>{body}</View>
        {tab ? <TabBar active={tab} onTab={onTab} /> : null}
      </SafeAreaView>
    </ThemeContext.Provider>
  );
}
