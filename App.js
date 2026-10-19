import React, { useEffect, useMemo, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { DARK, LIGHT, ThemeContext } from './src/theme';
import { TabBar } from './src/ui';
import { autoNotes, generatePuzzle } from './sudoku';
import { ACHIEVEMENTS } from './src/achievements';
import { longestStreak, seedFromKey, todayKey } from './src/dates';
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
import Legal from './src/screens/Legal';

export default function App() {
  return (
    <SafeAreaProvider>
      <Root />
    </SafeAreaProvider>
  );
}

// Alt çubuğu olan ekranlar ve hangi sekmeyi yaktıkları
const TAB_OF = { home: 'home', difficulty: 'play', stats: 'stats', profile: 'profile' };

function Root() {
  const [screen, setScreen] = useState('boot');
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [daily, setDaily] = useState(DEFAULT_DAILY);
  const [saved, setSaved] = useState(null);
  const [game, setGame] = useState(null);
  const [gameKey, setGameKey] = useState(0);
  const [legal, setLegal] = useState('privacy');

  // Açılışta kayıtlı verileri yükle
  useEffect(() => {
    (async () => {
      const d = await loadAll();
      setProfile(d.profile);
      setSettings(d.settings);
      setStats(d.stats);
      setDaily(d.daily);
      let g = d.game;
      if (g && g.mode === 'daily' && g.dateKey !== todayKey()) {
        g = null;
        clearGame();
      }
      setSaved(g);
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

  const changeSettings = (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  };

  const finishSetup = (name) => {
    const p = { name };
    setProfile(p);
    saveProfile(p);
    changeSettings({ lessonsSeen: true });
    setScreen('tutorial');
  };

  const updateName = (name) => {
    const p = { ...(profile || {}), name };
    setProfile(p);
    saveProfile(p);
  };

  const logout = async () => {
    await clearProfile();
    setProfile(null);
    setScreen('welcome');
  };

  const startGame = (level, mode = 'normal') => {
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
  };

  const resume = () => {
    if (!saved) return;
    setGame(saved);
    setGameKey((k) => k + 1);
    setScreen('game');
  };

  const exitGame = async () => {
    setSaved(await loadGame());
    setScreen('home');
  };

  const changeLevel = async () => {
    setSaved(await loadGame());
    setScreen('difficulty');
  };

  // Oyun bitince istatistik, günlük seri ve başarımları güncelle
  const handleFinish = async (res) => {
    const st = JSON.parse(JSON.stringify(stats));
    const lv = st.levels[res.level];
    const prevBest = lv.best;
    st.played += 1;
    lv.played += 1;
    if (res.won) {
      st.won += 1;
      lv.won += 1;
      if (st.bestTime == null || res.seconds < st.bestTime) st.bestTime = res.seconds;
      if (lv.best == null || res.seconds < lv.best) lv.best = res.seconds;
    }

    let nd = daily;
    if (res.won && res.mode === 'daily' && res.dateKey) {
      nd = { ...daily, done: { ...daily.done, [res.dateKey]: { seconds: res.seconds } } };
      setDaily(nd);
      await saveDaily(nd);
    }

    const ctx = {
      ...res,
      longest: longestStreak(nd.done),
      dailyCount: Object.keys(nd.done).length,
    };
    const newly = ACHIEVEMENTS.filter((a) => !st.unlocked[a.id] && a.check(st, ctx)).map((a) => a.id);
    newly.forEach((id) => {
      st.unlocked[id] = true;
    });
    setStats(st);
    await saveStats(st);
    return { newly, record: res.won && (prevBest == null || res.seconds < prevBest) };
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
      body = (
        <Game
          key={gameKey}
          initial={game}
          settings={settings}
          onExit={exitGame}
          onFinish={handleFinish}
          onChangeLevel={changeLevel}
        />
      );
      break;
    case 'daily':
      body = <Daily daily={daily} onBack={() => setScreen('home')} onPlay={() => startGame('medium', 'daily')} />;
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
    case 'legal':
      body = <Legal kind={legal} onBack={() => setScreen('settings')} />;
      break;
    default:
      body = null;
  }

  const tab = TAB_OF[screen];
  const onTab = (key) => {
    if (key === 'home') setScreen('home');
    else if (key === 'play') setScreen('difficulty');
    else if (key === 'stats') setScreen('stats');
    else if (key === 'profile') setScreen('profile');
  };

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
