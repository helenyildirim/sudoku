import * as Haptics from 'expo-haptics';

// Titreşim ayarı kapalıysa hiçbir şey yapmaz; hata verirse sessizce geçer
export const tap = (on) => on && Haptics.selectionAsync().catch(() => {});
export const good = (on) => on && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
export const bad = (on) => on && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
