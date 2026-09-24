import React, { useState, useEffect } from 'react';
import { UserProfile, WordItem, StudyMode, ThemeColor } from './types';
import {
  loadUserProfileSync,
  saveLocalProfile,
  getLocalProfile,
  getCustomWords,
  saveCustomWords,
  resetCustomWordsToDefault,
  mergeUserProfiles,
} from './services/storage';
import { isWordDueForReview, updateWordStatOnResult, calculateMasteryRate } from './services/spacedRepetition';
import { initFirebase, fetchUserFromFirestore } from './services/firebase';
import { soundSynth } from './services/soundEffects';

import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { GuideModal } from './components/GuideModal';
import { VocabularyMasterListModal } from './components/VocabularyMasterListModal';
import { LevelSelector } from './components/LevelSelector';
import { FlashcardMode } from './components/FlashcardMode';
import { ListeningQuiz } from './components/ListeningQuiz';
import { MemoryMatchGame } from './components/MemoryMatchGame';
import { SpellingQuiz } from './components/SpellingQuiz';
import { MistakeNotebook } from './components/MistakeNotebook';
import { Leaderboard } from './components/Leaderboard';
import { TeacherDashboard } from './components/TeacherDashboard';

import { initAudioUnlock } from './services/tts';

export function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [words, setWords] = useState<WordItem[]>([]);
  const [currentMode, setCurrentMode] = useState<StudyMode>('levels');
  const [selectedLevelId, setSelectedLevelId] = useState<number>(1);
  const [sessionWords, setSessionWords] = useState<WordItem[]>([]);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isMasterListOpen, setIsMasterListOpen] = useState<boolean>(false);
  const [isFirebaseActive, setIsFirebaseActive] = useState<boolean>(false);

  // 初始化載入
  useEffect(() => {
    // 全局解鎖音效與 Web Speech TTS
    initAudioUnlock();

    // 檢查 Firebase (選用，不強求)
    const fbActive = initFirebase();
    setIsFirebaseActive(fbActive);

    // 載入三年級全冊單字庫
    const loadedWords = getCustomWords();
    setWords(loadedWords);

    // 載入上次座號 (預設為 01)
    const local = getLocalProfile();
    const initialSeat = local?.seatNumber || '01';
    const initialProfile = loadUserProfileSync(initialSeat);

    const maxLevelId = Math.max(...loadedWords.map((w) => w.levelId || 1), 8);
    let autoUnlocked = initialProfile.seatNumber === '訪客' ? 8 : (initialProfile.unlockedLevel || 1);
    
    if (initialProfile.seatNumber !== '訪客') {
      for (let lvl = 1; lvl <= maxLevelId; lvl++) {
        const lvlWordIds = loadedWords.filter((w) => w.levelId === lvl).map((w) => w.id);
        if (lvlWordIds.length > 0) {
          const rate = calculateMasteryRate(lvlWordIds, initialProfile.wordStats);
          if (rate >= 0.8 && lvl >= autoUnlocked && lvl < maxLevelId) {
            autoUnlocked = lvl + 1;
          }
        }
      }
    }

    const finalInitialProfile = { ...initialProfile, unlockedLevel: autoUnlocked };
    setUserProfile(finalInitialProfile);
    saveLocalProfile(finalInitialProfile);

    // 背景同步遠端 Firebase (若開啟，非訪客才同步)
    if (initialSeat !== '訪客') {
      fetchUserFromFirestore(initialSeat)
        .then((remote) => {
          if (remote) {
            setUserProfile((curr) => {
              if (!curr || curr.seatNumber !== initialSeat) return curr;
              const merged = mergeUserProfiles(curr, remote);
              let mergedUnlocked = merged.unlockedLevel || 1;
              for (let lvl = 1; lvl <= maxLevelId; lvl++) {
                const lvlWordIds = loadedWords.filter((w) => w.levelId === lvl).map((w) => w.id);
                if (lvlWordIds.length > 0) {
                  const rate = calculateMasteryRate(lvlWordIds, merged.wordStats);
                  if (rate >= 0.8 && lvl >= mergedUnlocked && lvl < maxLevelId) {
                    mergedUnlocked = lvl + 1;
                  }
                }
              }
              const updated = { ...merged, unlockedLevel: mergedUnlocked };
              saveLocalProfile(updated);
              return updated;
            });
          }
        })
        .catch(() => {});
    }
  }, []);

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-black text-slate-700">正在載入三年級升學單字複習庫...</p>
        </div>
      </div>
    );
  }

  // 計算到期待複習單字數
  const dueCount = words.filter((w) => isWordDueForReview(userProfile.wordStats[w.id])).length;

  // 切換學生座號或訪客登入
  const handleStudentLogin = (seatNumber: string, classCode: string, themeColor: ThemeColor) => {
    const isGuest = seatNumber === '訪客';
    const initialProfile = loadUserProfileSync(seatNumber);
    const maxLevelId = Math.max(...words.map((w) => w.levelId || 1), 8);
    let autoUnlocked = isGuest ? 8 : (initialProfile.unlockedLevel || 1);

    if (!isGuest) {
      for (let lvl = 1; lvl <= maxLevelId; lvl++) {
        const lvlWordIds = words.filter((w) => w.levelId === lvl).map((w) => w.id);
        if (lvlWordIds.length > 0) {
          const rate = calculateMasteryRate(lvlWordIds, initialProfile.wordStats);
          if (rate >= 0.8 && lvl >= autoUnlocked && lvl < maxLevelId) {
            autoUnlocked = lvl + 1;
          }
        }
      }
    }

    const updatedProfile: UserProfile = {
      ...initialProfile,
      classCode,
      themeColor,
      unlockedLevel: autoUnlocked,
    };
    setUserProfile(updatedProfile);
    saveLocalProfile(updatedProfile);

    if (!isGuest) {
      fetchUserFromFirestore(seatNumber)
        .then((remote) => {
          if (remote) {
            setUserProfile((curr) => {
              if (curr && curr.seatNumber === seatNumber) {
                const merged = mergeUserProfiles(curr, remote);
                saveLocalProfile(merged);
                return merged;
              }
              return curr;
            });
          }
        })
        .catch(() => {});
    }
  };

  // 切換個人色彩主題
  const handleUpdateTheme = (color: ThemeColor) => {
    if (!userProfile) return;
    const updated = { ...userProfile, themeColor: color };
    setUserProfile(updated);
    saveLocalProfile(updated);
  };

  // 選擇關卡與學習模式 (支援選填小節/分類 sectionCode)
  const handleSelectLevelMode = (levelId: number, mode: StudyMode, sectionCode?: string) => {
    setSelectedLevelId(levelId);
    let filteredWords = words.filter((w) => w.levelId === levelId);
    if (sectionCode && sectionCode !== 'ALL') {
      const secFiltered = filteredWords.filter((w) => w.sectionCode === sectionCode);
      if (secFiltered.length > 0) {
        filteredWords = secFiltered;
      }
    }
    setSessionWords(filteredWords.length > 0 ? filteredWords : words.filter((w) => w.levelId === levelId));
    setCurrentMode(mode);
  };

  // 開啟待複習池
  const handleStartDueReview = () => {
    const dueWords = words.filter((w) => isWordDueForReview(userProfile.wordStats[w.id]));
    if (dueWords.length > 0) {
      setSessionWords(dueWords);
      setCurrentMode('flashcard');
    }
  };

  // 開啟自訂複習清單 (從錯題本發起)
  const handleStartCustomReviewSession = (selectedWords: WordItem[]) => {
    setSessionWords(selectedWords);
    setCurrentMode('flashcard');
  };

  // 刷卡評定反饋 (更新間隔重複演算法與解鎖邏輯)
  const handleUpdateWordStat = (wordId: string, rating: 'remembered' | 'fuzzy' | 'forgot') => {
    if (!userProfile) return;

    const currentStat = userProfile.wordStats[wordId];
    const updatedStat = updateWordStatOnResult(currentStat, rating);

    const newWordStats = {
      ...userProfile.wordStats,
      [wordId]: updatedStat,
    };

    const maxLevelId = Math.max(...words.map((w) => w.levelId || 1), 8);
    let nextUnlockedLevel = userProfile.seatNumber === '訪客' ? 8 : (userProfile.unlockedLevel || 1);
    
    if (userProfile.seatNumber !== '訪客') {
      for (let lvl = 1; lvl <= maxLevelId; lvl++) {
        const lvlWordIds = words.filter((w) => w.levelId === lvl).map((w) => w.id);
        if (lvlWordIds.length > 0) {
          const rate = calculateMasteryRate(lvlWordIds, newWordStats);
          if (rate >= 0.8 && lvl >= nextUnlockedLevel && lvl < maxLevelId) {
            nextUnlockedLevel = lvl + 1;
          }
        }
      }
    }

    if (nextUnlockedLevel > userProfile.unlockedLevel) {
      soundSynth.playLevelClear();
    }

    const currentLevelWordIds = words.filter((w) => w.levelId === selectedLevelId).map((w) => w.id);
    const masteryRate = calculateMasteryRate(currentLevelWordIds, newWordStats);

    const updatedProfile: UserProfile = {
      ...userProfile,
      unlockedLevel: nextUnlockedLevel,
      wordStats: newWordStats,
      stars: rating === 'remembered' ? userProfile.stars + 2 : userProfile.stars,
      progress: {
        ...userProfile.progress,
        [`level${selectedLevelId}`]: {
          completed: masteryRate >= 0.8,
          masteryRate,
          starsEarned: Math.round(masteryRate * 3),
          lastStudied: new Date().toISOString(),
        },
      },
    };

    setUserProfile(updatedProfile);
    saveLocalProfile(updatedProfile);
  };

  // 測驗加分獎勵
  const handleUpdateStars = (earnedStars: number) => {
    if (!userProfile) return;
    const updated = {
      ...userProfile,
      stars: userProfile.stars + earnedStars,
    };
    setUserProfile(updated);
    saveLocalProfile(updated);
  };

  // 語速切換
  const handleToggleSpeechRate = () => {
    const rates = [0.8, 1.0, 1.2];
    const nextIdx = (rates.indexOf(speechRate) + 1) % rates.length;
    setSpeechRate(rates[nextIdx]);
    soundSynth.playCorrect();
  };

  // 音效切換
  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    soundSynth.setEnabled(nextState);
  };

  // 教師自訂單字儲存
  const handleSaveWords = (newWords: WordItem[]) => {
    setWords(newWords);
    saveCustomWords(newWords);
    soundSynth.playLevelClear();
  };

  // 重置為三年級官方單字手冊全 2,196 單字
  const handleResetWords = () => {
    const reset = resetCustomWordsToDefault();
    setWords(reset);
    soundSynth.playCorrect();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9] text-stone-900 font-sans selection:bg-amber-200">
      {/* Navbar */}
      <Navbar
        userProfile={userProfile}
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenMasterList={() => setIsMasterListOpen(true)}
        onUpdateTheme={handleUpdateTheme}
        speechRate={speechRate}
        onToggleSpeechRate={handleToggleSpeechRate}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        dueCount={dueCount}
      />

      {/* Main View Container */}
      <main className="flex-1 pb-16">
        {currentMode === 'levels' && (
          <LevelSelector
            userProfile={userProfile}
            words={words}
            onSelectLevel={handleSelectLevelMode}
            dueCount={dueCount}
            onStartDueReview={handleStartDueReview}
            onOpenLogin={() => setIsLoginOpen(true)}
            onOpenGuide={() => setIsGuideOpen(true)}
            onOpenMasterList={() => setIsMasterListOpen(true)}
          />
        )}

        {currentMode === 'flashcard' && (
          <FlashcardMode
            words={sessionWords.length > 0 ? sessionWords : words.filter((w) => w.levelId === selectedLevelId)}
            wordStats={userProfile.wordStats}
            onUpdateStat={handleUpdateWordStat}
            onBack={() => setCurrentMode('levels')}
            speechRate={speechRate}
          />
        )}

        {currentMode === 'listening' && (
          <ListeningQuiz
            words={sessionWords.length > 0 ? sessionWords : words.filter((w) => w.levelId === selectedLevelId)}
            allWords={words}
            onBack={() => setCurrentMode('levels')}
            onUpdateScore={handleUpdateStars}
            onUpdateStat={handleUpdateWordStat}
            speechRate={speechRate}
          />
        )}

        {currentMode === 'matching' && (
          <MemoryMatchGame
            words={sessionWords.length > 0 ? sessionWords : words.filter((w) => w.levelId === selectedLevelId)}
            onBack={() => setCurrentMode('levels')}
            onUpdateScore={handleUpdateStars}
            onUpdateStat={handleUpdateWordStat}
            speechRate={speechRate}
          />
        )}

        {currentMode === 'spelling' && (
          <SpellingQuiz
            words={sessionWords.length > 0 ? sessionWords : words.filter((w) => w.levelId === selectedLevelId)}
            onBack={() => setCurrentMode('levels')}
            onUpdateScore={handleUpdateStars}
            onUpdateStat={handleUpdateWordStat}
            speechRate={speechRate}
          />
        )}

        {currentMode === 'mistakes' && (
          <MistakeNotebook
            words={words}
            wordStats={userProfile.wordStats}
            onStartReviewSession={handleStartCustomReviewSession}
            onBack={() => setCurrentMode('levels')}
            speechRate={speechRate}
          />
        )}

        {currentMode === 'leaderboard' && (
          <Leaderboard
            currentProfile={userProfile}
            words={words}
            onBack={() => setCurrentMode('levels')}
          />
        )}

        {currentMode === 'teacher' && (
          <TeacherDashboard
            words={words}
            onSaveWords={handleSaveWords}
            onResetWords={handleResetWords}
            onBack={() => setCurrentMode('levels')}
            currentProfile={userProfile}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs font-semibold text-slate-500 space-y-1">
        <p>FlashCard Pro - 三年級觀光餐旅業導論單字記憶與複習系統 &copy; {new Date().getFullYear()}</p>
        <p className="text-[11px] text-slate-400">
          全冊收錄 2,196 單字 ‧ 萊特納間隔重複演算法 ‧ 免密碼座號登入與訪客試用 ‧ 支援離線快取
        </p>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        currentProfile={userProfile}
        onLogin={handleStudentLogin}
        isFirebaseActive={isFirebaseActive}
      />

      {/* Guide & Mastery Principles Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Vocabulary Master List Modal */}
      <VocabularyMasterListModal
        words={words}
        userProfile={userProfile}
        isOpen={isMasterListOpen}
        onClose={() => setIsMasterListOpen(false)}
      />
    </div>
  );
}

export default App;
