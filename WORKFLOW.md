# 🎮 FlashCard Pro - 三年級觀光餐旅業導論單字複習系統：軟體設計與開發工作流程指南 (Workflow Blueprint)

> **版本**：v3.2 (2026-09 最新三年級升學版)  
> **專案位置**：`H:\我的雲端硬碟\116年\AI專區\三年級記憶字卡`  
> **單字手冊出處**：升科大四技《觀光餐旅業導論 (2027 最新版) 單字手冊 (74G7104X)》  
> **單字總數**：2,196 單字（涵蓋全書 8 大章、130 個小節分類）  
> **開源線上網址**：https://abel54575457.github.io/flashcard-pro-grade3/

---

## 📋 目錄
1. 🎯 **核心架構與技術選型 (Tech Stack & Architecture)**
2. 📚 **全書 2,196 單字庫與小節分類設計 (Data & Classification Schema)**
3. 👥 **座號登入機制與訪客試用設計 (305 班 35 位同學 & 訪客模式)**
4. 🎮 **三大專注學習模式與效能優化 (Flashcards, Listening, Fast-Tap Match)**
5. 🧠 **萊特納間隔重複演算法 (Leitner Spaced Repetition System)**
6. 📊 **Google 試算表成績自動統整無伺服器架構 (Google Sheets & GAS)**
7. 🌐 **完全解除 LINE 相依性之獨立網頁架構 (Zero-Dependency Web Architecture)**
8. 📖 **全冊單字總表與預習/列印模組 (Master List & PDF Export)**
9. 👩‍🏫 **教師管理儀表板 (Teacher Dashboard)**
10. 🚀 **一鍵編譯與 GitHub Actions 自動部署指南 (Build & Deployment)**
11. 🔄 **後續維護與快速換題庫擴充標準程序 (Agent Maintenance & Replication SOP)**

---

## 1. 🎯 核心架構與技術選型 (Tech Stack & Architecture)

- **前端框架**：React 19 + TypeScript 5.7 + Vite 6
- **UI 樣式庫**：Tailwind CSS + Lucide React 圖示庫
- **動畫特效**：Canvas Confetti 特效（通關慶祝，自動清理資源）
- **音效系統**：Web Audio API 自建即時波形合成器（答對、升級、按鍵反饋，零外部音檔依賴）
- **語音朗讀**：Web Speech Synthesis API（原生美式英語發音，支援 0.8x 慢速與 1.0x 正常速度切換）
- **本機快取與進度**：LocalStorage 專屬隔離快取（`flashcard_pro_g3_` 前綴，支援斷點續刷）
- **成績統整**：Google Apps Script (GAS) Web App + Google 試算表（免伺服器費用，全班成績自動成表）
- **代管與 CI/CD**：GitHub Pages + GitHub Actions（Push 即自動編譯部署）

---

## 2. 📚 全書 2,196 單字庫與小節分類設計 (Data & Classification Schema)

所有單字均嚴格對應單字手冊 (74G7104X) 頁碼與小節編號，儲存於 `src/data/grade3Words.ts`：

```typescript
export interface WordItem {
  id: string;                // 唯一代碼 (e.g., "w_g3_0001")
  levelId: number;           // 關卡等級 (Unit 1 ~ Unit 8)
  word: string;              // 英文單字 / 核心術語 / 機場代碼
  phonetic?: string;         // 音標或讀音 (IPA / KK 音標)
  translation: string;       // 中文釋義
  partOfSpeech?: string;     // 詞性
  exampleEn?: string;        // 英文例句 / 英文說明
  exampleZh?: string;        // 中文例句 / 釋義
  category: string;          // 小節分類名稱 (e.g., "1-1 觀光餐旅業的定義")
  sectionCode?: string;      // 小節代碼 (e.g., "1-1", "3-14", "6-6")
  chapter?: string;          // 所屬章節全名
  hint?: string;             // 單字手冊頁碼提示 (e.g., "【1-1】單字手冊 p.6")
  page?: number;             // 單字手冊對應頁碼
}
```

