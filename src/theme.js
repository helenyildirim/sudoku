import { createContext, useContext } from 'react';

export const LIGHT = {
  dark: false,
  bg: '#F2F7FF',
  card: '#FFFFFF',
  text: '#0F1F4D',
  sub: '#6B7A99',
  primary: '#1F6BF5',
  primarySoft: '#E3EEFF',
  border: '#E1E8F5',
  line: '#0F1F4D',
  lineSoft: '#C7D3EA',
  cell: '#FFFFFF',
  wrong: '#DC2626',
  wrongBg: '#FEE2E2',
  tab: '#FFFFFF',
  success: '#10B981',
  gradient: ['#DCEBFF', '#F2F7FF', '#FFFFFF'],
};

export const DARK = {
  dark: true,
  bg: '#0B1530',
  card: '#15244B',
  text: '#EAF1FF',
  sub: '#8FA2C9',
  primary: '#3B82F6',
  primarySoft: '#1C2E5E',
  border: '#243768',
  line: '#8FB0F0',
  lineSoft: '#2B417C',
  cell: '#101D3F',
  wrong: '#F87171',
  wrongBg: '#4B1F2C',
  tab: '#101C3D',
  success: '#34D399',
  gradient: ['#0B1530', '#0D1A3B', '#0B1530'],
};

// Ayarlar > Tahta Rengi
export const BOARD_COLORS = ['#1F6BF5', '#38BDF8', '#14B8A6', '#8B5CF6', '#F59E0B'];

export const ThemeContext = createContext({ c: LIGHT, boardColor: BOARD_COLORS[0] });
export const useTheme = () => useContext(ThemeContext);

export const LEVELS = { easy: 'Kolay', medium: 'Orta', hard: 'Zor', expert: 'Uzman' };
