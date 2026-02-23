// アプリの入り口となるファイル hooks と components をつなぐ場所
// hooks から受け取った値や関数を、components に props として渡している。「hooks で作ったロジックが、どうやって画面部品に届くのか」がわかるファイル

import { useCallback, useEffect } from 'react'
import { useTimer } from '@/hooks/useTimer'
import { useTimerSettings } from '@/hooks/useTimerSettings'
import { useAudio } from '@/hooks/useAudio'
import { useTheme } from '@/hooks/useTheme'
import { TimerDisplay } from '@/components/timer/TimerDisplay'
import { TimerProgress } from '@/components/timer/TimerProgress'
import { TimerControls } from '@/components/timer/TimerControls'
import { TimerPhaseIndicator } from '@/components/timer/TimerPhaseIndicator'
import { SettingsPanel } from '@/components/settings/SettingsPanel'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

/**
 * ポモドーロタイマーアプリのメインコンポーネント
 */
// useTheme, useTimerSettings, useAudio から、テーマ管理、時間設定、音声管理のロジックを取得
// 作業終了時, 休憩終了時のコールバック定義
// useTimer から、タイマーの状態と操作関数を取得
// スタートボタンを押したときのコールバック定義
// タイマーの状態に応じてページタイトルを更新するための useEffect 定義
// 画面部品（TimerDisplay, TimerProgress, TimerControls, TimerPhaseIndicator, SettingsPanel, ThemeToggle）に、必要な値や関数を props として渡す
function App() {
  // テーマ管理
  // 現在のテーマとテーマを切り替える関数が利用可能
  const { theme, toggleTheme } = useTheme()

  // 時間設定
  const {
    workTime,
    breakTime,
    setWorkTime,
    setBreakTime,
    workDurationInSeconds,
    breakDurationInSeconds,
  } = useTimerSettings()

  // 音声管理
  const {
    playWorkEndSound,
    playBreakEndSound,
    volume,
    isMuted,
    setVolume,
    toggleMute,
    initializeAudio,
  } = useAudio()

  // 作業終了時のコールバック
  // useCallback を使うことで、依存関係が変わらない限り同じ関数インスタンスを保持できる。これにより、タイマーがコールバックを呼び出すたびに新しい関数が生成されるのを防ぎ、パフォーマンスを向上させることができる。
  const handleWorkComplete = useCallback(() => {
    playWorkEndSound()
  }, [playWorkEndSound])
  // handleWorkComplete を介して playWorkEndSound を呼び出す理由
  //  「作業が終わったときにやること」の窓口を作っている
  // 今は音を鳴らすだけだが、今後通知を出す、データを送るなど、やることが増えたときに、この関数の中に処理を追加すればいい。タイマー側は「作業が終わったときに呼ぶ関数」を handleWorkComplete に渡しているだけなので、handleWorkComplete の中身がどうなっているかは気にしなくていい。こうすることで、タイマーのロジックと「作業が終わったときにやること」を分離できる。
  // useTimer は「時間の管理」だけが仕事で、音のことは知らない。useAudio は「音を鳴らす」だけが仕事で、タイマーのことは知らない。この2つをつなぐのが handleWorkComplete
  // もし playWorkEndSound を直接 useTimer に渡すと、「タイマーが音のことを知っている」状態になり、役割が混ざってしまう

  // 休憩終了時のコールバック
  const handleBreakComplete = useCallback(() => {
    playBreakEndSound()
  }, [playBreakEndSound])

  // タイマー管理
  // useTimer フックから、タイマーの状態（残り時間、動作中かどうか、現在のフェーズ）と、タイマーを操作する関数（開始、停止、リセット）を受け取る
  // useTimer に渡す値は、useTimerSettings で時間設定から計算された作業時間と休憩時間、そして App.tsx で作られた作業終了時と休憩終了時のコールバック関数
  const {
    isRunning,
    phase,
    progress,
    formattedTime,
    start,
    pause,
    reset,
  } = useTimer({
    workDuration: workDurationInSeconds,
    breakDuration: breakDurationInSeconds,
    onWorkComplete: handleWorkComplete,
    onBreakComplete: handleBreakComplete,
  })

  // 最初のユーザー操作（スタートボタンを押したとき）のコールバック
  // 「スタート時にやること」をまとめた窓口
  const handleStart = useCallback(() => {
    initializeAudio() // 音を使えるようにする
    start() // タイマーをスタートさせる
  }, [initializeAudio, start])

  // ページタイトルをタイマーの状態に応じて更新
  //　タイマーの残り時間、フェーズ、動作状態が変わるたびに、ページタイトルを更新する
  // なぜ useEffect を使うか
  // document.title は React の外側（ブラウザの DOM） を直接変更する操作です。React の管轄外に影響を与えるので useEffect が必要
  // formattedTime フォーマットされた残り時間
  useEffect(() => {
    const phaseLabel = phase === 'work' ? '作業' : '休憩'
    document.title = isRunning
      ? `${formattedTime} - ${phaseLabel} | ポモドーロタイマー`
      : 'ポモドーロタイマー'

    return () => {
      document.title = 'ポモドーロタイマー'
    }
  }, [formattedTime, phase, isRunning])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <h1 className="text-lg font-semibold">ポモドーロタイマー</h1>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>

      {/* メインコンテンツ */}
      <main className="flex flex-col items-center justify-center min-h-screen px-4 py-20">
        <div className="flex flex-col items-center gap-8">
          {/* フェーズ表示 */}
          <TimerPhaseIndicator phase={phase} />

          {/* タイマー表示 */}
          <TimerProgress progress={progress} phase={phase}>
            <TimerDisplay formattedTime={formattedTime} phase={phase} />
          </TimerProgress>

          {/* 操作ボタン */}
          <TimerControls
            isRunning={isRunning}
            onStart={handleStart}
            onPause={pause}
            onReset={reset}
          />

          {/* 設定パネル */}
          <SettingsPanel
            workTime={workTime}
            breakTime={breakTime}
            onWorkTimeChange={setWorkTime}
            onBreakTimeChange={setBreakTime}
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={setVolume}
            onMuteToggle={toggleMute}
            disabled={isRunning}
          />
        </div>
      </main>
    </div>
  )
}

export default App
