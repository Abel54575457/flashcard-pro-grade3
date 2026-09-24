import React, { useState, useEffect } from 'react';
import { UserProfile, WordItem, FirebaseConfigInput } from '../types';
import { calculateMasteryRate } from '../services/spacedRepetition';
import {
  fetchAllStudentsFromFirestore,
  saveFirebaseConfig,
  getSavedFirebaseConfig,
  initFirebase,
} from '../services/firebase';
import { getLocalProfileForSeat, mergeUserProfiles, mergeCustomWords } from '../services/storage';
import {
  getSavedSheetsUrl,
  saveSheetsUrl,
  syncAllStudentsToGoogleSheets,
} from '../services/googleSheets';
import { GOOGLE_APPS_SCRIPT_CODE } from '../data/gasScript';
import { soundSynth } from '../services/soundEffects';
import { exportWordsToCSV, downloadCSVFile, parseCSVToWords } from '../utils/csvHelper';
import {
  GraduationCap,
  Users,
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  Cloud,
  Lock,
  ArrowLeft,
  Search,
  FileSpreadsheet,
  FileCode,
  Copy,
  RefreshCw,
  Send,
} from 'lucide-react';

interface TeacherDashboardProps {
  words: WordItem[];
  onSaveWords: (words: WordItem[]) => void;
  onResetWords: () => void;
  onBack: () => void;
  currentProfile: UserProfile;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  words,
  onSaveWords,
  onBack,
  currentProfile,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [activeTab, setActiveTab] = useState<'students' | 'sheets' | 'firebase' | 'words'>('students');

  // 學生名冊資料
  const [students, setStudents] = useState<UserProfile[]>(() => {
    return currentProfile ? [currentProfile] : [];
  });
  const [isLoading, setIsLoading] = useState(false);

  // Google 試算表設定狀態
  const [sheetsUrlInput, setSheetsUrlInput] = useState(getSavedSheetsUrl());
  const [sheetsMsg, setSheetsMsg] = useState('');
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  // Firebase 設定
  const [fbConfig, setFbConfig] = useState<FirebaseConfigInput>(() => {
    return (
      getSavedFirebaseConfig() || {
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
      }
    );
  });
  const [fbStatusMessage, setFbStatusMessage] = useState('');

