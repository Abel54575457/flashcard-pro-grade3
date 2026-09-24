import React, { useState, useEffect, useMemo } from 'react';
import { WordItem, WordStat } from '../types';
import { speakWord } from '../services/tts';
import { updateWordStatOnResult } from '../services/spacedRepetition';
import { soundSynth } from '../services/soundEffects';
import { saveDeckProgress, getDeckProgress, clearDeckProgress } from '../services/storage';
import {
  Volume2,
  RotateCw,
  CheckCircle2,
  HelpCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lightbulb,
  Award,
  ArrowLeft,
  Volume1,
  BookmarkCheck,
  Play,
  RotateCcw
} from 'lucide-react';
import { fireCelebrationConfetti, clearConfetti } from '../utils/confettiHelper';

interface FlashcardModeProps {
  words: WordItem[];
  wordStats: Record<string, WordStat>;
  onUpdateStat: (wordId: string, rating: 'remembered' | 'fuzzy' | 'forgot') => void;
  onBack: () => void;
  speechRate: number;
  seatNumber?: string;
}

export const FlashcardMode: React.FC<FlashcardModeProps> = ({
  words,
  wordStats,
  onUpdateStat,
  onBack,
  speechRate,
  seatNumber = '01',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [revealedWord, setRevealedWord] = useState<WordItem | null>(null);

  // 斷點進度續刷狀態
  const [savedResumeIndex, setSavedResumeIndex] = useState<number | null>(null);
  const [hasPromptedResume, setHasPromptedResume] = useState(false);

  // 產生本卡組唯一的持久化識別 Key
  const deckKey = useMemo(() => {
    if (!words || words.length === 0) return 'empty';
    const first = words[0];
    const last = words[words.length - 1];
    return `l${first.levelId || 1}_s${first.sectionCode || 'ALL'}_${first.id}_${last.id}_n${words.length}`;
  }, [words]);

  // 初始化檢查是否曾中途離開本關卡
  useEffect(() => {
    const saved = getDeckProgress(seatNumber, deckKey);
    if (saved && saved.currentIndex > 0 && saved.currentIndex < words.length) {
      setSavedResumeIndex(saved.currentIndex);
    } else {
      setSavedResumeIndex(null);
    }
    setHasPromptedResume(false);
  }, [deckKey, seatNumber, words.length]);

  const currentWord = words[currentIndex];
  const currentStat = currentWord ? wordStats[currentWord.id] : undefined;
  // 背面顯示的單字：嚴格鎖定在翻面時揭示的單字，絕不在轉場期間偷跑下一題答案
  const displayedBackWord = revealedWord || currentWord;

  // 自適應字體大小計算，避免超長專有名詞或片語溢出撞到底部評分按鈕
  const getWordFontSize = (text: string) => {
    if (text.length > 35) return 'text-xl sm:text-2xl';
    if (text.length > 22) return 'text-2xl sm:text-3xl';
    if (text.length > 14) return 'text-3xl sm:text-4xl';
    return 'text-4xl sm:text-5xl';
  };

  const getTransFontSize = (text: string) => {
    if (text.length > 28) return 'text-xl sm:text-2xl';
    if (text.length > 16) return 'text-2xl sm:text-3xl';
    return 'text-3xl sm:text-4xl';
  };

  // 切換到新單字且動畫完成時自動發音
  useEffect(() => {
    if (currentWord && !isSwitching) {
      speakWord(currentWord.word, speechRate);
    }
  }, [currentIndex, isSwitching, speechRate]);

  if (!currentWord || isFinished) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-in zoom-in-95 duration-300">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-100 space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">太棒了！刷卡複習完成！</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            你已經看完了本組全部 {words.length} 個單字，系統已將你的精通度寫入記憶曲線！
          </p>
          <div className="pt-4 flex justify-center space-x-4">
            <button
              onClick={() => {
                clearDeckProgress(seatNumber, deckKey);
                setCurrentIndex(0);
                setIsFinished(false);
                setIsFlipped(false);
                setRevealedWord(null);
              }}
              className="px-6 py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-sm transition-all"
            >
              再刷一次
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-200 transition-all"
            >
              返回關卡列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleRating = (rating: 'remembered' | 'fuzzy' | 'forgot') => {
    if (isSwitching || !currentWord) return;

    if (rating === 'remembered') {
      soundSynth.playCorrect();
    } else {
      soundSynth.playWrong();
    }

    onUpdateStat(currentWord.id, rating);

    if (currentIndex < words.length - 1) {
      const nextIndex = currentIndex + 1;
      // 自動記錄斷點進度：學生隨時離開都能秒接續
      saveDeckProgress(seatNumber, deckKey, nextIndex, words.length);

      // 關鍵修復：轉場期間絕不讓學生偷看到下一張卡片的中文答案
      // 步驟 1：立即淡出卡片並鎖定操作
      setIsSwitching(true);

      // 步驟 2：在卡片不可見 (opacity-0) 時，瞬間重置翻面與答案狀態，並前進到下一題
      setTimeout(() => {
        setIsFlipped(false);
        setRevealedWord(null);
        setShowHint(false);
        setCurrentIndex(nextIndex);

        // 步驟 3：微延遲後讓正面優雅淡入，新單字隨之自動發音
        setTimeout(() => {
          setIsSwitching(false);
        }, 50);
      }, 130);
    } else {
      // 刷完全部單字，自動清除該關卡的斷點紀錄
      clearDeckProgress(seatNumber, deckKey);
      fireCelebrationConfetti();
      soundSynth.playLevelClear();
      setIsFinished(true);
    }
  };

  const handleCardClick = () => {
    if (isSwitching) return;
    soundSynth.playFlip();
    if (!isFlipped) {
      setRevealedWord(currentWord);
      setIsFlipped(true);
    } else {
      setIsFlipped(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 font-bold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回</span>
        </button>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {currentIndex + 1} / {words.length} 個單字
          </span>
          {currentStat && (
            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
              currentStat.box >= 4 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              Leitner 箱位 {currentStat.box}
            </span>
          )}
        </div>
      </div>

      {/* 斷點進度續刷提示橫幅 */}
      {savedResumeIndex !== null && !hasPromptedResume && (
        <div className="bg-gradient-to-r from-amber-50 via-indigo-50 to-emerald-50 border-2 border-indigo-200 rounded-3xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-3 duration-300">
          <div className="flex items-center space-x-3.5 text-slate-800">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-200 shrink-0">
              <BookmarkCheck className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-black text-slate-900">
                  發現上次學習進度！
                </h4>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  斷點記憶
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                您上次練習停留在第 <span className="font-extrabold text-indigo-700 text-sm">{savedResumeIndex + 1}</span> / {words.length} 個單字，是否直接接續？
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => {
                soundSynth.playCorrect();
                setCurrentIndex(savedResumeIndex);
                setHasPromptedResume(true);
                setSavedResumeIndex(null);
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center space-x-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>繼續進度 (第 {savedResumeIndex + 1} 字)</span>
            </button>

            <button
              onClick={() => {
                soundSynth.playFlip();
                clearDeckProgress(seatNumber, deckKey);
                setCurrentIndex(0);
                setHasPromptedResume(true);
                setSavedResumeIndex(null);
              }}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold transition-all active:scale-95 flex items-center justify-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>從頭開始</span>
            </button>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
        />
      </div>

      {/* 3D Flip Card Container */}
      <div className={`perspective-1000 w-full min-h-[380px] sm:min-h-[420px] cursor-pointer group transition-all duration-150 ${
        isSwitching ? 'opacity-0 scale-95 -translate-x-3 pointer-events-none' : 'opacity-100 scale-100 translate-x-0'
      }`}>
        <div
          onClick={handleCardClick}
          className={`relative w-full h-full min-h-[380px] sm:min-h-[420px] transform-style-3d shadow-2xl rounded-3xl border border-slate-100 bg-white ${
            isSwitching ? 'transition-none' : 'duration-500 transition-transform'
          } ${isFlipped ? 'rotate-y-180' : ''}`}
        >
          {/* Card Front Side (English + Audio) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl p-8 flex flex-col justify-between items-center text-center bg-gradient-to-b from-white via-slate-50 to-indigo-50/30">
            
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 tracking-wider">
                {currentWord.category}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHint((prev) => !prev);
                }}
                className="p-2 rounded-xl text-amber-600 hover:bg-amber-50 font-semibold text-xs flex items-center space-x-1 transition-all"
              >
                <Lightbulb className="w-4 h-4 fill-amber-300" />
                <span>{showHint ? '隱藏提示' : '小提示'}</span>
              </button>
            </div>

            {/* Main Word */}
            <div className="my-auto space-y-3 w-full max-h-[220px] sm:max-h-[250px] overflow-y-auto px-2">
              <h2 className={`${getWordFontSize(currentWord.word)} font-black text-slate-900 tracking-tight leading-tight break-words`}>
                {currentWord.word}
              </h2>

              {currentWord.phonetic && (
                <div className="inline-block px-3.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-sm sm:text-base font-bold border border-slate-200 shadow-2xs">
                  {currentWord.phonetic}
                </div>
              )}

              <div className="flex items-center justify-center space-x-2 pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(currentWord.word, speechRate);
                  }}
                  className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-indigo-200 transition-transform active:scale-95"
                >
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span>點擊發音 ({speechRate === 1.0 ? '1.0x' : '0.7x慢速'})</span>
                </button>
              </div>

              {showHint && currentWord.hint && (
                <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl max-w-md mx-auto animate-in fade-in">
                  💡 提示：{currentWord.hint}
                </p>
              )}
            </div>

            <div className="text-xs font-bold text-slate-400 flex items-center space-x-1 animate-pulse">
              <RotateCw className="w-3.5 h-3.5" />
              <span>點擊卡片翻面看中文與例句</span>
            </div>
          </div>

          {/* Card Back Side (Chinese + Phonetics + Examples) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl p-8 flex flex-col justify-between items-center text-center bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl">
            
            <div className="w-full flex items-center justify-between text-indigo-300 text-xs font-bold">
              <span>{displayedBackWord.partOfSpeech || (displayedBackWord.sectionCode ? `單元小節: ${displayedBackWord.sectionCode}` : '')}</span>
              {displayedBackWord.phonetic && (
                <span className="font-mono text-xs sm:text-sm text-yellow-300 bg-white/10 px-3 py-1 rounded-full border border-white/20 font-bold">
                  音標：{displayedBackWord.phonetic}
                </span>
              )}
            </div>

            {/* Back Chinese Word */}
            <div className="my-auto space-y-3 max-w-lg w-full max-h-[230px] sm:max-h-[260px] overflow-y-auto px-2">
              <h3 className={`${getTransFontSize(displayedBackWord.translation)} font-black text-yellow-300 tracking-tight leading-snug break-words`}>
                {displayedBackWord.translation}
              </h3>

              {displayedBackWord.phonetic && (
                <p className="font-mono text-sm sm:text-base text-indigo-200 font-bold">
                  {displayedBackWord.phonetic}
                </p>
              )}

              {displayedBackWord.exampleEn && (
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2 text-left">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-indigo-100">
                      {displayedBackWord.exampleEn}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakWord(displayedBackWord.exampleEn, speechRate);
                      }}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white ml-2 shrink-0"
                      title="朗讀例句"
                    >
                      <Volume1 className="w-4 h-4" />
                    </button>
                  </div>
                  {displayedBackWord.exampleZh && (
                    <p className="text-xs text-slate-300 font-medium">
                      {displayedBackWord.exampleZh}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="text-xs font-bold text-indigo-300/80">
              請下方評定你的記憶熟悉度
            </div>
          </div>

        </div>
      </div>

      {/* Leitner Rating Buttons */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <button
          onClick={() => handleRating('forgot')}
          disabled={isSwitching}
          className={`py-4 px-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-black text-xs sm:text-sm flex flex-col items-center justify-center space-y-1 transition-all active:scale-95 shadow-xs ${isSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <XCircle className="w-6 h-6 text-rose-500" />
          <span>❤️ 忘記 / 不會</span>
          <span className="text-[10px] font-normal text-rose-500">重設 Box 1</span>
        </button>

        <button
          onClick={() => handleRating('fuzzy')}
          disabled={isSwitching}
          className={`py-4 px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-black text-xs sm:text-sm flex flex-col items-center justify-center space-y-1 transition-all active:scale-95 shadow-xs ${isSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <HelpCircle className="w-6 h-6 text-amber-500" />
          <span>💛 模糊 / 似曾相識</span>
          <span className="text-[10px] font-normal text-amber-600">明天再次複習</span>
        </button>

        <button
          onClick={() => handleRating('remembered')}
          disabled={isSwitching}
          className={`py-4 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-black text-xs sm:text-sm flex flex-col items-center justify-center space-y-1 transition-all active:scale-95 shadow-xs ${isSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          <span>💚 記得 / 完全精通</span>
          <span className="text-[10px] font-normal text-emerald-600">晉升下個箱位</span>
        </button>
      </div>

    </div>
  );
};
