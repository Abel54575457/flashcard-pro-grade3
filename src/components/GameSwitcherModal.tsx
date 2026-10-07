import React from 'react';
import { X, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundSynth } from '../services/soundEffects';

interface GameSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GAME_LINKS = [
  {
    id: 'flashcard-pro',
    title: 'FlashCard Pro 全冊單字記憶卡',
    subtitle: '三年級升學版 ‧ 2,196 字 ‧ 翻卡 / 聽力 / 連連看',
    icon: '🎴',
    url: 'https://abel54575457.github.io/flashcard-pro-grade3/',
    color: 'from-amber-500 to-amber-600',
    borderColor: 'border-amber-400',
    bgColor: 'bg-amber-50/80',
    tag: '目前位置',
    isCurrent: true,
  },
  {
    id: 'vocab-game',
    title: '觀光單字闖關遊戲',
    subtitle: 'RPG 地圖闖關 ‧ 85 分解鎖 ‧ 閱讀認字 / 聽音辨字',
    icon: '🎯',
    url: 'https://abel54575457.github.io/tourism-vocab-game/%E5%96%AE%E5%AD%97%E9%97%96%E9%97%9C%E9%81%8A%E6%88%B2_v2.html',
    color: 'from-indigo-600 to-indigo-700',
    borderColor: 'border-indigo-400',
    bgColor: 'bg-indigo-50/60',
    tag: '冒險挑戰',
    isCurrent: false,
  },
  {
    id: 'tourism-quiz',
    title: '學科小考測驗系統',
    subtitle: '歷屆大考題庫 ‧ 章節全真測驗 ‧ 即時自動計分',
    icon: '📝',
    url: 'https://abel54575457.github.io/tourism-quiz/index.html',
    color: 'from-sky-600 to-sky-700',
    borderColor: 'border-sky-400',
    bgColor: 'bg-sky-50/60',
    tag: '題庫測驗',
    isCurrent: false,
  },
];

export const GameSwitcherModal: React.FC<GameSwitcherModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">
                切換學習遊戲平台
              </h3>
              <p className="text-xs text-stone-300">
                三年級 觀光餐旅業導論 ‧ 三合一數位學習中心
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Game List */}
        <div className="p-5 sm:p-6 space-y-3.5 bg-[#fcfbf9]">
          {GAME_LINKS.map((game) => (
            <div
              key={game.id}
              className={`rounded-2xl p-4 border transition-all ${
                game.isCurrent
                  ? 'border-amber-400 bg-amber-50/50 shadow-xs'
                  : 'border-stone-200/90 bg-white hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200/80 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                    {game.icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-stone-900 text-base">
                        {game.title}
                      </h4>
                      {game.isCurrent && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                          <CheckCircle2 className="w-3 h-3 text-amber-800" />
                          <span>正在遊玩</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      {game.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 flex justify-end">
                {game.isCurrent ? (
                  <button
                    onClick={onClose}
                    className="px-4 py-1.5 rounded-xl bg-amber-400 text-stone-950 font-bold text-xs hover:bg-amber-500 transition-colors"
                  >
                    繼續在此學習
                  </button>
                ) : (
                  <a
                    href={game.url}
                    onClick={() => soundSynth.playCorrect()}
                    className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs transition-transform active:scale-95"
                  >
                    <span>立即切換前往</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}

          {/* Hub Portal Link */}
          <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">
              想看完整三合一遊戲介紹與導航？
            </span>
            <a
              href="./portal.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs font-bold text-amber-800 hover:text-amber-900 hover:underline"
            >
              <span>🏛️ 開啟遊戲整合選擇大廳</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-100 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs transition-colors"
          >
            關閉視窗
          </button>
        </div>

      </div>
    </div>
  );
};
