# 🎴 FlashCard Pro - 三年級升科大四技觀光餐旅業導論 全冊單字複習系統

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 專為**三年級統測／升學複習**打造的高效數位單字記憶與自主闖關系統。  
> 完整收錄《升科大四技－觀光餐旅業導論 (2027 最新版) 單字手冊 (74G7104X)》全書 **8 大章、130 個小節分類、2,196 個專業核心單字、術語與全球航運代碼**。  
> 融合**萊特納間隔重複演算法 (Leitner Spaced Repetition)**、**Web Audio / TTS 跨平台語音朗讀**、**全班 35 位同學英雄榜**與**獨立免 LINE 純網頁架構**。

---

## 📖 目錄 (Table of Contents)
1. [🌟 系統核心特色](#-系統核心特色)
2. [🎮 五大學習與遊戲模式](#-五大學習與遊戲模式)
3. [📚 八大單元與全書 2,196 單字分類結構](#-八大單元與全書-2196-單字分類結構)
4. [👥 登入機制：35 位座號選擇與訪客試用專區](#-登入機制35-位座號選擇與訪客試用專區)
5. [🚀 任何人都能照做的 3 分鐘快速上手指南](#-任何人都能照做的-3-分鐘快速上手指南)
6. [👩‍🏫 教師管理後台與全冊總表列印功能](#-教師管理後台與全冊總表列印功能)
7. [🚢 免費部署上線教學 (GitHub Pages / Firebase)](#-免費部署上線教學-github-pages--firebase)
8. [📁 專案架構目錄說明](#-專案架構目錄說明)

---

## 🌟 系統核心特色

* **100% 完整收錄全冊單字（無遺漏）**：
  依據最新版單字手冊 (74G7104X) 逐頁完整提取整理，全書共 **2,196 個單字**，包含專業術語、外文名詞起源、航權公約、各國代表菜餚、全球航空公司代碼 (CI, BR...)、台灣機場代碼 (TSA, TPE...) 與各大洲主要城市代碼 (TYO, LON, NYC...)。
* **直接依單字本分類使用 (Section Filter)**：
  每個章節關卡均提供「單字本小節分類挑選」下拉選單，學生既可整章全面複習，也可針對特定小節（如「3-14 餐飲外場人員」、「4-21 客務服務中心」、「6-6 航空公司代碼」）進行針對性高密度精準特訓！
* **免密碼座號選擇（35 位同學）**：
  首頁點擊座號（01 ~ 35 號）即刻進入，本機 LocalStorage 無損持久化，免除學生忘記帳號密碼的困擾。
* **專屬訪客試用按鈕 (Guest Trial)**：
  首頁與登入對話框均設有醒目的「訪客試用」按鍵，外賓、其他班級或試聽家長一鍵免座號暢玩全冊 8 大關卡與全部功能。
* **獨立純網頁架構（免 LINE 連動）**：
  徹底移除外部通訊軟體與 LIFF 綁定，零外部相依性、零 CORS 限制，任何手機、平板、電子白板或電腦打開即用。
* **萊特納間隔重複記憶演算法 (SRS)**：
  內建 5 個記憶盒（Leitner Boxes），答對升級、答錯退回 Box 1，自動計算到期複習單字，打造永久長期記憶。
* **100% 跨平台 Web Speech API 語音朗讀 (TTS)**：
  支援美式標準英語自動發音，內建慢速 (0.8x) 與正常 (1.0x) 發音切換。

---

## 🎮 三大核心學習模式與輔助系統

| 模式名稱 | 特色與學習機制 | 適用時機 |
| :--- | :--- | :--- |
| **🎴 翻卡記憶 (Flashcards)** | 3D 翻轉字卡，正面英文、語音與 KK/IPA 音標標註；反面中文釋義、音標與單字手冊頁碼出處，提供「熟記 / 模糊 / 忘記」自我評定。 | 課前預習、發音熟記、初次認知 |
| **🎧 聽力測驗 (Listening Quiz)** | 真人語音朗讀，題目僅播放發音，學生透過聽力辨識中文或英文，四選一計時作答，訓練統測聽力辨識。 | 強化聽覺記憶、聽力測驗 |
| **🧩 雙語連連看 (Matching Game)** | 英文單字與中文解釋隨機排列，進行連線配對，考驗直覺聯想與手速。 | 課堂破冰、趣味競賽 |
| **📖 錯題本 (Mistake Notebook)** | 依據萊特納曲線自動篩選歷史答錯或待複習的單字，精準查漏補缺。 | 考前衝刺、個別化弱點補強 |
| **🏆 全班英雄榜 (Leaderboard)** | 即時統計全班 35 位座號總星星數、熟練度百分比與連續學習天數，訪客亦可同台比較。 | 學習動機、成果驗收 |
| **📊 Google 試算表統整** | 教師後台專屬功能，背景自動同步 35 位學生最新成績，自動建立總表分頁與作答歷程流水帳。 | 教學成績登記、學習歷程檔案 |

---

## 📚 八大單元與全書 2,196 單字分類結構

| 單元關卡 | 對應單字手冊章節 | 涵蓋小節分類 | 收錄字數 |
| :---: | :--- | :--- | :---: |
| **Unit 1** | **第一章 觀光餐旅業基本觀念** | 語音 1-1 ~ 1-4 (定義、範圍、特性與影響、民間組織) | **61** 字 |
| **Unit 2** | **第二章 觀光餐旅業之從業理念** | 語音 2-1 ~ 2-2 (從業規範、核心商數 IQ~BQ、近似字辨析) | **48** 字 |
| **Unit 3** | **第三章 餐飲業核心專業** | 語音 3-1 ~ 3-33 (米其林指南、各國菜餚、外場與內場編制、烹調法、物料倉儲) | **553** 字 |
| **Unit 4** | **第四章 旅宿業經營與管理** | 語音 4-1 ~ 4-37 (客務部、房務部、服務中心、連鎖飯店、法規單字、房租計價) | **625** 字 |
| **Unit 5** | **第五章 旅行業產品與票務** | 語音 5-1 ~ 5-21 (國內外組織、導遊領隊、護照簽證、機票欄位代碼、票聯種類) | **514** 字 |
| **Unit 6** | **第六章 觀光餐旅相關產業與代碼** | 語音 6-1 ~ 6-21 (遊樂展覽、三大區域八大航權、全球航空公司/城市/機場代碼) | **239** 字 |
| **Unit 7** | **第七章 觀光餐旅行銷與策略** | 語音 7-1 ~ 7-11 (消費者決策、行銷模式、4P/7P、產品生命週期、SWOT) | **144** 字 |
| **Unit 8** | **第八章 觀光餐旅業的現況與未來** | CD 8-1 (CIS 企業識別、電子商務、銀髮市場、清真認證、未來趨勢) | **12** 字 |
| **總計** | **全書 8 大章** | **共 130 個小節分類** | **2,196 字** |

> 完整 2,196 單字小節對照清單請參見：[`VOCABULARY_LIST.md`](./VOCABULARY_LIST.md)

---

## 👥 登入機制：35 位座號選擇與訪客試用專區

1. **三年級 35 位同學專屬座號**：
   - 點選上方座號按鍵（例如「座號 05」），系統自動列出 `01` 到 `35` 號按鈕。
   - 點擊座號立即載入個人學習歷史，星星、熟練進度與連續天數無縫保存。
2. **訪客試用體驗專區 (免座號)**：
   - 首頁與登入視窗皆提供「🎁 訪客試用體驗」按鈕。
   - 點擊後直接進入系統，預設解鎖全部關卡，讓任何師生或外賓立即體驗全部模式！

---

## 🚀 任何人都能照做的 3 分鐘快速上手指南

### 步驟 1：安裝環境
請確認電腦已安裝 [Node.js](https://nodejs.org/) (建議 v18 或 v20 以上版本)。

### 步驟 2：本機啟動
在專案根目錄開啟終端機執行：
```bash
# 啟動本地開發伺服器
npm run dev
```
瀏覽器開啟 `http://localhost:5173`，即可立即開始練習！

### 步驟 3：生產環境編譯
```bash
npm run build
```
編譯完成之靜態檔案將儲存於 `dist` 資料夾，可直接部署至任何網頁主機。

---

## 👩‍🏫 教師管理後台與全冊總表列印功能

* **📖 全冊單字總表 (VocabularyMasterListModal)**：
  - 首頁點擊「📖 開啟全冊單字總表」，即可開啟全書 2,196 單字對照視窗。
  - 支援關鍵字搜尋（輸入中文、英文或小節代號如 `1-1` 即時過濾）。
  - 支援「網格卡片」與「表格清單」雙檢視切換。
  - 支援「列印 / 存為 PDF」功能，一鍵輸出高品質紙本單字複習對照表。
* **👩‍🏫 教師管理儀表板 (Teacher Dashboard)**：
  - 預設安全密碼：`205` 或 `admin`。
  - 支援 CSV 匯入與匯出單字庫。
  - 即時監控全班 35 位學生整體熟練進度與待複習狀況。

---

## 🚢 免費部署上線教學 (GitHub Pages / Firebase)

### 方案 A：一鍵部署至 GitHub Pages (推薦)
1. 在 GitHub 建立全新倉庫（如 `grade3-flashcard`）。
2. 設定 `package.json` 中的 `homepage` 為您的 GitHub Pages 網址。
3. 執行：
   ```bash
   npm run deploy
   ```

### 方案 B：部署至 Firebase Hosting
1. 安裝 Firebase CLI：`npm install -g firebase-tools`
2. 登入與初始化：`firebase login`、`firebase init hosting`（選擇 `dist` 作為公開目錄）
3. 部署上線：
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

---

## 📁 專案架構目錄說明

```
三年級記憶字卡/
├── public/                       # 靜態資源 (favicon, icons)
├── src/
│   ├── assets/                   # 圖示與圖片資產
│   ├── components/               # React 功能組件
│   │   ├── ErrorBoundary.tsx     # 容錯邊界保護
│   │   ├── FlashcardMode.tsx     # 模式 1：3D 雙面翻卡朗讀記憶
│   │   ├── GuideModal.tsx        # 通關指南與間隔重複記憶說明
│   │   ├── Leaderboard.tsx       # 全班 35 位同學真實英雄榜
│   │   ├── LevelSelector.tsx     # 首頁：8 大單元與單字本小節分類挑選
│   │   ├── ListeningQuiz.tsx     # 模式 2：聽力選字四選一測驗
│   │   ├── LoginModal.tsx        # 35 位座號選擇與訪客試用對話框
│   │   ├── MemoryMatchGame.tsx   # 模式 3：雙語連連看配對遊戲
│   │   ├── MistakeNotebook.tsx   # 模式 5：萊特納錯題本與待複習池
│   │   ├── Navbar.tsx            # 頂部導覽列 (座號/訪客、星星、語速調整)
│   │   ├── SpellingQuiz.tsx      # 模式 4：拼字大挑戰
│   │   ├── TeacherDashboard.tsx  # 教師管理儀表板
│   │   └── VocabularyMasterListModal.tsx # 全冊 2,196 單字查閱與列印
│   ├── data/
│   │   └── grade3Words.ts        # 全冊 8 章、130 小節、2,196 單字資料庫
│   ├── services/
│   │   ├── firebase.ts           # Firebase 選用雲端資料庫
│   │   ├── liff.ts               # 解除 LINE 相依性之獨立適配器
│   │   ├── soundEffects.ts       # Web Audio API 原生音效合成器
│   │   ├── spacedRepetition.ts   # 萊特納間隔重複演算法核心
│   │   ├── storage.ts            # LocalStorage 快取與進度管理
│   │   └── tts.ts                # Web Speech API 語音朗讀引擎
│   ├── types/
│   │   └── index.ts              # TypeScript 型態定義 (WordItem, UserProfile)
│   ├── utils/
│   │   ├── confettiHelper.ts     # 通關彩帶粒子特效
│   │   └── csvHelper.ts          # CSV 單字匯入/匯出解析器
│   ├── App.tsx                   # 應用程式主邏輯與狀態流轉
│   ├── main.tsx                  # React 入口點
│   └── index.css                 # Tailwind CSS 樣式
├── index.html                    # 網頁入口
├── package.json                  # 專案依賴與腳本
├── README.md                     # 系統完整說明文件 (本檔案)
├── WORKFLOW.md                   # 系統架構與開發工作流程指南
└── VOCABULARY_LIST.md            # 全冊 2,196 單字目錄總表
```

---
*本系統專為三年級學生升學與統測複習量身打造。祝同學們學習順利、金榜題名！*
