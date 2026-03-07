// 作業と休憩の時間設定と音声のボリュームとオンオフ設定機能を提供するコンポーネント

// 時間の型定義、カードコンポーネントのUI、スライダー・スイッチ・ラベルのUI、時間設定のコンポーネント、アイコンコンポーネント
// TimeSettings のみ自作コンポーネント
import type { TimeValue } from '@/types/timer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { TimeSettings } from './TimeSettings'
import { Volume2, VolumeX } from 'lucide-react'

// Props で受け取る内容の型定義
// 作業時間と休憩時間、音量関連、設定変更の無効化
// 値（workTimeなど）とコールバック（onWorkTimeChangeなど）がセットになっているパターンは典型的なReactのpropsの型
// 「値は親から受け取り、変更は親に伝える」という一方通行の流れ
interface SettingsPanelProps {
  /** 作業時間 */
  workTime: TimeValue
  /** 休憩時間 */
  breakTime: TimeValue
  /** 作業時間変更時のコールバック */
  onWorkTimeChange: (value: TimeValue) => void
  /** 休憩時間変更時のコールバック */
  onBreakTimeChange: (value: TimeValue) => void
  /** 音量（0-1） */
  volume: number
  /** ミュート状態 */
  isMuted: boolean
  /** 音量変更時のコールバック */
  onVolumeChange: (value: number) => void
  /** ミュート切り替え時のコールバック */
  onMuteToggle: () => void
  /** 無効状態（タイマー実行中） */
  disabled?: boolean
}

/**
 * 設定パネルコンポーネント
 */
export function SettingsPanel({
  workTime,
  breakTime,
  onWorkTimeChange,
  onBreakTimeChange,
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
  disabled = false,
}: SettingsPanelProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-lg">設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 時間設定 */}
        <div className="grid grid-cols-2 gap-4">
          <TimeSettings
            label="作業時間"
            value={workTime}
            onChange={onWorkTimeChange}
            disabled={disabled}
          />
          <TimeSettings
            label="休憩時間"
            value={breakTime}
            onChange={onBreakTimeChange}
            disabled={disabled}
          />
        </div>

        {/* 音声設定 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-muted-foreground">
              通知音
            </Label>
            <div className="flex items-center gap-2">
              <Switch
                checked={!isMuted}
                onCheckedChange={() => onMuteToggle()}
                aria-label="通知音のオン/オフ"
              />
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Slider
              value={[volume * 100]}
              onValueChange={(values) => onVolumeChange(values[0] / 100)}
              max={100}
              step={1}
              disabled={isMuted}
              className="flex-1"
              aria-label="音量"
            />
            <span className="text-sm text-muted-foreground w-10 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
