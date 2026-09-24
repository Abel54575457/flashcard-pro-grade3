// 三年級單字複習專用：已依據指示完全解除 LINE 連動，無須依賴 LINE 即可獨立運作。

export interface LiffUserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export function getSavedLiffId(): string {
  return '';
}

export function saveLiffId(_liffId: string): void {}

export function getSavedChannelToken(): string {
  return '';
}

export function saveChannelToken(_token: string): void {}

export function getSavedGasProxyUrl(): string {
  return '';
}

export function saveGasProxyUrl(_url: string): void {}

export async function initLiff(): Promise<boolean> {
  return false;
}

export async function getLiffUserProfile(): Promise<LiffUserProfile | null> {
  return null;
}

export async function checkLineBotConnection(): Promise<{ ok: boolean; message: string }> {
  return { ok: true, message: '獨立純網頁模式運行中（免 LINE）' };
}

export async function sendLinePushReminder(): Promise<{ success: boolean; message: string }> {
  return { success: false, message: '本系統為三年級純網頁複習版，免 LINE 推播' };
}

export async function sendLineBatchReminders(): Promise<{ success: boolean; total: number; sent: number; failed: number; message: string }> {
  return { success: true, total: 0, sent: 0, failed: 0, message: '獨立純網頁模式運行中' };
}

export async function shareReminderViaLiffPicker(): Promise<boolean> {
  return false;
}

export async function shareIndividualStudentReminder(_seat: string): Promise<boolean> {
  return false;
}
