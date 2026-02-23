import { Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TimerControlsProps {
  /** タイマーが動作中かどうか */
  isRunning: boolean
  /** 開始ボタンのコールバック */
  onStart: () => void
  /** 一時停止ボタンのコールバック */
  onPause: () => void
  /** リセットボタンのコールバック */
  onReset: () => void
}

/**
 * タイマー操作ボタンコンポーネント
 * props:
 * isRunning: タイマーが動作中かどうかを受け取り、開始/一時停止ボタンの表示を切り替える
 * onStart: 開始ボタンが押されたときのコールバック関数
 * onPause: 一時停止ボタンが押されたときのコールバック関数
 * onReset: リセットボタンが押されたときのコールバック関数
 * useTimer から渡される isRunning と、タイマー操作関数 onStart, onPause, onReset を使って、タイマー操作ボタンを表示する
 */
/*
 * isRunning というフラグ（タイマーが動作中かどうか）
 * onStart という関数（タイマーを開始する、App.tsx で作成されたhandleStart関数が入る）
 * onPause という関数（タイマーを一時停止する、useTimer の pauseコールバックが入る）
 * onReset という関数（タイマーをリセットする、useTimer の resetコールバックが入る）
 * これらを props として受け取り、button要素の onClick にそれぞれの関数を割り当てる
 * 「ボタンが押されたイベントを検知して伝える係」であり、「その後何をするかは知らない」
*/
export function TimerControls({
  isRunning,
  onStart,
  onPause,
  onReset,
}: TimerControlsProps) {
  return (
    <div className="flex items-center gap-4">
      {/* 開始 / 一時停止ボタン */}
      {isRunning ? (
        <Button
          onClick={onPause}
          size="lg"
          variant="outline"
          className="h-14 w-14 rounded-full transition-transform hover:scale-105 active:scale-95"
          aria-label="一時停止"
        >
          <Pause className="h-6 w-6" />
        </Button>
      ) : (
        <Button
          onClick={onStart}
          size="lg"
          className="h-14 w-14 rounded-full transition-transform hover:scale-105 active:scale-95"
          aria-label="開始"
        >
          <Play className="h-6 w-6 ml-1" />
        </Button>
      )}

      {/* リセットボタン */}
      <Button
        onClick={onReset}
        size="lg"
        variant="ghost"
        className="h-14 w-14 rounded-full transition-transform hover:scale-105 active:scale-95"
        aria-label="リセット"
      >
        <RotateCcw className="h-5 w-5" />
      </Button>
    </div>
  )
}
