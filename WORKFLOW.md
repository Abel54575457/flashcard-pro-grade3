# 🎮 FlashCard Pro - 三年級觀光餐旅業導論單字複習系統：軟體設計與開發工作流程指南 (Workflow Blueprint)

> **版本**：v3.0 (2026-09 最新三年級升學版)  
> **專案位置**：`h:\我的雲端硬碟\116年\AI專區\三年級記憶字卡`  
> **單字手冊出處**：升科大四技《觀光餐旅業導論 (2027 最新版) 單字手冊 (74G7104X)》  
> **單字總數**：2,196 單字（涵蓋全書 8 大章、130 個小節分類）

---

## 📋 目錄
1. 🎯 **核心架構與技術選型 (Tech Stack & Architecture)**
2. 📚 **全書 2,196 單字庫與小節分類設計 (Data & Classification Schema)**
3. 👥 **座號登入機制與訪客試用設計 (35 Seats & Guest Trial)**
4. 🧠 **萊特納間隔重複演算法 (Leitner Spaced Repetition System)**
5. 🌐 **完全解除 LINE 相依性之獨立網頁架構 (Zero-Dependency Web Architecture)**
6. 📖 **全冊單字總表與預習/列印模組 (Master List & PDF Export)**
7. 👩‍🏫 **教師管理儀表板 (Teacher Dashboard)**
8. 🚀 **一鍵編譯與部署指南 (Build & Deployment)**
9. 🔄 **後續維護與擴充作業標準程序 (Agent Maintenance SOP)**

---

## 1. 🎯 核心架構與技術選型 (Tech Stack & Architecture)

- **前端框架**：React 19 + TypeScript 5.7 + Vite 6
- **UI 樣式庫**：Tailwind CSS + Lucide React 圖示庫
- **動畫特效**：Canvas Confetti 特效（通關慶祝，1.2 秒自動淡出清理）
- **音效系統**：Web Audio API 自建即時波形合成器（答對、升級、按鍵反饋，零外部音檔依賴）
- **語音朗讀**：Web Speech Synthesis API（原生美式英語發音，支援 0.8x 慢速與 1.0x 正常速度切換）
- **持久化儲存**：LocalStorage 專屬隔離快取（`flashcard_pro_g3_` 前綴，無損雙向合併進度）
- **雲端資料庫**：Firebase Firestore（選用，支援全班 35 位同學即時英雄榜，訪客不干擾班級排行）

---

## 2. 📚 全書 2,196 單字庫與小節分類設計 (Data & Classification Schema)

所有單字均嚴格對應單字手冊 (74G7104X) 頁碼與小節編號，儲存於 `src/data/grade3Words.ts`：