### 八大單元與章節劃分：
- **Unit 1**：第一章 觀光餐旅業基本觀念（語音 1-1 ~ 1-4，共 61 字）
- **Unit 2**：第二章 觀光餐旅業之從業理念（語音 1-4 ~ 2-2，共 48 字）
- **Unit 3**：第三章 餐飲業核心專業（語音 3-1 ~ 3-33，共 553 字）
- **Unit 4**：第四章 旅宿業經營與管理（語音 4-1 ~ 4-37，共 625 字）
- **Unit 5**：第五章 旅行業產品與票務（語音 5-1 ~ 5-21，共 514 字）
- **Unit 6**：第六章 觀光餐旅相關產業與代碼（語音 6-1 ~ 6-21，共 239 字，含全球航司與城市代碼）
- **Unit 7**：第七章 觀光餐旅行銷與策略（語音 7-1 ~ 7-11，共 144 字）
- **Unit 8**：第八章 觀光餐旅業的現況與未來（語音 8-1，共 12 字）

### 依單字本分類直接使用機制 (Section Filtering)：
在 `LevelSelector` 關卡卡片上，每個單元均提供下拉選單，學生可：
1. 選擇「🌟 全部小節分類 (全章練習)」，或
2. 選擇「語音 3-14 餐飲業外場人員 (24 字)」、「語音 6-6 航空公司代碼 (47 字)」等特定小節，點擊閃卡、聽力或配對，系統即**只抽取該小節單字進行針對性精熟測驗**！

---

## 3. 👥 座號登入機制與訪客試用設計 (305 班 35 位同學 & 訪客模式)

- **305 班同學專屬座號**：
  - 登入 Modal 提供 `01` 到 `35` 號網格按鈕，學生一鍵點選即可登入，免除忘記密碼困擾。
  - 個人主題色彩支援 5 種風格（翡翠綠、寶石藍、紫晶、琥珀金、珊瑚紅）。
  - 連續學習天數、答題星星點數與各單字盒位獨立保存。
- **訪客試用專區 (Guest Mode)**：
  - 登入介面顯著配置「🎁 訪客試用體驗」按鈕。
  - 點擊後設定座號為「訪客」，**預設自動解鎖全冊 8 大關卡**。
  - 訪客可完整體驗全部 2,196 單字、語音發音與各學習模式，但不會寫入或干擾 35 位同學的班級排行榜。

---

## 4. 🎮 三大專注學習模式與效能優化

### A. 🎴 翻卡記憶 (Flashcards) & 斷點續刷 (Resume Progress)
- **正面**：英文單字、真人發音按鈕、清晰 KK/IPA 音標標註。
- **反面**：中文釋義、詞性、例句、音標與單字手冊頁碼出處。
- **斷點續刷機制**：
  - 透過 `saveDeckProgress(seatNumber, deckKey, currentIndex, totalWords)` 即時儲存卡片索引。
  - 學生中途關閉瀏覽器或跳出，下次點入同一關時，上方自動顯示：
    `「📌 發現上次學習進度！您上次練習停留在第 X / Y 個單字，是否直接接續？」`
  - 提供 `[▶️ 繼續進度 (第 X 字)]` 與 `[🔄 從頭開始]`，大幅提升多單字大關卡的練習體驗。

### B. 🎧 聽力測驗 (Listening Quiz)
- 原生美式發音朗讀，題目僅播放音訊，學生必須聽音辨字。
- 四選一即時計分、連勝加成、音效反饋，訓練統測聽力辨識直覺。

### C. 🧩 雙語連連看 (Memory Match) & Fast-Tap 極速反應
- 左右隨機排布中英卡片，直覺消除。
- **極速反饋**：配對錯誤等待時間由 1000ms 降至 **350ms**，並具備紅色脈衝提示。
- **Fast-Tap 搶先點擊**：在 350ms 錯誤提示中若玩家點擊其他卡片，計時器立即中斷、錯卡直接翻回、新卡片**零延遲翻開**，徹底解決卡頓感。

---

## 5. 🧠 萊特納間隔重複演算法 (Leitner Spaced Repetition System)

- **檔案位置**：`src/services/spacedRepetition.ts`
- **五個記憶箱位排程**：
  - **Box 1**：新單字或剛答錯（間隔 1 天後複習）
  - **Box 2**：初步記憶（間隔 2 天後複習）
  - **Box 3**：中期記憶（間隔 4 天後複習）
  - **Box 4**：長期記憶（間隔 7 天後複習）
  - **Box 5**：永久熟練（間隔 15 天後複習）
