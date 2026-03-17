// ThemeToggle.tsx の役割 表示」と「イベントの転送」だけ
// 自分では何も判断・処理しない。theme を見てアイコンを切り替えるのも、「どっちを表示すべきか」を考えているのではなく、渡された値をそのまま使っているだけ
// 「表示」と「イベントの橋渡し」

import { Moon, Sun } from 'lucide-react'
import type { Theme } from '@/types/timer'
import { Button } from '@/components/ui/button'

// 受け取るもの（Props）
interface ThemeToggleProps {
  /** 現在のテーマ */
  theme: Theme
  /** テーマ切り替え時のコールバック */
  onToggle: () => void
}

/**
 * ダークモード切り替えボタンコンポーネント
 * props:
 * theme: 現在のテーマ
 * onToggle: テーマ切り替え時のコールバック(toggleTheme()でテーマを切り替え)
 * ボタン文言とアイコンは、テーマが切り替えられるたびに切り替わる
 */
export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className="h-10 w-10 rounded-full transition-transform hover:scale-105"
      aria-label={theme === 'light' ? 'ダークモードに切り替え' : 'ライトモードに切り替え'}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  )
}
