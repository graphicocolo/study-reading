import { COLORS } from '@/constants/colors'
import { cn } from '@/lib/utils'
import type { NoteColor } from '@/types'

interface ColorPickerProps {
  current: NoteColor
  onChange: (color: NoteColor) => void
}

// 付箋の色を変更するカラーピッカーコンポーネント
export function ColorPicker({ current, onChange }: ColorPickerProps) {
  return (
    <div className="color-picker absolute top-16 left-0 w-max bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-3 border border-white/30 z-20">
      <p className="text-xs font-medium text-gray-500 mb-2 px-1">カラーを選択</p>
      <div className="grid grid-cols-4 gap-2">
        {COLORS.map((color) => (
          <button
            key={color.value}
            title={color.name}
            onClick={() => onChange(color.value)}
            className={cn(
              'w-8 h-8 rounded-xl border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg cursor-pointer',
              color.bgClass,
              current === color.value
                ? 'border-gray-600 scale-110 shadow-md'
                : 'border-white/50 hover:border-gray-300',
            )}
          />
        ))}
      </div>
    </div>
  )
}
