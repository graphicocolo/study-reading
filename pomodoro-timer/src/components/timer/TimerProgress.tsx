import type { TimerPhase } from '@/types/timer'
import { cn } from '@/lib/utils'

interface TimerProgressProps {
  /** 進捗率（0-100） */
  progress: number
  /** 現在のフェーズ */
  phase: TimerPhase
  /** 子要素（中央に配置） */
  children?: React.ReactNode
}

/**
 * 円形プログレスバーコンポーネント
 * props:
 * progress: 0-100 の値を受け取り、円形のプログレスバーを描画する
 * phase: 'work' または 'break' の値を受け取り、プログレスバーの色を変える
 * children: プログレスバーの中央に表示する内容（残り時間など）
 * useTimer から渡される progress と phase を使って、円形のプログレスバーを描画する
 */
export function TimerProgress({ progress, phase, children }: TimerProgressProps) {
  const radius = 140 // 円の半径
  const strokeWidth = 8 // 円の線の太さ
  const circumference = 2 * Math.PI * radius // 円周の長さ
  const strokeDashoffset = circumference - (progress / 100) * circumference // プログレスに応じた線のオフセット あとどのくらい線を描くかを決める値 つまり残りの進捗を円の線の長さで表すための値

  return (
    <div className="relative flex items-center justify-center">
      {/* SVG 円形プログレス */}
      <svg
        className="transform -rotate-90"
        width={320}
        height={320}
        viewBox="0 0 320 320"
      >
        {/* 背景の円 */}
        <circle
          cx="160"
          cy="160"
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth={strokeWidth}
        />
        {/* プログレスの円 */}
        <circle
          cx="160"
          cy="160"
          r={radius}
          fill="none"
          className={cn(
            'transition-all duration-1000 ease-linear',
            phase === 'work' ? 'stroke-work' : 'stroke-break'
          )}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference} {/* circle要素の属性 線のパターンを指定する属性 今回は円周の長さを指定しているので、線が途切れずに円全体に描かれる */}
          strokeDashoffset={strokeDashoffset} {/* circle要素の属性 線の開始位置を指定する属性 今回は、circumference - (progress / 100) * circumference を指定しているので、進捗に応じて線が描かれる量が変わる 例えば progress が 50 のときは、circumference - (0.5 * circumference) = circumference / 2 となり、円の半分が描かれることになる */}
        />
      </svg>
      {/* 中央のコンテンツ */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}