- **即時動態計算**：
  - 每天開啟系統時，自動篩選目前日期 `>= nextReviewDate` 的單字計入 `dueCount`。
  - 首頁即時提示「今日待複習單字」，點擊一鍵開啟待複習字卡組。

---

## 6. 📊 Google 試算表成績自動統整無伺服器架構 (Google Sheets & GAS)

- **優勢**：教育現場零預算、免申請信用卡、免負擔 Firebase/AWS 月費。
- **傳輸架構**：
  - 學生完成闖關或獲得星星時，前端呼叫 `fetch(googleSheetsUrl, { method: 'POST', mode: 'no-cors' })`。
  - Google Apps Script (GAS) 接收 JSON 酬載後，自動完成兩大作業：
    1. **分頁 1：「三年級全班35人成績總表」**：更新該座號之總星星數、最高章節、全冊熟練度與各章節狀態。
    2. **分頁 2：「闖關歷程流水帳」**：逐筆寫入學生交卷歷程、答對率與時間戳。

---

## 7. 🌐 完全解除 LINE 相依性之獨立網頁架構 (Zero-Dependency Web Architecture)

- **實現方式**：
  - `src/services/liff.ts` 改造為安全無副作用之輕量 Adapter，回傳純網頁預設值。
  - 完全消除 LINE LIFF 401/403 報錯、CORS 跨境請求攔截與初始化卡死問題。
  - 任何終端裝置（Windows, Mac, iOS Safari, Android Chrome, Chromebook）無須登入 LINE 均能 100% 流暢運行。

---

## 8. 📖 全冊單字總表與預習/列印模組 (Master List & PDF Export)

- **檔案位置**：`src/components/VocabularyMasterListModal.tsx`
- **功能特色**：
  - **即時搜尋**：輸入英文、中文釋義、或小節代號（如 `1-1`, `6-10`）即時篩選。
  - **章節與分類過濾**：雙層下拉選單，支援選擇特定單元與小節。
  - **雙重視覺模式**：卡片式 (Grid) 與表格對照清單 (Table) 一鍵切換。
  - **列印支援**：點擊「列印 / 存為 PDF」，自動套用 CSS Print 樣式，產生排版工整之紙本複習清單。

---

## 9. 👩‍🏫 教師管理儀表板 (Teacher Dashboard)

- **安全通行碼**：預設為 `teacher888`（支援於後台自訂新密碼）。
- **功能總覽**：
  - 監控全班 35 位同學之星星數、熟練度與最後活躍時間。
  - 支援 CSV 匯出全班單字庫與匯入新題庫。
  - 一鍵「重置回三年級單字手冊官方 2,196 單字」，避免資料庫誤改。
  - 支援「一鍵手動推送成績至 Google 試算表」。

---

## 10. 🚀 一鍵編譯與 GitHub Actions 自動部署指南 (Build & Deployment)

### 本地測試
```bash
npm run dev
```

### 生產建置
```bash
npm run build
```
輸出資料夾為 `dist/`，內含優化後之 HTML、JS 與 CSS 資源。

### GitHub Pages 自動部署流程
專案配置於 `.github/workflows/deploy.yml`。每次執行 `git push origin main` 時，GitHub Actions 自動於雲端執行 `npm ci` 與 `npm run build`，並發布至 GitHub Pages，全程無須人工干預。

---

## 11. 🔄 後續維護與快速換題庫擴充標準程序 (Agent Maintenance & Replication SOP)

其他 AI Agent 或開發者若需更新或改造本專案：
1. **更換題庫**：直接編輯 `src/data/grade3Words.ts`，並同步更新 `VOCABULARY_LIST.md`。
2. **座號與人數調整**：若班級人數異動，於 `src/components/LoginModal.tsx` 與 `src/components/Leaderboard.tsx` 修改 `SEAT_NUMBERS` 常數即可。
3. **班級名稱調整**：全域搜尋 `305`，替換為目標班級名。
4. **編譯驗證**：任何程式變更後，務必於終端機執行 `npm run build` 確認 TypeScript 型態檢查通過。