```typescript
export interface WordItem {
  id: string;                // 唯一代碼 (e.g., "w_g3_0001")
  levelId: number;           // 關卡等級 (Unit 1 ~ Unit 8)
  word: string;              // 英文單字 / 核心術語 / 機場代碼
  phonetic?: string;         // 音標或讀音
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
- **Unit 2**：第二章 觀光餐旅業之從業理念（語音 2-1 ~ 2-2，共 48 字）
- **Unit 3**：第三章 餐飲業核心專業（語音 3-1 ~ 3-33，共 553 字）
- **Unit 4**：第四章 旅宿業經營與管理（語音 4-1 ~ 4-37，共 625 字）
- **Unit 5**：第五章 旅行業產品與票務（語音 5-1 ~ 5-21，共 514 字）
- **Unit 6**：第六章 觀光餐旅相關產業與代碼（語音 6-1 ~ 6-21，共 239 字，含全球航司與城市代碼）
- **Unit 7**：第七章 觀光餐旅行銷與策略（語音 7-1 ~ 7-11，共 144 字）
- **Unit 8**：第八章 觀光餐旅業的現況與未來（CD 8-1，共 12 字）

### 依單字本分類直接使用機制 (Section Filtering)：
在 `LevelSelector` 關卡卡片上，每個單元均提供下拉選單，學生可：
1. 選擇「🌟 全部小節分類 (全章練習)」，或
2. 選擇「語音 3-14 餐飲業外場人員 (24 字)」、「語音 6-6 航空公司代碼 (47 字)」等特定小節，點擊閃卡、聽力、配對或拼字，系統即**只抽取該小節單字進行針對性精熟測驗**！

---

## 3. 👥 座號登入機制與訪客試用設計 (35 Seats & Guest Trial)

- **35 位同學專屬座號**：
  - 登入 Modal 提供 `01` 到 `35` 號網格按鈕，學生一鍵點選即可登入。
  - 個人主題色彩支援 5 種風格（翡翠綠、寶石藍、紫晶、琥珀金、珊瑚紅）。
  - 連續學習天數、答題星星點數與各單字盒位獨立保存。
- **訪客試用專區 (Guest Mode)**：
  - 登入介面顯著配置「🎁 訪客試用體驗」按鈕。
  - 點擊後設定座號為「訪客」，**預設自動解鎖全冊 8 大關卡**。
  - 訪客可完整體驗全部 2,196 單字、語音發音與 5 大遊戲模式，但不會寫入或污染 35 位同學的班級排行榜。

---

## 4. 🧠 萊特納間隔重複演算法 (Leitner Spaced Repetition System)

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

## 5. 🌐 完全解除 LINE 相依性之獨立網頁架構 (Zero-Dependency Web Architecture)

- **移除原因**：依教學需求，三年級升學版專注於即時網頁複習，不需額外綁定 LINE 官方帳號、Messaging API 推播或 LIFF 初始化。
- **實現方式**：
  - `src/services/liff.ts` 改造為安全無副作用之輕量 Adapter，回傳純網頁預設值。
  - 完全消除 LINE LIFF 401/403 報錯、CORS 跨境請求攔截與初始化卡死問題。
  - 任何終端裝置（Windows, Mac, iOS Safari, Android Chrome, Chromebook）無須登入 LINE 均能 100% 流暢運行。

---

## 6. 📖 全冊單字總表與預習/列印模組 (Master List & PDF Export)

- **檔案位置**：`src/components/VocabularyMasterListModal.tsx`
- **功能特色**：
  - **即時搜尋**：輸入英文、中文釋義、或小節代號（如 `1-1`, `6-10`）即時篩選。
  - **章節與分類過濾**：雙層下拉選單，支援選擇特定單元與小節。
  - **雙重視覺模式**：卡片式 (Grid) 與表格對照清單 (Table) 一鍵切換。
  - **列印支援**：點擊「列印 / 存為 PDF」，自動套用 CSS Print 樣式，產生排版工整之紙本複習清單。

---

## 7. 👩‍🏫 教師管理儀表板 (Teacher Dashboard)

- **安全通行碼**：`205` 或 `admin`。
- **功能總覽**：
  - 監控全班 35 位同學之星星數、熟練度與最後活躍時間。
  - 支援 CSV 匯出全班單字庫與匯入新題庫。
  - 一鍵「重置回三年級單字手冊官方 2,196 單字」，避免資料庫誤改。

---

## 8. 🚀 一鍵編譯與部署指南 (Build & Deployment)

### 本地測試
```bash
npm run dev
```

### 生產建置
```bash
npm run build
```
輸出資料夾為 `dist/`，內含優化後之 HTML、JS 與 CSS 資源。

### 部署至 GitHub Pages
```bash
npm run deploy
```

---

## 9. 🔄 後續維護與擴充作業標準程序 (Agent Maintenance SOP)

其他 AI Agent 若需更新或擴充本專案，請遵循以下步驟：
1. **單字異動**：直接編輯 `src/data/grade3Words.ts`，並同步更新 `VOCABULARY_LIST.md`。
2. **座號調整**：若班級人數異動，於 `src/components/LoginModal.tsx` 與 `src/components/Leaderboard.tsx` 修改 `SEAT_NUMBERS` 常數即可。
3. **編譯驗證**：任何程式變更後，務必於終端機執行 `npm run build` 確認 TypeScript 型態檢查通過。
