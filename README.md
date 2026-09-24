# 🎴 FlashCard Pro - 互動式單字記憶與學習闖關系統

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-22c55e?logo=github)](https://abel54575457.github.io/flashcard-pro-grade3/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 專為**學生日常單字累積、課堂互動遊戲與考前衝刺複習**量身打造的高效數位字卡闖關系統。  
> 預載完整收錄《升科大四技－觀光餐旅業導論 (2027 最新版) 單字手冊 (74G7104X)》全書 **8 大章、130 個小節分類、2,196 個專業核心單字、術語與全球航運代碼**。  
> **100% 零伺服器成本、免帳密登入、免 LINE 依賴、即開即用**，內建 **Google 試算表成績自動統整系統**。  
> 任何學科教師與開發者均可 **Fork / Clone 本專案，只需替換單字題庫檔案，5 分鐘即可生成專屬教學遊戲！**

---

### 🌐 線上即刻體驗 (Live Demo)
👉 **立即遊玩：[https://abel54575457.github.io/flashcard-pro-grade3/](https://abel54575457.github.io/flashcard-pro-grade3/)**  
*(支援電腦、平板、iPhone、Android 及課堂電子白板，免安裝任何 App)*

---

## 📋 目錄 (Table of Contents)
1. [🌟 系統核心亮點](#-系統核心亮點)
2. [🎮 三大專注學習模式與輔助系統](#-三大專注學習模式與輔助系統)
3. [🛠️ 如何複製改造成專屬於你的遊戲（5 分鐘換題庫指南）](#️-如何複製改造成專屬於你的遊戲5-分鐘換題庫指南)
4. [📊 免費 Google 試算表全班成績統整機制](#-免費-google-試算表全班成績統整機制)
5. [👩‍🏫 教師管理後台與全冊總表列印](#-教師管理後台與全冊總表列印)
6. [💻 本機開發與指令說明](#-本機開發與指令說明)
7. [📁 專案架構目錄說明](#-專案架構目錄說明)
8. [🤝 開源授權與貢獻](#-開源授權與貢獻)

---

## 🌟 系統核心亮點

* 📚 **海量題庫支援與小節精準篩選 (Section Filter)**：
  - 預載 2,196 個完整單字庫。
  - 每個章節關卡均提供「單字本小節分類挑選」下拉選單，學生可整章全面複習，也可針對特定小節（如「3-14 餐飲外場人員」、「6-6 航空公司代碼」）進行精準特訓。
* 🎴 **三大專注學習模式（依教學回饋精華萃取）**：
  - 精簡聚焦於 **翻卡記憶**、**聽力測驗** 與 **雙語連連看**，去除繁瑣打字，學習節奏流暢爽快。
* 📌 **自動進度記憶（斷點續刷）**：
  - 刷字卡時隨時離開，系統依座號即時記錄停留單字。下次進入同關卡時上方自動提示：`「發現上次進度！是否接續第 X 字？」`，支援一鍵續刷或從頭複習。
* ⚡ **雙語連連看 Fast-Tap 極速反應優化**：
  - 錯誤反饋延遲縮短至 350ms，並支援「搶先點擊 (Fast-Tap)」，中途點擊新卡片零秒直接翻開，告別卡頓感。
* 🗣️ **清晰雙面音標與 Web Speech 語音朗讀**：
  - 卡片正反面皆清晰標註 KK/IPA 音標讀音。
  - 瀏覽器原生 Web Speech API 朗讀，支援美式標準英語發音與 0.8x 慢速 / 1.0x 正常速度切換。
* 🧠 **萊特納間隔重複演算法 (Leitner Spaced Repetition)**：
  - 內建 5 個記憶盒（Leitner Boxes），答對升級、答錯退回 Box 1，自動計算今日到期單字，打造永久長期記憶。
* 👥 **座號免密碼登入 + 訪客全功能試用**：
  - 首頁點選座號（01 ~ 35 號）免密碼一秒登入；提供獨立「訪客試用」按鈕，全關卡全功能無條件暢玩，且不污染正式班級榜單。
* 🏆 **305 班即時英雄榜**：
  - 即時呈現全班同學總星星數、熟練度百分比與連續學習天數，激發自主學習動機。
* 📊 **Google 試算表自動成績統整（零雲端月租費）**：
  - 透過 Google Apps Script (GAS) 輕量架構，學生闖關答題時背景自動同步成績至老師指定的 Google 試算表，自動建立總表分頁與作答流水帳！

---

## 🎮 三大專注學習模式與輔助系統

| 模式名稱 | 特色與學習機制 | 適用時機 |
| :--- | :--- | :--- |
| **🎴 翻卡記憶 (Flashcards)** | 3D 翻轉卡片。正面顯示英文、發音與音標；反面中文釋義與單字手冊頁碼出處。支援「熟記 / 模糊 / 忘記」自我評定，並具備**斷點續刷進度記憶**。 | 課前預習、發音熟記、初次認知 |
| **🎧 聽力測驗 (Listening Quiz)** | 真人語音朗讀，題目僅播放發音，考驗聽力辨識中文或英文，四選一即時計分。 | 強化聽覺記憶、統測聽力訓練 |
| **🧩 雙語連連看 (Matching Game)** | 英文單字與中文解釋隨機排列，進行連線配對。350ms 超快節奏反饋 + Fast-Tap 零秒翻牌。 | 課堂破冰、小組競賽、直覺反應 |
| **📖 錯題本 (Mistake Notebook)** | 依據萊特納曲線自動篩選歷史答錯或待複習的單字，精準查漏補缺。 | 考前衝刺、個別化弱點補強 |
| **🏆 305 班英雄榜 (Leaderboard)** | 即時統計全班 35 位座號總星星數、熟練度百分比與連續學習天數。 | 學習動機、成果驗收 |
| **📊 Google 試算表統整** | 教師後台專屬功能，背景自動同步 35 位學生最新成績，自動建立總表分頁與作答歷程流水帳。 | 教學成績登記、學習歷程檔案 |

---

## 🛠️ 如何複製改造成專屬於你的遊戲（5 分鐘換題庫指南）

想要把這個遊戲改成您自己學校、班級、其他學科（如高中英文、國中會考、日文五十音、護理術語、地理歷史）？只需要 5 個簡單步驟：

### 步驟 1：Fork 或 Clone 本專案
點擊本頁面右上角的 **Fork** 按鈕，或者在終端機執行：
```bash
git clone https://github.com/Abel54575457/flashcard-pro-grade3.git my-flashcard-app
cd my-flashcard-app
npm install
```

### 步驟 2：替換成您自己的題庫資料 (`src/data/grade3Words.ts`)
開啟 `src/data/grade3Words.ts`，將裡面的單字清單替換成您的學科內容。每個單字物件符合以下 TypeScript 格式：

```typescript
export interface WordItem {
  id: string;                // 唯一代碼 (如 "u1-01", "voc_001")
  levelId: number;           // 關卡編號 (1 ~ 8)
  word: string;              // 題目 / 英文單字 / 日文 / 術語
  phonetic?: string;         // 音標 / 讀音 / 假名 (選填)
  translation: string;       // 中文釋義 / 答案
  partOfSpeech?: string;     // 詞性 (如 "n.", "v.", "adj.") (選填)
  exampleEn?: string;        // 英文例句 / 題目說明 (選填)
  exampleZh?: string;        // 例句中文翻譯 (選填)
  category: string;          // 單元或小節分類名稱 (如 "Unit 1 生活日常", "餐飲外場")
  sectionCode?: string;      // 小節編號 (如 "1-1", "3-2") (選填)
  hint?: string;             // 提示訊息或課本頁碼 (選填)
  page?: number;             // 頁碼 (選填)
}
```

> 💡 **小秘訣**：本架構不限於英文！若題庫是日語、韓語或專業科目概念（如「名詞 / 解釋」），都可以直接填入 `word` 與 `translation`！

### 步驟 3：自訂班級名稱與學生人數
若您的班級不是「305 班」或人數不是 35 人：
1. **修改座號人數**：
   在 `src/components/LoginModal.tsx` 與 `src/components/Leaderboard.tsx` 中，找到：
   ```typescript
   export const SEAT_NUMBERS = Array.from({ length: 35 }, (_, i) => String(i + 1).padStart(2, '0'));
   ```
   將 `35` 改為您的班級學生人數（如 `30` 或 `40`）。
2. **修改班級名稱**：
   全域搜尋 `305`，替換為您的班級（例如 `高三甲` 或 `Class 201`）。

### 步驟 4：設定 GitHub Actions 自動發布 (完全免費)
本專案已內建 `.github/workflows/deploy.yml` 自動部署腳本，完全免手動操作：
1. 在您個人的 GitHub 倉庫頁面，進入 **Settings** ➔ **Pages**。
2. 在 **Build and deployment** 下方的 **Source**，切換為 **GitHub Actions**。
3. 在本機專案執行提交並推送：
   ```bash
   git add .
   git commit -m "feat: 替換為我的專屬單字題庫與班級設定"
   git push origin main
   ```
4. 約 30 ~ 60 秒後，GitHub 就會自動將您的網站發布在：
   `https://您的GitHub帳號.github.io/您的倉庫名稱/`

### 步驟 5：（選用）串接教師自己的 Google 試算表
想要隨時在手機上看全班學生的練習成績？
1. 請參閱專案內的完整圖文指引：[`GOOGLE_SHEETS_成績統整教學.md`](./GOOGLE_SHEETS_成績統整教學.md)。
2. 將專案中的 [`成績統計_Google試算表腳本.gs`](./成績統計_Google試算表腳本.gs) 貼到您的 Google Apps Script。
3. 部署為 Web App 並把網址填入遊戲的「👩‍🏫 教師管理後台」，即可啟用即時成績收集！

---

## 📊 免費 Google 試算表全班成績統整機制

本系統創新採用 **Google Apps Script (GAS) 輕量無伺服器架構**，徹底解決教育現場缺乏資料庫維護經費的痛點：

```mermaid
flowchart LR
    A["學生平板/手機 (答題破關)"] -->|"非同步背景送出 (Fetch)"| B["Google Apps Script (Web App)"]
    B -->|"自動寫入"| C["老師的 Google 試算表 (雲端硬碟)"]
    C --> D["分頁1：全班35人總成績表"]
    C --> E["分頁2：作答歷程流水帳"]
```

### 試算表呈現特色：
1. **三年級全班 35 人成績總表**：包含每位座號同學的總星星數、全冊熟練度、解鎖最高章節、各單元狀態（已通關/學習中/未解鎖）及最後上線時間。
2. **闖關歷程流水帳**：精確記錄每位學生完成測驗的確切時間、模式（聽力、連連看、翻卡）、小節分類、得分與正確率。

---

## 👩‍🏫 教師管理後台與全冊總表列印

* **後台安全進入**：
  - 首頁右上角點擊「👩‍🏫 教師管理後台」。
  - 系統預設通行碼為：`teacher888`。
  - 登入後可在後台點擊「修改安全密碼」隨時更換，避免學生猜中。
* **主要管理功能**：
  - **全班成績監控**：即時掌握 35 位學生整體熟練進度與待複習狀況。
  - **題庫匯入 / 匯出**：支援標準 CSV 格式一鍵匯出或批次匯入新單字。
  - **一鍵重置題庫**：誤改資料時，可隨時還原回系統官方預設題庫。
  - **Google 試算表一鍵手動推送**：隨時手動觸發全班最新成績傳送。
* **📖 全冊單字總表 (Vocabulary Master List)**：
  - 首頁點擊「📖 開啟全冊單字總表」，快速查閱全冊單字。
  - 支援關鍵字搜尋（輸入中文、英文或小節代號如 `1-1` 即時過濾）。
  - 支援「網格卡片」與「表格清單」雙檢視切換。
  - 支援「列印 / 存為 PDF」功能，一鍵輸出高品質紙本單字複習對照表。

---

## 💻 本機開發與指令說明

### 系統需求
- [Node.js](https://nodejs.org/) (建議 v18 或 v20 以上版本)
- npm 或 pnpm

### 常用命令
```bash
# 安裝相依套件
npm install

# 啟動本機開發伺服器 (包含手機區域網路測試)
npm run dev

# 執行 TypeScript 與 Vite 生產環境建置
npm run build

# 本地預覽編譯後的成果
npm run preview
```

---

## 📁 專案架構目錄說明

```
三年級記憶字卡/
├── .github/workflows/deploy.yml  # GitHub Pages 自動化發布工作流
├── public/                       # 靜態資源 (圖示、favicon)
├── src/
│   ├── assets/                   # 圖示與圖片資產
│   ├── components/               # React 核心元件
│   │   ├── ErrorBoundary.tsx     # 容錯邊界保護
│   │   ├── FlashcardMode.tsx     # 模式 1：3D 雙面翻卡朗讀（具備斷點續刷）
│   │   ├── GuideModal.tsx        # 通關指南與間隔重複記憶說明
│   │   ├── Leaderboard.tsx       # 305 班全班同學真實英雄榜
│   │   ├── LevelSelector.tsx     # 首頁：8 大單元與單字本小節分類挑選
│   │   ├── ListeningQuiz.tsx     # 模式 2：聽力選字四選一測驗
│   │   ├── LoginModal.tsx        # 35 位座號選擇與訪客試用對話框
│   │   ├── MemoryMatchGame.tsx   # 模式 3：雙語連連看（350ms Fast-Tap 極速版）
│   │   ├── MistakeNotebook.tsx   # 萊特納錯題本與待複習池
│   │   ├── Navbar.tsx            # 頂部導覽列 (座號/訪客、星星、語速)
│   │   ├── TeacherDashboard.tsx  # 教師管理儀表板
│   │   └── VocabularyMasterListModal.tsx # 全冊單字查閱與 PDF 列印
│   ├── data/
│   │   └── grade3Words.ts        # 全冊 8 章、130 小節、2,196 單字資料庫
│   ├── services/
│   │   ├── firebase.ts           # Firebase 選用雲端資料庫（非必要）
│   │   ├── liff.ts               # 解除 LINE 相依性之獨立安全適配器
│   │   ├── soundEffects.ts       # Web Audio API 原生音效合成器
│   │   ├── spacedRepetition.ts   # 萊特納間隔重複演算法核心
│   │   ├── storage.ts            # LocalStorage 進度儲存與斷點續刷引擎
│   │   └── tts.ts                # Web Speech API 語音朗讀引擎
│   ├── types/
│   │   └── index.ts              # TypeScript 型態定義 (WordItem, UserProfile)
│   ├── utils/
│   │   ├── confettiHelper.ts     # 通關彩帶粒子特效
│   │   └── csvHelper.ts          # CSV 單字匯入/匯出解析器
│   ├── App.tsx                   # 應用程式主邏輯與狀態管理
│   ├── main.tsx                  # React 應用程式入口
│   └── index.css                 # Tailwind CSS 樣式設定
├── 成績統計_Google試算表腳本.gs   # 教師試算表 GAS 完整程式碼
├── GOOGLE_SHEETS_成績統整教學.md # Google 試算表串接圖文教學
├── VOCABULARY_LIST.md            # 全冊 2,196 單字小節完整對照清單
├── WORKFLOW.md                   # 系統軟體架構與維護指南
├── WORKFLOW_GAME_CREATION_BLUEPRINT.md # 全新學科遊戲開發通用藍圖
├── WORKFLOW_NO_FIREBASE.md       # 免伺服器極簡自動化開發 SOP
├── package.json                  # 專案依賴與腳本
├── vite.config.ts                # Vite 構建配置 (採用相對路徑 base: './')
└── README.md                     # 專案說明文件 (本檔案)
```

---

## 🤝 開源授權與貢獻

本專案採用 **[MIT License](https://opensource.org/licenses/MIT)** 開源授權。  
歡迎所有熱心教育的教師、開發者與同學們自由 Fork、改編、應用於各種教學場景！  

*若這個專案對您的教學或學習有所幫助，歡迎在右上角點個 ⭐️ **Star** 給予我們支持與鼓勵！*
