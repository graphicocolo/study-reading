// タイマーの作業時間、休憩時間など時間設定機能を提供するカスタムフック
// 「時間設定の状態・変更・変換」をまとめて1つのフックに閉じ込めて、使う側が簡潔に扱えるようにしている設計

// このコード内で useEffect を使わないのは、状態管理と変換ロジックに特化しているため
// useEffect は「外の世界とやりとりする場所」であり、ここでは状態の管理と変換に集中しているから
// clamp() は「React の中で値を加工しているだけ」なので useEffect は不要

import { useState, useCallback, useMemo } from 'react'
import type { TimeValue } from '@/types/timer' // 時間の値（分と秒）の型定義
import { // タイマーのデフォルト値と制限値の定数参照
  DEFAULT_WORK_MINUTES,
  DEFAULT_WORK_SECONDS,
  DEFAULT_BREAK_MINUTES,
  DEFAULT_BREAK_SECONDS,
  MAX_MINUTES,
  MAX_SECONDS,
  MIN_MINUTES,
  MIN_SECONDS,
} from '@/lib/constants'
import { timeValueToSeconds } from '@/lib/time' // TimeValue を秒数に変換するユーティリティ関数

/**
 * 値を指定範囲内にクランプする
 * クランプ 値を制限値内（最小値から最大値まで）に収める
 */
function clamp(value: number, min: number, max: number): number { // 対象値、最小値、最大値が引数として渡される
  // Math.max 与えられた値の最大値を返す 最低でも 2 つの引数を処理するよう設計されている
  // Math.min 与えられた値の最小値を返す
  // Math.max で最小値を保ち、Math.min で最大値を保つ
  // 最初に対象値と最小値を比較し、対象値が最小値未満の場合は最小値を返す
  // 次に、その結果と最大値を比較し、結果が最大値を超える場合は最大値を返す
  // これにより、対象値が指定された範囲内に収まるようになる
  return Math.min(Math.max(value, min), max)
}

/**
 * TimeValue を有効な範囲内にクランプする
 */
function clampTimeValue(time: TimeValue): TimeValue {
  return { // 与えられた数値以下の最大の整数を返す Math.floor を使用して分と秒を整数に変換し、clamp 関数でそれぞれの範囲内に収める
    minutes: clamp(Math.floor(time.minutes), MIN_MINUTES, MAX_MINUTES),
    seconds: clamp(Math.floor(time.seconds), MIN_SECONDS, MAX_SECONDS),
  }
}

// カスタムフックの戻り値の型定義
export interface UseTimerSettingsReturn {
  /** 作業時間 */
  workTime: TimeValue
  /** 休憩時間 */
  breakTime: TimeValue
  /** 作業時間を設定 */
  setWorkTime: (time: TimeValue) => void
  /** 休憩時間を設定 */
  setBreakTime: (time: TimeValue) => void
  /** 作業時間（秒） */
  workDurationInSeconds: number
  /** 休憩時間（秒） */
  breakDurationInSeconds: number
}

/**
 * タイマー設定を管理するカスタムフック
 */
export function useTimerSettings(): UseTimerSettingsReturn {
  // 作業時間と休憩時間の状態を管理するための useState フック
  // 初期値は定数から取得

  // 作業時間の状態
  const [workTime, setWorkTimeState] = useState<TimeValue>({
    minutes: DEFAULT_WORK_MINUTES,
    seconds: DEFAULT_WORK_SECONDS,
  })

  // 休憩時間の状態
  const [breakTime, setBreakTimeState] = useState<TimeValue>({
    minutes: DEFAULT_BREAK_MINUTES,
    seconds: DEFAULT_BREAK_SECONDS,
  })

  // 作業時間を設定する関数
  const setWorkTime = useCallback((time: TimeValue) => {
    setWorkTimeState(clampTimeValue(time))
  }, [])

  // 休憩時間を設定する関数
  const setBreakTime = useCallback((time: TimeValue) => {
    setBreakTimeState(clampTimeValue(time))
  }, [])

  // 作業時間を秒数に変換した値をメモ化
  const workDurationInSeconds = useMemo(
    () => timeValueToSeconds(workTime),
    [workTime]
  )

  // 休憩時間を秒数に変換した値をメモ化
  const breakDurationInSeconds = useMemo(
    () => timeValueToSeconds(breakTime),
    [breakTime]
  )

  return { // フックの戻り値として必要な値と関数を返す
    workTime,
    breakTime,
    setWorkTime,
    setBreakTime,
    workDurationInSeconds,
    breakDurationInSeconds,
  }
}
