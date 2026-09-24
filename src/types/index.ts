export type ThemeColor = 'emerald' | 'blue' | 'purple' | 'amber' | 'rose';

export type WordMemoryLevel = 'new' | 'learning' | 'reviewing' | 'mastered';

export interface WordItem {
  id: string;                // e.g. "w_g3_0001"
  levelId: number;           // 關卡等級 (1~8)
  word: string;              // 英文單字 / 專業術語 (e.g., "hospitality")
  phonetic?: string;         // 注音 / KK音標 (選用)
  translation: string;       // 中文翻譯 (e.g., "好客精神、餐旅服務業")
  partOfSpeech?: string;     // 詞性 (n., v., adj.)
  exampleEn?: string;        // 英文例句
  exampleZh?: string;        // 中文例句
  category: string;          // 主題分類 (e.g. "1-1 觀光餐旅業的定義")
  sectionCode?: string;      // 小節代碼 (e.g. "1-1", "3-14", "6-6")
  chapter?: string;          // 所屬章節
  hint?: string;             // 提示 / 單字手冊頁碼
  page?: number;             // 頁碼
}

export interface WordStat {
  level: WordMemoryLevel;
  box: number;               // 萊特納箱位 (1 ~ 5)
  reviewCount: number;       // 累計複習次數
  correctCount: number;      // 累計正確次數
  wrongCount: number;        // 累計錯誤次數
  lastInterval: number;      // 上次間隔 (天)
  nextReviewDate: string;    // 下次複習時間 (ISO 8601)
  lastReviewedAt?: string;   // 上次複習時間 (ISO 8601)
}

export interface LevelProgress {
  completed: boolean;
  masteryRate: number;      // 0.0 ~ 1.0 (0% ~ 100%)
  starsEarned: number;      // 0 ~ 3
  lastStudied?: string;
}

export interface UserProfile {
  seatNumber: string;         // 座號 e.g. "05" 或 "訪客"
  classCode?: string;         // 班級代碼 e.g. "三年級"
  themeColor: ThemeColor;
  unlockedLevel: number;      // 目前解鎖到的關卡 (1~8)
  lastActive: string;         // 上次活躍時間
  streakDays: number;         // 連續學習天數
  stars: number;              // 星星點數
  progress: Record<string, LevelProgress>; // key: e.g. "level1", "level2"
  wordStats: Record<string, WordStat>;     // key: wordId e.g. "w_g3_0001"
  lineDisplayName?: string;   // 暱稱 (選用)
  linePictureUrl?: string;    // 大頭貼 (選用)
  lineUserId?: string;        // User ID (選用)
}

export interface FirebaseConfigInput {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export type StudyMode = 
  | 'levels' 
  | 'flashcard' 
  | 'listening' 
  | 'matching' 
  | 'spelling'
  | 'mistakes' 
  | 'leaderboard'
  | 'teacher';

export interface QuizQuestion {
  word: WordItem;
  options: string[];         // 四選一選項
  correctAnswer: string;
}
