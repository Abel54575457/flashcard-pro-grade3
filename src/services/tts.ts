// 高可靠性多國語音朗讀系統 (Web Speech API + 全局解鎖美音/法音/歐語真人 MP3 雙引擎)

let isAudioUnlocked = false;
let globalAudioPlayer: HTMLAudioElement | null = null;

function getOrCreateAudioPlayer(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!globalAudioPlayer) {
    globalAudioPlayer = new Audio();
    globalAudioPlayer.id = 'flashcard-global-audio-player';
  }
  return globalAudioPlayer;
}

// 全局音訊解鎖 (在學生第一次點擊/觸控畫面時解鎖 iOS / Safari / Android 音訊權限)
export function initAudioUnlock(): void {
  if (isAudioUnlocked || typeof window === 'undefined') return;

  const unlock = () => {
    if (isAudioUnlocked) return;
    isAudioUnlocked = true;

    // 1. 解鎖全域 Audio 標籤 (播放靜音片段，獲得手機 Safari/Chrome 永久播音授權)
    const player = getOrCreateAudioPlayer();
    if (player) {
      player.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      player.play().catch(() => {});
    }

    // 2. 預熱 Web Speech API
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
        const silentUtterance = new SpeechSynthesisUtterance('');
        silentUtterance.volume = 0;
        window.speechSynthesis.speak(silentUtterance);
      } catch (e) {
        console.warn('SpeechSynthesis unlock notice:', e);
      }
    }

    window.removeEventListener('click', unlock);
    window.removeEventListener('touchstart', unlock);
    window.removeEventListener('pointerdown', unlock);
  };

  window.addEventListener('click', unlock, { passive: true });
  window.addEventListener('touchstart', unlock, { passive: true });
  window.addEventListener('pointerdown', unlock, { passive: true });
}

export function isTTSSupported(): boolean {
  return typeof window !== 'undefined';
}

/**
 * 智慧語種自動偵測器
 * 依據單字文字、特殊變音符號（如法文 é/è/ê/ô/ç、德文 ä/ö/ü、義大利文）、或傳入的中文釋義線索判斷發音語種
 */
export function detectLanguage(text: string, langOrContext?: string): string {
  if (langOrContext) {
    const hint = langOrContext.toLowerCase();
    if (hint.includes('法文') || hint.includes('法語') || hint === 'fr' || hint.startsWith('fr-')) {
      return 'fr-FR';
    }
    if (hint.includes('德文') || hint.includes('德語') || hint === 'de' || hint.startsWith('de-')) {
      return 'de-DE';
    }
    if (hint.includes('義大利文') || hint.includes('義文') || hint.includes('拉丁文') || hint === 'it' || hint.startsWith('it-')) {
      return 'it-IT';
    }
    if (hint.includes('日文') || hint === 'ja' || hint.startsWith('ja-')) {
      return 'ja-JP';
    }
    if (hint.startsWith('en-') || hint === 'en') {
      return 'en-US';
    }
  }

  const lower = text.toLowerCase().trim();

  // 1. 法文字詞與法文專屬變音符號偵測
  const frenchCharRegex = /[éèêëàâôçîïœæùûÉÈÊÀÂÔÇÎ]/;
  const frenchKeywords = [
    'café', 'caffé', 'bistro', 'restaurant', 'restaurer', 'table d\'hôte', 'maître', 'sommelier',
    'boulanger', 'taverne', 'sauté', 'guéridon', 'débarrasseur', 'estouffade', 'caneton',
    'bourguignon', 'bourguignonne', 'consommé', 'bouillabaisse', 'marseillaise', 'foie gras',
    'truffes', 'mise en place', 'clefs d\'or', 'étoile verte', 'grand hôtel', 'le méridien',
    'niçoise', 'gratin', 'escargots', 'hospice', 'vitesse'
  ];

  if (frenchCharRegex.test(text) || frenchKeywords.some(kw => lower.includes(kw))) {
    return 'fr-FR';
  }

  // 2. 德文字詞偵測
  if (lower.includes('schwarzwälder') || lower.includes('kirschtorte') || /[äöüß]/.test(lower)) {
    return 'de-DE';
  }

  // 3. 義大利文偵測
  if (lower.includes('bottega') || lower.includes('caffè') || lower.includes('milanese') || lower.includes('osso buco') || lower.includes('hospitale')) {
    return 'it-IT';
  }

  // 預設英語 (美語)
  return 'en-US';
}

/**
 * 清理朗讀文字，去除括號中文、符號標記與連字干擾
 */