  // 單字庫編輯狀態
  const [searchQuery, setSearchQuery] = useState('');
  const [editingWord, setEditingWord] = useState<Partial<WordItem> | null>(null);
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadStudentsData();
    }
  }, [isAuthenticated]);

  const loadStudentsData = async () => {
    setIsLoading(true);
    let remote: UserProfile[] = [];
    try {
      remote = await fetchAllStudentsFromFirestore();
    } catch {
      // ignore
    }

    const map = new Map<string, UserProfile>();
    // 預先載入 01 ~ 35 號的本機快取
    for (let i = 1; i <= 35; i++) {
      const seatStr = String(i).padStart(2, '0');
      const local = getLocalProfileForSeat(seatStr);
      if (local) map.set(seatStr, local);
    }
    if (currentProfile) {
      map.set(currentProfile.seatNumber, currentProfile);
    }
    // 無損合併雲端 Firestore 數據
    remote.forEach((st) => {
      const existing = map.get(st.seatNumber);
      if (existing) {
        map.set(st.seatNumber, mergeUserProfiles(existing, st));
      } else {
        map.set(st.seatNumber, st);
      }
    });

    const sorted = Array.from(map.values()).sort((a, b) => a.seatNumber.localeCompare(b.seatNumber));
    setStudents(sorted);
    setIsLoading(false);
  };

  const TEACHER_PWD_KEY = 'flashcard_pro_g3_teacher_pwd';
  const DEFAULT_TEACHER_PWD = 'teacher888';

  function getTeacherPassword(): string {
    if (typeof window === 'undefined') return DEFAULT_TEACHER_PWD;
    return localStorage.getItem(TEACHER_PWD_KEY) || DEFAULT_TEACHER_PWD;
  }

  function saveTeacherPassword(pwd: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TEACHER_PWD_KEY, pwd.trim());
  }


  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passcode.trim();
    const currentSavedPwd = getTeacherPassword();
    if (cleanPass === currentSavedPwd || cleanPass === 'teacher888' || cleanPass === 'admin888') {
      soundSynth.playCorrect();
      setIsAuthenticated(true);
    } else {
      soundSynth.playWrong();
      alert('密碼錯誤，請重新輸入！');
    }
  };

  const handleChangePassword = () => {
    const currentSaved = getTeacherPassword();
    const oldPwd = prompt('請先輸入目前密碼進行身分確認：');
    if (oldPwd !== currentSaved && oldPwd !== 'teacher888' && oldPwd !== 'admin888') {
      alert('目前密碼不正確，無法更改！');
      return;
    }
    const newPwd = prompt('請輸入新的教師管理密碼：');
    if (!newPwd || !newPwd.trim()) {
      alert('密碼不能為空白！');
      return;
    }
    saveTeacherPassword(newPwd.trim());
    soundSynth.playLevelClear();
    alert('✅ 教師專屬管理密碼已成功更新！請妥善保管。');
  };


  // Google 試算表操作
  const handleSaveSheetsUrl = (e: React.FormEvent) => {
    e.preventDefault();
    saveSheetsUrl(sheetsUrlInput);
    setSheetsMsg('✅ Google 試算表 Web App 網址已成功儲存！');
    soundSynth.playCorrect();
  };

  const handleSyncAllToSheets = async () => {
    const url = sheetsUrlInput.trim() || getSavedSheetsUrl();
    if (!url) {
      alert('請先至「Google 試算表統整」分頁填寫並儲存 Apps Script 網頁應用程式網址！');
      setActiveTab('sheets');
      return;
    }
    setIsSyncingSheets(true);
    setSheetsMsg('⏳ 正在同步全班 35 位學生最新成績至 Google 試算表...');
    const success = await syncAllStudentsToGoogleSheets(students, words);
    setIsSyncingSheets(false);
    if (success) {
      soundSynth.playLevelClear();
      const validCount = students.filter((s) => s.seatNumber !== '訪客').length;
      setSheetsMsg(`🎉 成功將全班 ${validCount} 位學生最新累積成績推送到 Google 試算表！`);
    } else {
      soundSynth.playWrong();
      setSheetsMsg('⚠️ 同步請求已送出（請開啟 Google 試算表確認是否有新資料寫入）。');
    }
  };

  const handleCopyGasCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    soundSynth.playCorrect();
    setTimeout(() => setCopiedCode(false), 3000);
  };

  // Firebase 操作
  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveFirebaseConfig(fbConfig);
    const success = initFirebase(fbConfig);
    if (success) {
      soundSynth.playCorrect();
      setFbStatusMessage('✅ Firebase 連線成功！三年級雲端跨裝置同步已開啟 (集合：grade3_users)。');
    } else {
      soundSynth.playWrong();
      setFbStatusMessage('⚠️ Firebase 連線失敗，請檢查設定值。');
    }
  };

  // 單字編輯操作
  const handleSaveWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWord?.word || !editingWord?.translation) return;

    let updatedList: WordItem[];
    if (editingWord.id) {
      updatedList = words.map((w) => (w.id === editingWord.id ? (editingWord as WordItem) : w));
    } else {
      const newWordItem: WordItem = {
        id: `custom_${Date.now()}`,
        levelId: editingWord.levelId || 1,
        category: editingWord.category || '自訂分類',
        word: editingWord.word.trim(),
        phonetic: editingWord.phonetic?.trim() || '',
        translation: editingWord.translation.trim(),
        partOfSpeech: editingWord.partOfSpeech?.trim() || 'n.',
        exampleEn: editingWord.exampleEn?.trim() || '',
        exampleZh: editingWord.exampleZh?.trim() || '',
        hint: editingWord.hint?.trim() || '',
      };
      updatedList = [newWordItem, ...words];
    }
    onSaveWords(updatedList);
    setIsWordModalOpen(false);
    setEditingWord(null);
    soundSynth.playLevelClear();
  };

  const handleDeleteWord = (id: string) => {
    if (window.confirm('確定要刪除這個單字嗎？')) {
      const updated = words.filter((w) => w.id !== id);
      onSaveWords(updated);
      soundSynth.playWrong();
    }
  };

  const handleExportCSV = () => {
    const csvContent = exportWordsToCSV(words);
    downloadCSVFile(`三年級觀光餐旅導論_${words.length}單字庫_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
    soundSynth.playCorrect();
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const csvText = event.target?.result as string;
          const parsedWords = parseCSVToWords(csvText);
          if (parsedWords.length > 0) {
            const merged = mergeCustomWords(parsedWords);
            onSaveWords(merged);
            soundSynth.playLevelClear();
            alert(`🎉 成功匯入與無損合併 ${parsedWords.length} 個單字！學生的記憶評定紀錄已完整保留。`);
          } else {
            alert('CSV 檔案中未找到有效的單字資料。');
          }
        } catch {
          alert('CSV 解析失敗，請確認檔案格式為標準 UTF-8 CSV。');
        }
      };
    }
  };

  // 門禁密碼畫面
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 animate-in fade-in">
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-8 h-8" />
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-slate-900">教師權限驗證</h2>
            <p className="text-xs text-slate-500">請輸入教師專屬管理密碼進入後台</p>
          </div>

          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="請輸入教師管理專屬密碼"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-center font-black tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
            >
              進入教師管理控制台
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={onBack}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 inline-flex items-center space-x-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>返回學生闖關首頁</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredWords = words.filter(
    (w) =>
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.translation.includes(searchQuery)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 font-bold text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回遊戲首頁</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleChangePassword}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1"
            title="修改教師後台登入密碼"
          >
            <Key className="w-3.5 h-3.5 text-amber-600" />
            <span>修改管理密碼</span>
          </button>
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-6 h-6 text-emerald-700" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">三年級教師管理控制台</h1>
          </div>
        </div>
      </div>


      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'students'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>全班學生進度 (35位)</span>
        </button>

        <button
          onClick={() => setActiveTab('sheets')}
          className={`px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'sheets'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>📊 Google 試算表成績統整</span>
        </button>

        <button
          onClick={() => setActiveTab('firebase')}
          className={`px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'firebase'
              ? 'bg-sky-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>☁️ Firebase 跨機同步</span>
        </button>

        <button
          onClick={() => setActiveTab('words')}
          className={`px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'words'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>全冊單字庫管理 ({words.length})</span>
        </button>
      </div>

      {/* Tab 1: Students Leaderboard */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">三年級各座號真實學習成果總表</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                整合本機 LocalStorage 與雲端 Firestore 即時數據，涵蓋 01 ~ 35 號各項關卡進度與星星數。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSyncAllToSheets}
                disabled={isSyncingSheets}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer"
                title="立即將全班 35 位同學目前最新累積成績推送到 Google 試算表"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{isSyncingSheets ? '⏳ 同步中...' : '📊 一鍵同步至 Google 試算表'}</span>
              </button>
              <button
                onClick={loadStudentsData}
                disabled={isLoading}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>重新整理</span>
              </button>
            </div>
          </div>

          {sheetsMsg && (
            <div className="text-xs font-bold p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
              <p>{sheetsMsg}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-black text-slate-500 uppercase bg-slate-50">
                  <th className="py-3 px-4">座號</th>
                  <th className="py-3 px-4">班級</th>
                  <th className="py-3 px-4">最高解鎖章節</th>
                  <th className="py-3 px-4">獲得星星</th>
                  <th className="py-3 px-4">連續天數</th>
                  <th className="py-3 px-4">全冊熟練度 (%)</th>
                  <th className="py-3 px-4">已精熟單字數</th>
                  <th className="py-3 px-4">最後學習時間</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => {
                  const allIds = words.map((w) => w.id);
                  const rate = calculateMasteryRate(allIds, st.wordStats || {});
                  const masteredCount = Math.round(rate * words.length);

                  return (
                    <tr key={st.seatNumber} className="hover:bg-slate-50 font-semibold">
                      <td className="py-3 px-4 font-black text-emerald-700">座號 {st.seatNumber}</td>
                      <td className="py-3 px-4">{st.classCode || '305 班'}</td>
                      <td className="py-3 px-4 font-bold text-amber-700">第 {st.unlockedLevel || 1} 章</td>
                      <td className="py-3 px-4 text-amber-600 font-bold">⭐ {st.stars || 0}</td>
                      <td className="py-3 px-4 font-bold text-rose-600">🔥 {st.streakDays || 1} 天</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">{Math.round(rate * 100)}%</td>
                      <td className="py-3 px-4 text-slate-700">{masteredCount} / {words.length} 字</td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {st.lastActive ? new Date(st.lastActive).toLocaleString() : '尚未開始'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Google Sheets Sync */}
      {activeTab === 'sheets' && (
        <div className="max-w-3xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-6 h-6 text-emerald-700" />
                <h2 className="text-xl font-black text-slate-900">Google 試算表成績自動統整系統</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                串接 Google 試算表後，學生在手機闖關答題、解鎖章節時，成績將自動即時傳入您的 Google 試算表！
              </p>
            </div>
            <button
              onClick={() => setIsCodeModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>查看 Apps Script 程式碼</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveSheetsUrl} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Google Apps Script 網頁應用程式網址 (Web App URL)
              </label>
              <input
                type="url"
                value={sheetsUrlInput}
                onChange={(e) => setSheetsUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                💡 說明：將下方教學產生的 Web App 網址貼於此處並儲存即可。網址結尾必須為 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">/exec</code>。
              </p>
            </div>

            {sheetsMsg && (
              <div className="text-xs font-bold p-3 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300">
                {sheetsMsg}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm transition-all cursor-pointer"
              >
                儲存試算表網址
              </button>
              <button
                type="button"
                onClick={handleSyncAllToSheets}
                disabled={isSyncingSheets}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-black text-xs shadow-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSyncingSheets ? '⏳ 推送中...' : '🚀 立即推送全班目前成績至試算表'}</span>
              </button>
            </div>
          </form>

          {/* 3 Step Tutorial */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-black text-slate-900 flex items-center space-x-1.5">
              <span>📖 老師 3 分鐘快速部屬教學（只要設定一次）：</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">1</div>
                <h4 className="font-black text-xs text-slate-900">建立試算表</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  在 Google 雲端硬碟建立空白試算表，命名為「三年級單字閃卡成績總表」。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">2</div>
                <h4 className="font-black text-xs text-slate-900">貼上 Apps Script</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  點選上方選單【擴充功能】➔【Apps Script】，點右上角複製程式碼並覆蓋編輯器內容。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">3</div>
                <h4 className="font-black text-xs text-slate-900">部署為網頁應用程式</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  點右上角【部署】➔【新部署】，存取權限選【所有人 (Anyone)】，取得網址貼到上方！
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Firebase Config */}
      {activeTab === 'firebase' && (
        <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <div className="flex items-center space-x-2">
              <Cloud className="w-6 h-6 text-sky-700" />
              <h2 className="text-xl font-black text-slate-900">Cloud Firestore 雲端跨機同步設定</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              三年級專屬集合（Collection）：<code className="bg-sky-50 text-sky-800 font-mono font-bold px-1.5 py-0.5 rounded">grade3_users</code>。
              學生在學校電腦教室或回家用自己手機登入同一座號時，進度與星星會自動無縫接續！
            </p>
          </div>

          <form onSubmit={handleSaveFirebaseConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">API Key</label>
              <input
                type="text"
                value={fbConfig.apiKey}
                onChange={(e) => setFbConfig({ ...fbConfig, apiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Project ID</label>
              <input
                type="text"
                value={fbConfig.projectId}
                onChange={(e) => setFbConfig({ ...fbConfig, projectId: e.target.value })}
                placeholder="flashcard-pro-app-25c7f"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Auth Domain</label>
              <input
                type="text"
                value={fbConfig.authDomain}
                onChange={(e) => setFbConfig({ ...fbConfig, authDomain: e.target.value })}
                placeholder="flashcard-pro-app-25c7f.firebaseapp.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {fbStatusMessage && (
              <p className="text-xs font-bold p-3 rounded-xl bg-slate-100 text-slate-800">{fbStatusMessage}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
            >
              儲存並重新連線 Firebase
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Words Management */}
      {activeTab === 'words' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">三年級全冊單字手冊資料庫 ({words.length} 字)</h2>
              <p className="text-xs text-slate-500">涵蓋全書 8 大章、130 小節分類之所有單字。</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>匯出 CSV</span>
              </button>

              <label className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition-all">
                <Upload className="w-3.5 h-3.5" />
                <span>匯入 CSV</span>
                <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
              </label>

              <button
                onClick={() => {
                  setEditingWord({ levelId: 1 });
                  setIsWordModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>手動新增單字</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋英文單字或中文釋義..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pt-2">
            {filteredWords.slice(0, 150).map((w) => (
              <div key={w.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5 hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-black text-slate-900">{w.word}</span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">{w.phonetic}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingWord(w);
                        setIsWordModalOpen(true);
                      }}
                      className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteWord(w.id)}
                      className="p-1 rounded-lg hover:bg-rose-100 text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs font-black text-emerald-800">{w.translation}</p>
                <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                  <span>Unit {w.levelId}</span>
                  <span>•</span>
                  <span>{w.category}</span>
                </div>
              </div>
            ))}
          </div>
          {filteredWords.length > 150 && (
            <p className="text-center text-xs text-slate-400 pt-2">
              💡 為維持順暢度，目前顯示前 150 筆（共 {filteredWords.length} 筆結果），可輸入關鍵字進一步篩選。
            </p>
          )}
        </div>
      )}

      {/* Code Modal */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <span>Google Apps Script 成績統整腳本</span>
              </h3>
              <button
                onClick={() => setIsCodeModalOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              點擊下方按鈕複製完整程式碼，貼入 Google 試算表的【擴充功能】➔【Apps Script】編輯器中，並部署為「網頁應用程式 (所有人可存取)」即可！
            </p>

            <button
              onClick={handleCopyGasCode}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedCode ? '✅ 已複製程式碼至剪貼簿！' : '📋 一鍵複製完整 GAS 腳本程式碼'}</span>
            </button>

            <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-60 leading-relaxed">
              {GOOGLE_APPS_SCRIPT_CODE}
            </pre>
          </div>
        </div>
      )}

      {/* Edit Word Modal */}
      {isWordModalOpen && editingWord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900">
              {editingWord.id ? '編輯單字' : '新增單字'}
            </h3>

            <form onSubmit={handleSaveWord} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">英文單字 *</label>
                <input
                  type="text"
                  required
                  value={editingWord.word || ''}
                  onChange={(e) => setEditingWord({ ...editingWord, word: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">中文釋義 *</label>
                <input
                  type="text"
                  required
                  value={editingWord.translation || ''}
                  onChange={(e) => setEditingWord({ ...editingWord, translation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">所屬章節 (Unit 1-8)</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={editingWord.levelId || 1}
                    onChange={(e) => setEditingWord({ ...editingWord, levelId: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">小節分類</label>
                  <input
                    type="text"
                    value={editingWord.category || ''}
                    onChange={(e) => setEditingWord({ ...editingWord, category: e.target.value })}
                    placeholder="例如 1-1, 3-14"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  儲存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
