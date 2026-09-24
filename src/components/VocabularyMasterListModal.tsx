import React, { useState } from 'react';
import { WordItem, UserProfile } from '../types';
import { soundSynth } from '../services/soundEffects';
import { LEVEL_NAMES, LEVEL_SECTIONS } from '../data/grade3Words';
import {
  BookOpen,
  Search,
  Volume2,
  X,
  Filter,
  CheckCircle2,
  Sparkles,
  Printer,
  Grid,
  List,
  Tag
} from 'lucide-react';

interface VocabularyMasterListModalProps {
  words: WordItem[];
  userProfile?: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const VocabularyMasterListModal: React.FC<VocabularyMasterListModalProps> = ({
  words,
  userProfile,
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  if (!isOpen) return null;

  const derivedLevels = Array.from(new Set(words.map((w) => w.levelId || 1))).sort((a, b) => a - b);

  // 取得所選 Level 的小節清單
  const availableSections = selectedLevel === 'all'
    ? Object.values(LEVEL_SECTIONS).flat()
    : (LEVEL_SECTIONS[selectedLevel] || []);

  // 篩選邏輯
  const filteredWords = words.filter((w) => {
    const matchesLevel = selectedLevel === 'all' || w.levelId === selectedLevel;
    const matchesSection = selectedSection === 'all' || w.sectionCode === selectedSection;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      w.word.toLowerCase().includes(q) ||
      w.translation.includes(q) ||
      (w.sectionCode && w.sectionCode.toLowerCase().includes(q)) ||
      (w.hint && w.hint.includes(q)) ||
      (w.category && w.category.toLowerCase().includes(q));

    return matchesLevel && matchesSection && matchesQuery;
  });

  const handlePrint = () => {
    soundSynth.playCorrect();
    window.print();
  };

  const playWordAudio = (word: string) => {
    soundSynth.speakWord(word);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#fcfbf9] w-full max-w-6xl h-[92vh] rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="bg-stone-900 text-stone-100 p-5 sm:p-6 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-xs font-bold shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  三年級 觀光餐旅業導論 全冊單字總表
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-stone-950">
                  全書 {words.length} 單字
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                完整收錄 8 大章、130 個語音分類 ‧ 支援即時搜尋、分類過濾、真人發音與列印對照
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all border border-stone-700"
              title="列印或儲存為 PDF 單字學習對照表"
            >
              <Printer className="w-3.5 h-3.5 text-stone-400" />
              <span>列印 / 存為 PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar Toolbar */}
        <div className="p-4 sm:p-5 bg-white border-b border-stone-200/80 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="搜尋英文單字、中文釋義、小節代碼 (如 1-1, 6-6, SOP, concierge)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9.5 pr-9 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Level (Chapter) Dropdown */}
            <div className="flex items-center space-x-2 shrink-0">
              <select
                value={selectedLevel}
                onChange={(e) => {
                  setSelectedLevel(e.target.value === 'all' ? 'all' : Number(e.target.value));
                  setSelectedSection('all'); // reset section on level change
                }}
                className="text-xs font-bold py-2 px-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">📚 全冊 8 大章 (全部)</option>
                {derivedLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    Unit {lvl} ‧ {LEVEL_NAMES[lvl]?.title || `Unit ${lvl}`}
                  </option>
                ))}
              </select>

              {/* Section Dropdown */}
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="text-xs font-bold py-2 px-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 max-w-xs"
              >
                <option value="all">🔖 全部小節分類 ({availableSections.length} 個)</option>
                {availableSections.map((sec) => (
                  <option key={sec.code} value={sec.code}>
                    語音 {sec.code} ‧ {sec.title} ({sec.wordCount}字)
                  </option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500 hover:text-stone-900'
                  }`}
                  title="網格卡片檢視"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'table' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500 hover:text-stone-900'
                  }`}
                  title="清單對照表檢視"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Result Counts & Active Filters */}
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium pt-1">
            <div className="flex items-center space-x-2">
              <span>符合條件：<strong className="text-amber-700 font-bold">{filteredWords.length}</strong> 個單字</span>
              {selectedLevel !== 'all' && (
                <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-bold">
                  Unit {selectedLevel}
                </span>
              )}
              {selectedSection !== 'all' && (
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[11px] font-bold">
                  分類 {selectedSection}
                </span>
              )}
            </div>

            <span className="text-[11px] text-stone-400">
              💡 點擊發音按鈕 🔊 可朗讀發音
            </span>
          </div>
        </div>

        {/* Word Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredWords.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-stone-600">查無符合搜尋條件的單字</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLevel('all');
                  setSelectedSection('all');
                }}
                className="text-xs text-amber-700 font-bold hover:underline"
              >
                清除所有搜尋與篩選條件
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWords.map((word) => {
                const stat = userProfile?.wordStats[word.id];
                const box = stat?.box || 0;

                return (
                  <div
                    key={word.id}
                    className="bg-white rounded-2xl p-4 border border-stone-200/90 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-bold">
                          Unit {word.levelId} ‧ {word.sectionCode || word.category}
                        </span>
                        {box > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Box {box} 熟練
                          </span>
                        )}
                      </div>

                      {/* Word Title & Audio */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-extrabold text-base text-stone-900 tracking-tight leading-snug">
                            {word.word}
                          </h3>
                        </div>
                        <button
                          onClick={() => playWordAudio(word.word)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-amber-800 hover:bg-amber-50 transition-all shrink-0 ml-2"
                          title="朗讀發音"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Translation */}
                      <p className="text-sm font-bold text-amber-900 mt-1.5 leading-relaxed">
                        {word.translation}
                      </p>
                    </div>

                    {/* Hint / Handbook page footer */}
                    {word.hint && (
                      <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 font-medium">
                        {word.hint}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                    <th className="py-2.5 px-3 w-16">單元</th>
                    <th className="py-2.5 px-3 w-28">小節分類</th>
                    <th className="py-2.5 px-3">英文單字 / 專業術語</th>
                    <th className="py-2.5 px-3">中文釋義</th>
                    <th className="py-2.5 px-3 w-36">單字手冊出處</th>
                    <th className="py-2.5 px-3 w-12 text-center">朗讀</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                  {filteredWords.map((word) => (
                    <tr key={word.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-amber-800">U{word.levelId}</td>
                      <td className="py-2.5 px-3 text-stone-600 font-bold">{word.sectionCode || word.category}</td>
                      <td className="py-2.5 px-3 font-extrabold text-stone-900">{word.word}</td>
                      <td className="py-2.5 px-3 font-bold text-amber-950">{word.translation}</td>
                      <td className="py-2.5 px-3 text-stone-500 text-[11px]">{word.hint || `p.${word.page}`}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => playWordAudio(word.word)}
                          className="p-1 rounded-md text-stone-400 hover:text-amber-800 hover:bg-amber-100 transition-all"
                          title="朗讀"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <span>
            目前顯示：<strong>{filteredWords.length}</strong> / <strong>{words.length}</strong> 個單字
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs transition-all"
          >
            關閉總表
          </button>
        </div>

      </div>
    </div>
  );
};
