// プロジェクト全体で使用される時間関連の汎用関数群

import type { TimeValue } from '@/types/timer'

/**
 * 秒数を TimeValue に変換
 * @param totalSeconds 合計秒数
 * @returns TimeValue オブジェクト
 */
export function secondsToTimeValue(totalSeconds: number): TimeValue {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return { minutes, seconds }
}

/**
 * TimeValue を秒数に変換
 * @param time TimeValue オブジェクト
 * @returns 合計秒数
 */
export function timeValueToSeconds(time: TimeValue): number {
  return time.minutes * 60 + time.seconds
}

/**
 * 秒数を MM:SS 形式の文字列にフォーマット
 * @param totalSeconds 合計秒数
 * @returns フォーマットされた文字列
 */
export function formatTime(totalSeconds: number): string {
  const { minutes, seconds } = secondsToTimeValue(totalSeconds)
  const paddedMinutes = String(minutes).padStart(2, '0')
  const paddedSeconds = String(seconds).padStart(2, '0')
  return `${paddedMinutes}:${paddedSeconds}`
}

/**
 * 進捗率を計算（0-100）
 * @param remainingTime 残り時間（秒）
 * @param totalTime 合計時間（秒）
 * @returns 進捗率（パーセント）
 */
export function calculateProgress(remainingTime: number, totalTime: number): number {
  if (totalTime <= 0) return 0
  const elapsed = totalTime - remainingTime
  return Math.min(100, Math.max(0, (elapsed / totalTime) * 100))
}
