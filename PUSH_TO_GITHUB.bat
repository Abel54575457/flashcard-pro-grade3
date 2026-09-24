@echo off
chcp 65001 >nul
title FlashCard Pro Grade 3 - 推送至 GitHub
color 0b
echo ======================================================================
echo   🎴 FlashCard Pro 三年級 — 一鍵推送專案與完整文件至 GitHub
echo ======================================================================
echo.
echo 正在準備推送最新三年級專案、README.md、工作流藍圖與2196單字庫...
echo 目標倉庫：https://github.com/Abel54575457/flashcard-pro-grade3.git
echo.
cd /d "%~dp0"
git add .
git commit -m "feat: publish grade 3 flashcard system with 2196 words, 35 seats login and guest trial"
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ======================================================================
    echo   ✅ 恭喜！三年級專案已成功上傳至 GitHub！
    echo   👉 倉庫網址：https://github.com/Abel54575457/flashcard-pro-grade3
    echo   🌐 線上遊戲網址：https://abel54575457.github.io/flashcard-pro-grade3/
    echo ======================================================================
) else (
    echo.
    echo ======================================================================
    echo   ❌ 上傳未完成，請確認網路連線或 GitHub 登入授權狀態。
    echo ======================================================================
)

echo.
echo 請按任意鍵結束本視窗...
pause >nul
