/**
 * ==========================================================================
 * 🎴 FlashCard Pro 三年級觀光餐旅業導論 — Google 試算表成績統整腳本 (GAS)
 * ==========================================================================
 * 
 * 💡【3 分鐘快速部屬教學】：
 * 1. 在您的 Google 雲端硬碟中「建立新的 Google 試算表」，可命名為「三年級觀光餐旅業導論_單字閃卡成績總表」。
 * 2. 點擊試算表頂端選單的【擴充功能】->【Apps Script】。
 * 3. 將本檔案的所有程式碼「全部複製」，並「貼上」覆蓋 Apps Script 編輯器中的所有內容。
 * 4. 點擊右上角藍色的【部署】->【新部署】。
 * 5. 點擊左側齒輪 ⚙️【選取類型】，選擇【網頁應用程式】(Web app)。
 * 6. 設定：
 *    - 說明：三年級單字成績統整
 *    - 執行身分：我 (您的 Google 帳號)
 *    - 誰可以存取：所有人 (Anyone)  <-- ⭐非常重要！必須選「所有人」學生手機才能回傳成績
 * 7. 點擊【部署】，若彈出權限確認，請點擊「進階 (Advanced)」->「前往... (安全)」，並允許存取。
 * 8. 複製產生的【網頁應用程式網址】(以 https://script.google.com/macros/s/.../exec 結尾)。
 * 9. 回到閃卡遊戲的「👩‍🏫 教師管理後台」，在「Google 試算表統整」處貼上此網址即可！
 * ==========================================================================
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: '🎴 三年級記憶字卡 Google 試算表成績統整 API 正常運作中！',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var raw = e.postData.contents;
    var data = JSON.parse(raw);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.action === 'sync_student') {
      handleSyncStudent(ss, data.data);
    } else if (data.action === 'batch_sync') {
      handleBatchSync(ss, data.students);
    } else if (data.action === 'log_quiz') {
      handleLogQuiz(ss, data);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      action: data.action
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 取得或建立「全班 35 人成績總表」分頁
 */
function getOrCreateSummarySheet(ss) {
  var sheetName = "三年級全班35人成績總表";
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName, 0);
    
    // 表頭
    var headers = [
      "座號", "總星星數 (⭐)", "最高解鎖章節", "全冊單字熟練度", 
      "連續天數", "最後上線時間",
      "第1章", "第2章", "第3章", "第4章", "第5章", "第6章", "第7章", "第8章"
    ];
    sheet.appendRow(headers);
    
    // 表頭樣式美化
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#1e293b"); // 深藍灰色
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);

    // 預先產生 01 ~ 35 號空白名冊
    var initialRows = [];
    for (var i = 1; i <= 35; i++) {
      var seat = (i < 10 ? "0" : "") + i;
      initialRows.push([
        seat, 0, "第 1 章", "0%", 1, "尚未開始",
        "未開始", "未解鎖", "未解鎖", "未解鎖", "未解鎖", "未解鎖", "未解鎖", "未解鎖"
      ]);
    }
    sheet.getRange(2, 1, initialRows.length, headers.length).setValues(initialRows);
    sheet.getRange(2, 1, initialRows.length, headers.length).setHorizontalAlignment("center");
    
    // 設定欄寬
    sheet.setColumnWidth(1, 80);  // 座號
    sheet.setColumnWidth(2, 110); // 星星
    sheet.setColumnWidth(3, 120); // 解鎖
    sheet.setColumnWidth(4, 130); // 熟練度
    sheet.setColumnWidth(5, 90);  // 連續天數
    sheet.setColumnWidth(6, 170); // 最後上線
    for (var col = 7; col <= 14; col++) {
      sheet.setColumnWidth(col, 130);
    }
  }
  
  return sheet;
}

/**
 * 取得或建立「闖關與測驗歷程流水帳」分頁
 */
function getOrCreateLogSheet(ss) {
  var sheetName = "闖關歷程流水帳";
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    var headers = [
      "紀錄時間", "座號", "挑戰模式", "章節", "小節分類", 
      "得分", "正確率 (%)", "答對題數", "總題數"
    ];
    sheet.appendRow(headers);
    
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0f766e"); // 墨綠色
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
    
    sheet.setColumnWidth(1, 170); // 時間
    sheet.setColumnWidth(2, 80);  // 座號
    sheet.setColumnWidth(3, 120); // 模式
    sheet.setColumnWidth(4, 100); // 章節
    sheet.setColumnWidth(5, 200); // 小節
    sheet.setColumnWidth(6, 80);  // 得分
    sheet.setColumnWidth(7, 110); // 正確率
    sheet.setColumnWidth(8, 90);  // 答對
    sheet.setColumnWidth(9, 90);  // 總數
  }
  
  return sheet;
}

/**
 * 處理單一學生進度更新
 */
function handleSyncStudent(ss, student) {
  if (!student || !student.seatNumber || student.seatNumber === '訪客') return;
  var sheet = getOrCreateSummarySheet(ss);
  var data = sheet.getDataRange().getValues();
  
  var targetRow = -1;
  var targetSeat = student.seatNumber.toString().trim();
  if (targetSeat.length === 1) targetSeat = "0" + targetSeat;

  for (var i = 1; i < data.length; i++) {
    var rowSeat = data[i][0].toString().trim();
    if (rowSeat.length === 1) rowSeat = "0" + rowSeat;
    if (rowSeat === targetSeat) {
      targetRow = i + 1;
      break;
    }
  }

  var timeStr = Utilities.formatDate(new Date(), "Asia/Taipei", "yyyy-MM-dd HH:mm:ss");
  var u = student.unitsSummary || {};

  var rowValues = [
    targetSeat,
    student.stars || 0,
    "第 " + (student.unlockedLevel || 1) + " 章",
    (student.masteryRate || 0) + "%",
    student.streakDays || 1,
    timeStr,
    u["Unit1"] || "學習中",
    u["Unit2"] || "未開始",
    u["Unit3"] || "未開始",
    u["Unit4"] || "未開始",
    u["Unit5"] || "未開始",
    u["Unit6"] || "未開始",
    u["Unit7"] || "未開始",
    u["Unit8"] || "未開始"
  ];

  if (targetRow > 0) {
    sheet.getRange(targetRow, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
}

/**
 * 處理全班批次同步
 */
function handleBatchSync(ss, students) {
  if (!students || !students.length) return;
  for (var i = 0; i < students.length; i++) {
    handleSyncStudent(ss, students[i]);
  }
}

/**
 * 記錄闖關歷程流水號
 */
function handleLogQuiz(ss, logData) {
  if (!logData || logData.seatNumber === '訪客') return;
  var sheet = getOrCreateLogSheet(ss);
  var timeStr = Utilities.formatDate(new Date(), "Asia/Taipei", "yyyy-MM-dd HH:mm:ss");

  var rowValues = [
    timeStr,
    logData.seatNumber,
    logData.modeName,
    logData.unit,
    logData.sectionTitle || "全章複習",
    logData.score,
    (logData.accuracy || 0) + "%",
    logData.correctCount,
    logData.totalCount
  ];

  sheet.appendRow(rowValues);
}
