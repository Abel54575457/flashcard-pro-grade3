import { UserProfile, WordItem } from '../types';
import { calculateMasteryRate } from './spacedRepetition';

const SHEETS_URL_KEY = 'flashcard_pro_g3_sheets_url';

// 預設留空或讀取本機快取
export function getSavedSheetsUrl(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(SHEETS_URL_KEY) || '';
}

export function saveSheetsUrl(url: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SHEETS_URL_KEY, url.trim());
}

/**
 * 格式化單一學生資訊為試算表資料載荷
 */
function buildStudentPayload(profile: UserProfile, words: WordItem[]) {
  const allWordIds = words.map((w) => w.id);
  const masteryRate = calculateMasteryRate(allWordIds, profile.wordStats || {});

  // 整理 8 個單元的各自通關狀態
  const unitsSummary: Record<string, string> = {};
  for (let i = 1; i <= 8; i++) {
    const key = `level${i}`;
    const p = profile.progress?.[key];
    if (!p) {
      unitsSummary[`Unit${i}`] = i === 1 ? '學習中' : '未解鎖';
    } else if (p.completed) {
      unitsSummary[`Unit${i}`] = `已通關 (${p.masteryRate || 100}%)`;
    } else if (p.masteryRate > 0) {
      unitsSummary[`Unit${i}`] = `進行中 (${p.masteryRate}%)`;
    } else {
      unitsSummary[`Unit${i}`] = '未開始';
    }
  }

  return {
    seatNumber: profile.seatNumber,
    classCode: profile.classCode || '三年級',
    stars: profile.stars || 0,
    unlockedLevel: profile.unlockedLevel || 1,
    masteryRate: Math.round(masteryRate),
    streakDays: profile.streakDays || 1,
    lastActive: profile.lastActive || new Date().toISOString(),
    unitsSummary,
  };
}

/**
 * 同步單一學生成績至 Google 試算表（非同步背景發送，不阻礙畫面）
 */
export async function syncStudentToGoogleSheets(
  profile: UserProfile,
  words: WordItem[]
): Promise<boolean> {
  const url = getSavedSheetsUrl();
  if (!url || profile.seatNumber === '訪客') return false;

  try {
    const payload = {
      action: 'sync_student',
      data: buildStudentPayload(profile, words),
      timestamp: new Date().toISOString(),
    };

    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(payload),
    });

    return true;
  } catch (err) {
    console.warn('Sync to Google Sheets failed:', err);
    return false;
  }
}

/**
 * 一鍵批次同步全班 35 位同學成績至 Google 試算表
 */
export async function syncAllStudentsToGoogleSheets(
  students: UserProfile[],
  words: WordItem[]
): Promise<boolean> {
  const url = getSavedSheetsUrl();
  if (!url) return false;

  try {
    const formattedList = students
      .filter((st) => st.seatNumber !== '訪客')
      .map((st) => buildStudentPayload(st, words));

    const payload = {
      action: 'batch_sync',
      classCode: '三年級',
      students: formattedList,
      timestamp: new Date().toISOString(),
    };

    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(payload),
    });

    return true;
  } catch (err) {
    console.warn('Batch sync to Google Sheets failed:', err);
    return false;
  }
}

/**
 * 記錄單次闖關 / 測驗結果流水號
 */
export async function logQuizToGoogleSheets(record: {
  seatNumber: string;
  modeName: string;
  unit: number;
  sectionTitle?: string;
  score: number;
  correctCount: number;
  totalCount: number;
}): Promise<boolean> {
  const url = getSavedSheetsUrl();
  if (!url || record.seatNumber === '訪客') return false;

  try {
    const payload = {
      action: 'log_quiz',
      classCode: '三年級',
      seatNumber: record.seatNumber,
      modeName: record.modeName,
      unit: `第 ${record.unit} 章`,
      sectionTitle: record.sectionTitle || '全章複習',
      score: record.score,
      accuracy: Math.round((record.correctCount / Math.max(1, record.totalCount)) * 100),
      correctCount: record.correctCount,
      totalCount: record.totalCount,
      timestamp: new Date().toISOString(),
    };

    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(payload),
    });

    return true;
  } catch (err) {
    console.warn('Log quiz to Google Sheets failed:', err);
    return false;
  }
}
