import { UserProfile, WordItem, WordStat, ThemeColor } from '../types';
import { GRADE_3_WORDS } from '../data/grade3Words';
import { syncUserToFirestore, fetchUserFromFirestore } from './firebase';

const USER_PROFILE_KEY = 'flashcard_pro_g3_user_profile';
const LAST_SEAT_KEY = 'flashcard_pro_g3_last_seat';
const CUSTOM_WORDS_KEY = 'flashcard_pro_g3_words_v1';

const getSeatKey = (seat: string) => `flashcard_pro_g3_user_profile_${seat}`;

export function createDefaultProfile(seatNumber: string = '01', classCode: string = '三年級'): UserProfile {
  const isGuest = seatNumber === '訪客';
  return {
    seatNumber,
    classCode,
    themeColor: 'emerald',
    unlockedLevel: isGuest ? 8 : 1, // 訪客模式預設解鎖全部關卡方便完整試用
    lastActive: new Date().toISOString(),
    streakDays: 1,
    stars: 0,
    progress: {
      level1: { completed: false, masteryRate: 0, starsEarned: 0 },
    },
    wordStats: {},
  };
}

export function getLocalProfileForSeat(seatNumber: string): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const seatKey = getSeatKey(seatNumber);
  const rawSeat = localStorage.getItem(seatKey);
  if (rawSeat) {
    try {
      return JSON.parse(rawSeat);
    } catch {
      // ignore
    }
  }
  const rawGlobal = localStorage.getItem(USER_PROFILE_KEY);
  if (rawGlobal) {
    try {
      const parsed = JSON.parse(rawGlobal);
      if (parsed && parsed.seatNumber === seatNumber) {
        return parsed;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export function getLocalProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const lastSeat = localStorage.getItem(LAST_SEAT_KEY);
  if (lastSeat) {
    const profile = getLocalProfileForSeat(lastSeat);
    if (profile) return profile;
  }
  const raw = localStorage.getItem(USER_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveLocalProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  const seatKey = getSeatKey(profile.seatNumber);
  localStorage.setItem(seatKey, JSON.stringify(profile));
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  localStorage.setItem(LAST_SEAT_KEY, profile.seatNumber);
  // 同步給 Firestore (若有設定 Firebase)，訪客不寫入雲端排行榜
  if (profile.seatNumber !== '訪客') {
    syncUserToFirestore(profile).catch(() => {});
  }
}

export function loadUserProfileSync(seatNumber: string): UserProfile {
  const local = getLocalProfileForSeat(seatNumber);
  if (local) {
    const updated = updateStreakDays(local);
    saveLocalProfile(updated);
    return updated;
  }
  const newProfile = createDefaultProfile(seatNumber);
  saveLocalProfile(newProfile);
  return newProfile;
}

export function mergeUserProfiles(local: UserProfile, remote: UserProfile): UserProfile {
  if (!local) return remote;
  if (!remote) return local;

  const unlockedLevel = Math.max(local.unlockedLevel || 1, remote.unlockedLevel || 1);
  const stars = Math.max(local.stars || 0, remote.stars || 0);
  const streakDays = Math.max(local.streakDays || 1, remote.streakDays || 1);

  // 合併 progress
  const mergedProgress = { ...(local.progress || {}) };
  if (remote.progress) {
    Object.keys(remote.progress).forEach((lvlKey) => {
      const lProg = local.progress?.[lvlKey];
      const rProg = remote.progress[lvlKey];
      if (!lProg) {
        mergedProgress[lvlKey] = rProg;
      } else {
        mergedProgress[lvlKey] = {
          completed: lProg.completed || rProg.completed,
          masteryRate: Math.max(lProg.masteryRate, rProg.masteryRate),
          starsEarned: Math.max(lProg.starsEarned, rProg.starsEarned),
          lastStudied: lProg.lastStudied || rProg.lastStudied,
        };
      }
    });
  }

  // 合併 wordStats (取較高萊特納箱位與較多正確次數)
  const mergedWordStats: Record<string, WordStat> = { ...(local.wordStats || {}) };
  if (remote.wordStats) {
    Object.keys(remote.wordStats).forEach((wid) => {
      const lStat = local.wordStats?.[wid];
      const rStat = remote.wordStats[wid];
      if (!lStat) {
        mergedWordStats[wid] = rStat;
      } else {
        mergedWordStats[wid] = {
          level: (lStat.box >= rStat.box ? lStat.level : rStat.level),
          box: Math.max(lStat.box, rStat.box),
          reviewCount: Math.max(lStat.reviewCount, rStat.reviewCount),
          correctCount: Math.max(lStat.correctCount, rStat.correctCount),
          wrongCount: Math.max(lStat.wrongCount, rStat.wrongCount),
          lastInterval: Math.max(lStat.lastInterval, rStat.lastInterval),
          nextReviewDate: lStat.nextReviewDate || rStat.nextReviewDate,
          lastReviewedAt: lStat.lastReviewedAt || rStat.lastReviewedAt,
        };
      }
    });
  }

  const lastActive = (local.lastActive && remote.lastActive)
    ? (new Date(local.lastActive) > new Date(remote.lastActive) ? local.lastActive : remote.lastActive)
    : (local.lastActive || remote.lastActive || new Date().toISOString());

  return {
    ...local,
    ...remote,
    seatNumber: local.seatNumber || remote.seatNumber,
    classCode: local.classCode || remote.classCode || '三年級',
    themeColor: local.themeColor || remote.themeColor || 'emerald',
    unlockedLevel,
    stars,
    streakDays,
    progress: mergedProgress,
    wordStats: mergedWordStats,
    lastActive,
  };
}

export async function loadUserProfile(seatNumber: string): Promise<UserProfile> {
  const profile = loadUserProfileSync(seatNumber);
  if (seatNumber !== '訪客') {
    fetchUserFromFirestore(seatNumber)
      .then((remote) => {
        if (remote) {
          const merged = mergeUserProfiles(profile, remote);
          const updated = updateStreakDays(merged);
          saveLocalProfile(updated);
        }
      })
      .catch(() => {});
  }
  return profile;
}

function updateStreakDays(profile: UserProfile): UserProfile {
  const last = new Date(profile.lastActive);
  const now = new Date();

  const isSameDay =
    last.getFullYear() === now.getFullYear() &&
    last.getMonth() === now.getMonth() &&
    last.getDate() === now.getDate();

  if (isSameDay) {
    return { ...profile, lastActive: now.toISOString() };
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    last.getFullYear() === yesterday.getFullYear() &&
    last.getMonth() === yesterday.getMonth() &&
    last.getDate() === yesterday.getDate();

  const newStreak = isYesterday ? profile.streakDays + 1 : 1;

  return {
    ...profile,
    streakDays: newStreak,
    lastActive: now.toISOString(),
  };
}

// 取得全冊單字庫
export function getCustomWords(): WordItem[] {
  if (typeof window === 'undefined') return GRADE_3_WORDS;
  const raw = localStorage.getItem(CUSTOM_WORDS_KEY);
  if (!raw) {
    saveCustomWords(GRADE_3_WORDS);
    return GRADE_3_WORDS;
  }
  try {
    const parsed: WordItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveCustomWords(GRADE_3_WORDS);
      return GRADE_3_WORDS;
    }
    // 自動無損合併預設最新單字庫
    const wordMap = new Map<string, WordItem>();
    GRADE_3_WORDS.forEach((w) => wordMap.set(w.id, w));
    parsed.forEach((w) => {
      wordMap.set(w.id, { ...(wordMap.get(w.id) || {}), ...w });
    });
    const merged = Array.from(wordMap.values());
    localStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    saveCustomWords(GRADE_3_WORDS);
    return GRADE_3_WORDS;
  }
}

export function saveCustomWords(words: WordItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(words));
}

export function resetCustomWordsToDefault(): WordItem[] {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CUSTOM_WORDS_KEY);
  }
  saveCustomWords(GRADE_3_WORDS);
  return GRADE_3_WORDS;
}

export function mergeCustomWords(newWords: WordItem[]): WordItem[] {
  const currentWords = getCustomWords();
  const wordMap = new Map<string, WordItem>();

  currentWords.forEach((w) => wordMap.set(w.id, w));
  newWords.forEach((w) => {
    if (wordMap.has(w.id)) {
      wordMap.set(w.id, { ...wordMap.get(w.id)!, ...w });
    } else {
      wordMap.set(w.id, w);
    }
  });

  const merged = Array.from(wordMap.values());
  saveCustomWords(merged);
  return merged;
}
