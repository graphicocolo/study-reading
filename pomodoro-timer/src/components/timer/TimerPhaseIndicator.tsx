import type { TimerPhase } from '@/types/timer'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TimerPhaseIndicatorProps {
  /** 現在のフェーズ */
  phase: TimerPhase
}

/**
 * 現在のフェーズを表示するバッジコンポーネント
 * props:
 * phase: 'work' または 'break' の値を受け取り、バッジの表示内容とスタイルを変える
 * useTimer から渡される phase を使って、現在のフェーズを表示するバッジを描画する
 * cn 関数で複数のクラスを結合して一つのクラス文字列を作成し、フェーズに応じたスタイルを適用している
 */
export function TimerPhaseIndicator({ phase }: TimerPhaseIndicatorProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'px-4 py-1 text-sm font-medium transition-colors duration-300',
        phase === 'work'
          ? 'border-work text-work'
          : 'border-break text-break'
      )}
    >
      {phase === 'work' ? '作業中' : '休憩中'}
    </Badge>
  )
}
