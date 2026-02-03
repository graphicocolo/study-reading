// タイマー機能の核となるロジックを管理するカスタムフック
// 引数と返り値の型定義、引数の分割代入、状態変数の定義
// タイマーのメインロジック
// フックの返り値として状態と操作関数を返す

// React hooks の読み込み
// useState: 状態管理用
// useCallback: メモ化されたコールバック関数の作成用
// useRef: ミューテーブルな参照を作成するため
// useEffect: 副作用の管理用
// useMemo: メモ化された値の作成用
import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
// 型のインポート
/** タイマーのフェーズ（作業 or 休憩） ユニオン型 */
// export type TimerPhase = 'work' | 'break'
import type { TimerPhase } from '@/types/timer'
// 時間関連のユーティリティ関数のインポート
// formatTime 秒数を MM:SS 形式の文字列にフォーマット
// calculateProgress 残り時間と総時間から進捗率を計算
import { formatTime, calculateProgress } from '@/lib/time'

// 1. 渡す値と戻る値の型定義を行う
// 2. タイマーのメインのロジックを管理するカスタムフックを実装
// 2-1. 引数の分割代入 受け取った値をまずは格納
// 2-2. 状態変数の定義 変更状態を管理する必要のある値とその更新関数を定義
// 2-3. タイマーの interval ID を保持するための参照を作成
// 2-4. 前回の duration（ここでは作業時間や休憩時間） を追跡するための参照を作成
// 2-5. コールバックを最新の参照として保持
// 2-6. onWorkComplete と onBreakComplete の変更に対応するための useEffect を設定
// 2-7. タイマーの処理を useEffect で管理（コールバック関数変更への対応、タイマーの処理（タイマーが停止している場合interval をクリアして終了、タイマーが動作中の場合1秒ごとに remainingTime をデクリメント、クリーンアップ関数））
// 2-8. duration が変更されたときに remainingTime を同期するための useEffect を設定
// 2-9. タイマー操作関数の定義 start, pause, reset
// 2-10. 進捗率とフォーマットされた時間を計算

// 1. 渡す値と戻る値の型定義を行う=====

// useTimer フックのオプション型定義
// 作業時間、休憩時間、完了時のコールバックを含む
export interface UseTimerOptions {
  /** 作業時間（秒） */
  workDuration: number
  /** 休憩時間（秒） */
  breakDuration: number
  /** 作業終了時のコールバック */
  // 作業終了時に○○してほしい、という処理内容を渡せるよう設定されている
  onWorkComplete?: () => void
  // 休憩終了時に○○してほしい、という処理内容を渡せるよう設定されている
  /** 休憩終了時のコールバック */
  onBreakComplete?: () => void
}

// useTimer フックの返り値型定義
// タイマーの状態と操作関数を含む
export interface UseTimerReturn {
  /** 残り時間（秒） */
  remainingTime: number
  /** タイマーが動作中かどうか */
  isRunning: boolean
  /** 現在のフェーズ */
  phase: TimerPhase
  /** 進捗率（0-100） */
  progress: number
  /** フォーマットされた時間（MM:SS） */
  formattedTime: string
  /** タイマーを開始 */
  start: () => void
  /** タイマーを一時停止 */
  pause: () => void
  /** タイマーをリセット */
  reset: () => void
}

// 2. タイマーのメインのロジックを管理するカスタムフックを実装=====

/**
 * タイマーのコアロジックを管理するカスタムフック
 */
