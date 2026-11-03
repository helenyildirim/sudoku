import * as Haptics from 'expo-haptics';

// Titreşim ayarı kapalıysa hiçbir şey yapmaz; hata verirse sessizce geçer
export const tap = (on: boolean) => on && Haptics.selectionAsync().catch(() => {});
export const good = (on: boolean) => on && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
export const bad = (on: boolean) => on && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
