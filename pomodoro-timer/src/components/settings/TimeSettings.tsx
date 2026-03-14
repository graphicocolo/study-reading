// ○○○のコンポーネント

// 時間の型定義、フォーム関連UIコンポーネント、分秒の最小値最大値定数
import type { TimeValue } from '@/types/timer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MAX_MINUTES, MAX_SECONDS, MIN_MINUTES, MIN_SECONDS } from '@/lib/constants'

// Props で受け取る内容の型定義
interface TimeSettingsProps {
  /** ラベル */
  label: string
  /** 現在の時間値 */
  value: TimeValue
  /** 時間変更時のコールバック */
  onChange: (value: TimeValue) => void
  /** 無効状態 */
  disabled?: boolean
}

/**
 * 時間設定コンポーネント（分・秒の入力フィールド）
 */
export function TimeSettings({
  label,
  value,
  onChange,
  disabled = false,
}: TimeSettingsProps) {
  // 分設定変更のハンドラー
  // ユーザーが変更した分の数値の値を、分の最小値最大値定数の間の値に収める
  // 分設定のUIのonChangeのハンドラー
  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = parseInt(e.target.value, 10) || 0 // 「値が falsy なら 0 にする」イディオム
    onChange({
      ...value, // value は TimeValue 型で、分と秒を両方持つオブジェクト
      // 分や秒だけを変えたい場合、分だけ秒だけを上書きするためにスプレッド構文を使用
      // 後から書いたプロパティが前のものを上書きする
      minutes: Math.min(Math.max(minutes, MIN_MINUTES), MAX_MINUTES),
      // 「値を MIN〜MAX の範囲に収める」ためのイディオム（定番の書き方・お決まりのパターン）
      // 一行で書けるので、こういう「値のクランプ（clamp）」によく使われるパターン
      // まず Math.max() で、minutes と MIN_MINUTES の大きい方を返し下限を守る
      // 次に Math.min() で、minutes と MAX_MINUTES の小さい方を返し上限を守る
    })
  }
  // 秒設定変更のハンドラー
  // ユーザーが変更した秒の数値の値を、秒の最小値最大値定数の間の値に収める
  // 秒設定のUIのonChangeのハンドラー
  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seconds = parseInt(e.target.value, 10) || 0
    onChange({
      ...value,
      seconds: Math.min(Math.max(seconds, MIN_SECONDS), MAX_SECONDS),
    })
  }

  // 分と秒を設定するUIを返す
  // study-reading/pomodoro-timer/src/components/settings/SettingsPanel.tsx
  // ↑ここでインポートされ、作業時間や休憩時間の設定に使われる
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            type="number"
            min={MIN_MINUTES}
            max={MAX_MINUTES}
            value={value.minutes}
            onChange={handleMinutesChange}
            disabled={disabled}
            className="text-center"
            aria-label={`${label}の分`}
          />
          <span className="block text-center text-xs text-muted-foreground mt-1">
            分
          </span>
        </div>
        <span className="text-lg font-bold text-muted-foreground">:</span>
        <div className="flex-1">
          <Input
            type="number"
            min={MIN_SECONDS}
            max={MAX_SECONDS}
            value={value.seconds}
            onChange={handleSecondsChange}
            disabled={disabled}
            className="text-center"
            aria-label={`${label}の秒`}
          />
          <span className="block text-center text-xs text-muted-foreground mt-1">
            秒
          </span>
        </div>
      </div>
    </div>
  )
}