export function useTimer(options: UseTimerOptions): UseTimerReturn {
  // 2-1. 引数の分割代入
  // まずは受け取った値と処理を変数に展開
  // 作業時間、休憩時間、作業と休憩の完了時のコールバックを取得
  const { workDuration, breakDuration, onWorkComplete, onBreakComplete } = options

  // 2-2. 状態変数の定義
  // 配列(タプル)で状態値stateと状態を更新するための関数setStateを返す
  // remainingTime: 残り時間の状態
  // isRunning: タイマーが動作中かどうかの状態
  // phase: 現在のフェーズ（作業 or 休憩）
  const [remainingTime, setRemainingTime] = useState(workDuration)
  const [isRunning, setIsRunning] = useState(false)
  const [phase, setPhase] = useState<TimerPhase>('work')

  // 2-3. タイマーの interval ID を保持するための参照（ref）を作成
  // intervalRef: タイマーのインターバルIDを保持するための参照
  // interval ID = タイマーを一意に識別するための数値（ID）のこと
  const intervalRef = useRef<number | null>(null)

  // 2-4. 前回の duration（ここでは作業時間や休憩時間） を追跡するための参照を作成
  const prevWorkDurationRef = useRef(workDuration) // 初期値として workDuration を設定
  const prevBreakDurationRef = useRef(breakDuration) // 初期値として breakDuration を設定

  // 2-5. コールバックを最新の参照として保持
  // onWorkCompleteRef: 作業完了時のコールバック関数の参照
  // onBreakCompleteRef: 休憩完了時のコールバック関数の参照
  const onWorkCompleteRef = useRef(onWorkComplete)
  const onBreakCompleteRef = useRef(onBreakComplete)

  // 2-6. onWorkComplete と onBreakComplete の変更に対応するための useEffect を設定
  // ここでは、onWorkComplete と onBreakComplete が変更されたときに
  // それぞれの ref を最新の関数で更新するための副作用を設定
  // これにより、タイマーの動作中にコールバック関数が変更されても
  // 最新の関数が呼び出されるようになる
  useEffect(() => {
    onWorkCompleteRef.current = onWorkComplete
    onBreakCompleteRef.current = onBreakComplete
  }, [onWorkComplete, onBreakComplete])

  // 2-7. タイマーの処理を useEffect で管理
  /** まとめ（ポイント）
  ┌─────────────┬──────────────────────────────────────┐
  │    状態     │              何をする？              │
  ├─────────────┼──────────────────────────────────────┤
  │ 停止中      │ タイマーを止めて何もしない           │
  ├─────────────┼──────────────────────────────────────┤
  │ 動作中      │ 1秒ごとにカウントダウン              │
  ├─────────────┼──────────────────────────────────────┤
  │ 0になったら │ モードを切り替えて、次の時間をセット │                                                            
  ├─────────────┼──────────────────────────────────────┤
  │ 終了時      │ タイマーをきれいに止める             │                                                            
  └─────────────┴──────────────────────────────────────┘
  */
  useEffect(() => {
    // タイマーが停止している場合、interval をクリアして終了
    if (!isRunning) { // isRunning が false の場合
      if (intervalRef.current) { // intervalRef.current に値がある場合
        clearInterval(intervalRef.current) // interval をクリア
        intervalRef.current = null // intervalRef を null にリセット
      }
      return // 処理終了
    }

    // タイマーが動作中の場合、1秒ごとに remainingTime をデクリメント
    intervalRef.current = window.setInterval(() => { // 1秒ごとに中の処理を実行
      setRemainingTime((prev) => {
        if (prev <= 1) { // remainingTime が 0 になった場合の処理
          if (phase === 'work') { // 作業フェーズの場合
            onWorkCompleteRef.current?.() // 作業完了時のコールバックを呼び出す
            setPhase('break') // フェーズを休憩に変更
            return breakDuration // 休憩時間をセット
          } else { // 休憩フェーズの場合
            onBreakCompleteRef.current?.() // 休憩完了時のコールバックを呼び出す
            setPhase('work') // フェーズを作業に変更
            return workDuration // 作業時間をセット
          }
        }
        return prev - 1 // 残り時間をデクリメント
      })
    }, 1000) // 1000ミリ秒（1秒）ごとに実行

    // クリーンアップ関数: コンポーネントのアンマウント時や依存関係の変更時に interval をクリア
    // このタイマー機能を使わなくなったとき（画面を閉じたときなど）
    // 動いているタイマーをちゃんと止めて、後片付けをする
    // これをしないと、見えないところでタイマーが動き続けてしまう
    return () => { // 無名関数を返している
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    } // ここに() がつかないのは、関数を返しているから
  }, [isRunning, phase, workDuration, breakDuration]) // 依存配列: isRunning, phase, workDuration, breakDuration が変更されたときに副作用を再実行

  // 2-8. duration が変更されたときに remainingTime を同期（停止中のみ）
  // これは外部からの設定変更を反映するための意図的な同期処理
  useEffect(() => {
    if (!isRunning) { // タイマーが停止中の場合のみ
      if (phase === 'work' && workDuration !== prevWorkDurationRef.current) { // 作業フェーズで作業時間が変更された場合
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRemainingTime(workDuration) // remainingTime を新しい作業時間に更新
        prevWorkDurationRef.current = workDuration // 前回の作業時間を更新
      } else if (phase === 'break' && breakDuration !== prevBreakDurationRef.current) { // 休憩フェーズで休憩時間が変更された場合
        setRemainingTime(breakDuration) // remainingTime を新しい休憩時間に更新
        prevBreakDurationRef.current = breakDuration // 前回の休憩時間を更新
      }
    }
  }, [workDuration, breakDuration, isRunning, phase])

  // 2-9. タイマー操作関数の定義
  // start: タイマーを開始する関数
  // pause: タイマーを一時停止する関数
  // reset: タイマーをリセットする関数
  // それぞれ useCallback でメモ化してパフォーマンスを最適化
  const start = useCallback(() => {
    setIsRunning(true)
  }, [])

  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    setIsRunning(false) // タイマーを停止
    setPhase('work') // フェーズを作業にリセット
    setRemainingTime(workDuration) // 残り時間を作業時間にリセット
    prevWorkDurationRef.current = workDuration // 前回の作業時間を更新
  }, [workDuration])

  const currentDuration = phase === 'work' ? workDuration : breakDuration // 現在のフェーズに応じた総時間を取得

  // 2-10. 進捗率とフォーマットされた時間を計算
  // progress: 残り時間と総時間から進捗率を計算
  // formattedTime: 残り時間を MM:SS 形式にフォーマット
  const progress = useMemo(
    () => calculateProgress(remainingTime, currentDuration),
    [remainingTime, currentDuration]
  )

  const formattedTime = useMemo(() => formatTime(remainingTime), [remainingTime])

  // フックの返り値として状態と操作関数を返す
  return {
    remainingTime, // 残り時間
    isRunning, // タイマーが動作中かどうか
    phase, // 現在のフェーズ
    progress, // 進捗率
    formattedTime, // フォーマットされた時間
    start, // タイマーを開始
    pause, // タイマーを一時停止
    reset, // タイマーをリセット
  }
}
