import type { TimerPhase } from '@/types/timer'
import { cn } from '@/lib/utils'

interface TimerDisplayProps {
  /** フォーマットされた時間（MM:SS） */
  formattedTime: string
  /** 現在のフェーズ */
  phase: TimerPhase
}

/**
 * タイマーの時間を表示するコンポーネント
 * props:
 * - formattedTime: タイマーの残り時間を「MM:SS」形式で受け取る
 * - phase: 現在のフェーズ（作業中か休憩中か）を受け取る。これに応じて文字色を変える
 * タイマーの時間表示部分をこのコンポーネントに切り出すことで、タイマーのロジックと表示を分離し、コードの見通しを良くすることができる
 * useTimer からは、残り時間をフォーマットした formattedTime と、現在のフェーズを表す phase を props として受け取る
 */
export function TimerDisplay({ formattedTime, phase }: TimerDisplayProps) {
  return (
    <div
      data-testid="timer-display" // テストコードからこの要素を特定するための属性
      // cn 関数を使って、基本のクラスに加えて、フェーズに応じた文字色のクラスを条件付きで適用
      // cn の役割は、複数のクラスを結合して一つのクラス文字列を作ること。ここでは、基本のスタイルクラスと、phase が 'work' のときは 'text-work' クラスを、'break' のときは 'text-break' クラスを適用している
      // cn を使うことで、クラスの条件付き適用が簡潔に書ける。もし cn を使わない場合、クラスの結合や条件付き適用のロジックを自分で書く必要があり、コードが複雑になる
      className={cn(
        'text-7xl sm:text-8xl md:text-9xl font-bold tabular-nums tracking-tight',
        'transition-colors duration-300',
        phase === 'work' ? 'text-work' : 'text-break'
      )}
      // cn を使わずに書くと
      // className={`text-7xl ... tracking-tight transition-colors duration-300 ${phase === 'work' ? 'text-work' : 'text-break'}`}
    >
      {formattedTime}
    </div>
  )
}
