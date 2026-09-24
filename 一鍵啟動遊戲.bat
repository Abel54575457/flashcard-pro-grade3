@echo off
chcp 65001 >nul
title FlashCard Pro - 三年級觀光餐旅業導論單字複習系統
color 0b
echo ======================================================================
echo   🎴 FlashCard Pro - 三年級觀光餐旅業導論單字複習系統
echo   收錄全冊 8 大章、130 個小節分類、2,196 個專業核心單字與航運代碼
echo   支援 35 位座號登入與訪客試用體驗 ‧ 100%% 免 LINE 獨立純網頁版
echo ======================================================================
echo.
echo 正在啟動本地遊戲預覽伺服器 (連接埠: 5173)...
echo.
start "" "http://localhost:5173"
python -m http.server 5173 --directory "%~dp0dist"

pause
