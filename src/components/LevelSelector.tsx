import React, { useState } from 'react';
import { UserProfile, WordItem, StudyMode } from '../types';
import { LEVEL_NAMES, LEVEL_SECTIONS } from '../data/grade3Words';
import { calculateMasteryRate } from '../services/spacedRepetition';
import { soundSynth } from '../services/soundEffects';
import {
  Lock,
  CheckCircle2,
  Award,
  BookOpen,
  Sparkles,
  Zap,
  Filter,
  Layers,
  UserCheck
} from 'lucide-react';

interface LevelSelectorProps {
  userProfile: UserProfile;
  words: WordItem[];
  onSelectLevel: (levelId: number, mode: StudyMode, sectionCode?: string) => void;
  dueCount: number;
  onStartDueReview: () => void;
  onOpenLogin: () => void;
  onOpenGuide?: () => void;
  onOpenMasterList?: () => void;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  userProfile,
  words,
  onSelectLevel,
  dueCount,
  onStartDueReview,
  onOpenLogin,
  onOpenMasterList,
}) => {
  // 記錄每個關卡所選擇的特定小節分類 (預設為 'ALL' 全章練習)
  const [selectedSections, setSelectedSections] = useState<Record<number, string>>({});

  const derivedLevelIds = Array.from(new Set(words.map((w) => w.levelId || 1))).sort((a, b) => a - b);
  const levels = derivedLevelIds.length > 0 ? derivedLevelIds : [1, 2, 3, 4, 5, 6, 7, 8];

  // 全站整體熟練度
  const allWordIds = words.map((w) => w.id);
  const totalMasteryRate = calculateMasteryRate(allWordIds, userProfile.wordStats);

  const handleSectionChange = (levelId: number, secCode: string) => {
    setSelectedSections((prev) => ({
      ...prev,
      [levelId]: secCode,
    }));
  };

  const isGuest = userProfile.seatNumber === '訪客';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Banner */}
      <div className="zen-card-dark p-6 sm:p-8 text-stone-100 relative overflow-hidden rounded-3xl shadow-xl bg-slate-900 border border-slate-800">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Main Greeting & Progress */}
          <div className="md:col-span-2 space-y-3">
            
            {/* Class & Seat Header */}
            <div className="flex flex-wrap items-center gap-2 text-stone-400 text-xs font-semibold tracking-wider uppercase">
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-stone-300 font-bold">
                升科大四技 ‧ 觀光餐旅業導論
              </span>
              <span>‧</span>
              <button
                onClick={() => {
                  soundSynth.playFlip();
                  onOpenLogin();
                }}
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-all font-bold text-xs ${
                  isGuest
                    ? 'bg-amber-400/25 text-amber-300 hover:bg-amber-400/35 border border-amber-400/40'
                    : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-400/30'
                }`}
                title="點擊切換座號或訪客試用"
              >
                {isGuest ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>👤 訪客試用模式</span>
                  </>
                ) : (
                  <span>三年級 {userProfile.seatNumber} 號</span>
                )}
                <span className="text-[10px] opacity-80 underline underline-offset-2">切換</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              三年級複習閃卡地圖
            </h1>
            <p className="text-xs text-stone-300">
              全冊單字手冊共 8 大章、130 個語音分類、2,196 個專業單字，可依小節分類直接精準刷題！
            </p>

            {/* Mastery Progress Bar */}
            <div className="pt-1 max-w-md space-y-1">
              <div className="flex justify-between text-xs font-medium text-stone-300">
                <span>全冊熟練度 ({words.length} 單字)</span>
                <span className="text-amber-400 font-bold">{Math.round(totalMasteryRate * 100)}%</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/10">
                <div
                  className="bg-gradient-to-r from-amber-500 via-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(totalMasteryRate * 100)}%` }}
                />
              </div>
            </div>

            {/* Quick Action: Master List Button */}
            {onOpenMasterList && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    soundSynth.playFlip();
                    onOpenMasterList();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs shadow-md transition-all flex items-center space-x-2 active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-stone-950" />
                  <span>📖 開啟全冊單字總表 (全 2,196 字查閱與列印)</span>
                </button>
              </div>
            )}

          </div>

          {/* Review Pool Card */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-stone-200">萊特納待複習單字</span>
              {dueCount > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-stone-950 animate-pulse">
                  {dueCount} 個
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300">
                  今日無待複習
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-400 leading-tight">
              根據間隔重複演算法，即時複習易忘單字，鞏固長期記憶。
            </p>

            <button
              onClick={() => {
                soundSynth.playFlip();
                onStartDueReview();
              }}
              disabled={dueCount === 0}
              className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center space-x-1.5 transition-all ${
                dueCount > 0
                  ? 'bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-md active:scale-95'
                  : 'bg-white/10 text-stone-500 cursor-not-allowed border border-white/5'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{dueCount > 0 ? `開始複習待辦 (${dueCount})` : '無需複習'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Level Cards Grid */}
      <div className="space-y-4">
        
        {/* Section Title */}
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-2.5">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-600" />
            <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
              章節關卡與單字本分類 (Unit 1 - {Math.max(...levels, 8)})
            </h2>
          </div>

          {onOpenMasterList && (
            <button
              onClick={() => {
                soundSynth.playFlip();
                onOpenMasterList();
              }}
              className="text-xs font-black text-amber-700 hover:text-amber-900 flex items-center space-x-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>依單字手冊對照 ➔</span>
            </button>
          )}
        </div>

        {/* Level Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {levels.map((levelId) => {
            const levelWords = words.filter((w) => w.levelId === levelId);
            const levelSections = LEVEL_SECTIONS[levelId] || [];
            const selectedSec = selectedSections[levelId] || 'ALL';

            // 依所選小節過濾單字數
            const targetWords = selectedSec === 'ALL'
              ? levelWords
              : levelWords.filter((w) => w.sectionCode === selectedSec);

            const isUnlocked = isGuest || levelId === 1 || levelId <= userProfile.unlockedLevel;
            const levelInfo = LEVEL_NAMES[levelId] || {
              title: `Unit ${levelId}`,
              desc: `包含 ${levelWords.length} 個單字`,
              icon: '📚'
            };
            const levelWordIds = levelWords.map((w) => w.id);
            const mastery = calculateMasteryRate(levelWordIds, userProfile.wordStats);
            const isCompleted = mastery >= 0.8;

            return (
              <div
                key={levelId}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all duration-300 flex flex-col justify-between space-y-4 shadow-sm ${
                  isUnlocked
                    ? 'border-stone-200 hover:border-amber-400 hover:shadow-md'
                    : 'opacity-60 bg-stone-50 border-stone-200'
                }`}
              >
                {/* Card Top */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs shrink-0 ${
                          isUnlocked
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                            : 'bg-stone-200 text-stone-400'
                        }`}
                      >
                        {isUnlocked ? levelInfo.icon : <Lock className="w-5 h-5 text-stone-400" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5 mb-0.5">
                          <span className="text-[11px] font-black text-amber-800 tracking-wider uppercase">
                            UNIT {levelId}
                          </span>
                          {isCompleted && (
                            <span className="inline-flex items-center space-x-0.5 px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              <span>已熟練</span>
                            </span>
                          )}
                        </div>
                        <h3 className="font-black text-stone-900 text-base leading-snug">
                          {levelInfo.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {levelInfo.desc}
                  </p>

                  {/* 小節分類下拉選單 (單字本分類直接使用) */}
                  {isUnlocked && levelSections.length > 0 && (
                    <div className="pt-1">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-extrabold text-stone-700 flex items-center space-x-1">
                          <Filter className="w-3 h-3 text-amber-600" />
                          <span>單字本分類挑選：</span>
                        </label>
                        <span className="text-[10px] font-bold text-stone-500">
                          {targetWords.length} 字
                        </span>
                      </div>
                      <select
                        value={selectedSec}
                        onChange={(e) => handleSectionChange(levelId, e.target.value)}
                        className="w-full text-xs font-bold py-1.5 px-2.5 rounded-xl border border-stone-300 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                      >
                        <option value="ALL">🌟 全部小節分類 (全章共 {levelWords.length} 字)</option>
                        {levelSections.map((sec) => (
                          <option key={sec.code} value={sec.code}>
                            語音 {sec.code} ‧ {sec.title} ({sec.wordCount} 字)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Card Bottom Progress & Actions */}
                {isUnlocked ? (
                  <div className="space-y-3 pt-3 border-t border-stone-100">
                    <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
                      <span>本章熟練進度</span>
                      <span className="font-extrabold text-stone-900">{Math.round(mastery * 100)}%</span>
                    </div>

                    <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.round(mastery * 100)}%` }}
                      />
                    </div>

                    {/* Mode Buttons */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1 text-xs font-black">
                      <button
                        onClick={() => {
                          soundSynth.playFlip();
                          onSelectLevel(levelId, 'flashcard', selectedSec);
                        }}
                        className="py-2 px-1 rounded-xl bg-stone-900 text-stone-100 hover:bg-stone-800 transition-all flex items-center justify-center space-x-1 shadow-xs active:scale-95"
                        title="翻卡朗讀與記憶"
                      >
                        <span>🎴 閃卡</span>
                      </button>

                      <button
                        onClick={() => {
                          soundSynth.playFlip();
                          onSelectLevel(levelId, 'listening', selectedSec);
                        }}
                        className="py-2 px-1 rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 transition-all flex items-center justify-center space-x-1 border border-amber-200 active:scale-95"
                        title="聽力四選一測驗"
                      >
                        <span>🎧 聽力</span>
                      </button>

                      <button
                        onClick={() => {
                          soundSynth.playFlip();
                          onSelectLevel(levelId, 'matching', selectedSec);
                        }}
                        className="py-2 px-1 rounded-xl bg-emerald-100 text-emerald-900 hover:bg-emerald-200 transition-all flex items-center justify-center space-x-1 border border-emerald-200 active:scale-95"
                        title="雙語連連看配對"
                      >
                        <span>🧩 配對</span>
                      </button>

                      <button
                        onClick={() => {
                          soundSynth.playFlip();
                          onSelectLevel(levelId, 'spelling', selectedSec);
                        }}
                        className="py-2 px-1 rounded-xl bg-purple-100 text-purple-900 hover:bg-purple-200 transition-all flex items-center justify-center space-x-1 border border-purple-200 active:scale-95"
                        title="拼字大挑戰"
                      >
                        <span>✍️ 拼字</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-stone-100 text-center py-2 text-xs font-bold text-stone-500">
                    🔒 通過前一關即可解鎖（或點選上方切換為訪客模式）
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