function sanitizeSpeechText(text: string): string {
  let cleaned = text.trim();

  // 移除全形/半形括號及內部中文（例如："（法文）", "(GRO)"）
  cleaned = cleaned.replace(/[\(（][^()（）]*[\)）]/g, ' ');

  // 移除箭頭符號與分隔號
  cleaned = cleaned.replace(/[→\u2192]/g, ' ');
  cleaned = cleaned.replace(/[、\u3001]/g, ', ');

  // 去除結尾單獨的大寫殘留（如 "sauté vegetable W"）
  cleaned = cleaned.replace(/\s+[A-Z]$/, '');

  // 去除 P: Phone field 中的代號開頭
  cleaned = cleaned.replace(/^[A-Z]:\s*/, '');

  // 壓縮連續空白
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned || text.trim();
}

// 線上真人 MP3 發音引擎 (支援多國語音備援)
function playOnlineMP3(text: string, rate: number = 1.0, targetLang: string = 'en-US'): void {
  const player = getOrCreateAudioPlayer();
  if (!player) return;

  try {
    player.pause();
    const cleanText = sanitizeSpeechText(text);
    if (!cleanText) return;

    player.playbackRate = rate < 0.9 ? 0.75 : 1.0;
    const langPrefix = targetLang.split('-')[0].toLowerCase();

    // 英語優先使用有道美音，非英語或有道失敗時切換至 Google Translate 原生真人發音
    if (langPrefix === 'en') {
      const youdaoUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&type=2`;
      const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=en&client=tw-ob`;

      player.src = youdaoUrl;
      let hasTriedGoogle = false;

      player.onerror = () => {
        if (!hasTriedGoogle) {
          hasTriedGoogle = true;
          player.src = googleUrl;
          player.play().catch((err) => console.warn('Google TTS backup failed:', err));
        }
      };

      player.play().catch(() => {
        if (!hasTriedGoogle) {
          hasTriedGoogle = true;
          player.src = googleUrl;
          player.play().catch((err) => console.warn('Google TTS play failed:', err));
        }
      });
    } else {
      // 法文、德文、義大利文等：直接呼叫 Google Translate 原生多國發音 (如 tl=fr)
      const googleMultiLangUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${langPrefix}&client=tw-ob`;
      player.src = googleMultiLangUrl;
      player.play().catch((err) => console.warn(`Multi-lang TTS (${langPrefix}) play failed:`, err));
    }
  } catch (err) {
    console.warn('MP3 playback failed:', err);
  }
}

/**
 * 主發音入口 (Web Speech API 優先，自動辨識法語/德語/義語/美語，遇凍結/阻擋時 250ms 內自動無縫切換至 MP3)
 * @param text 要朗讀的文字
 * @param rate 語速 (0.8x 或 1.0x)
 * @param pitch 音調 (預設 1.0)
 * @param langOrContext 語種代碼 (如 'fr-FR', 'en-US') 或含有 "（法文）" 等資訊的中文釋義字串
 */
export function speakWord(
  text: string,
  rate: number = 1.0,
  pitch: number = 1.0,
  langOrContext?: string
): void {
  if (typeof window === 'undefined' || !text || !text.trim()) return;

  const targetLang = detectLanguage(text, langOrContext);
  const cleanText = sanitizeSpeechText(text);
  if (!cleanText) return;

  // 若有線上 MP3 正在播放，先關閉
  if (globalAudioPlayer) {
    globalAudioPlayer.pause();
  }

  // 1. 若支援 Web Speech API，嘗試調用
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.resume();
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = targetLang;
      utterance.rate = rate;
      utterance.pitch = pitch;

      const voices = window.speechSynthesis.getVoices();
      const langPrefix = targetLang.split('-')[0].toLowerCase();

      // 優先尋找符合目標語種（例如法文 fr、美語 en、德文 de）的自然人聲
      let matchedVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(langPrefix) &&
          (v.name.includes('Google') ||
            v.name.includes('Natural') ||
            v.name.includes('Thomas') ||
            v.name.includes('Amelie') ||
            v.name.includes('Samantha') ||
            v.name.includes('David'))
      ) || voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      let hasStarted = false;

      utterance.onstart = () => {
        hasStarted = true;
      };

      utterance.onerror = () => {
        if (!hasStarted) {
          playOnlineMP3(cleanText, rate, targetLang);
        }
      };

      window.speechSynthesis.speak(utterance);

      // 250ms 快照監測：若 Chrome/Safari/手機阻塞未能及時發音，立即切換至線上 MP3
      setTimeout(() => {
        if (!hasStarted) {
          playOnlineMP3(cleanText, rate, targetLang);
        }
      }, 250);

      return;
    } catch {
      // 降級處理
    }
  }

  // 2. 無 Web Speech API 時直接播放線上 MP3
  playOnlineMP3(cleanText, rate, targetLang);
}

export function cancelSpeech(): void {
  if (globalAudioPlayer) {
    globalAudioPlayer.pause();
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}
