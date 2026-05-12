import { Plus, StickyNote } from 'lucide-react'
import { MAX_PINNED_NOTES } from '@/types'

interface HeaderProps {
  noteCount: number
  pinnedCount: number
  onAddNote: () => void
}

// アプリのヘッダー（Glassmorphism デザイン）
export function Header({ noteCount, pinnedCount, onAddNote }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
        {/* ブランドセクション */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <StickyNote className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight">
              Sticky Notes
            </h1>
            <p className="text-xs text-gray-500 font-medium hidden sm:block">
              {noteCount} 件 ・ 固定 {pinnedCount}/{MAX_PINNED_NOTES}
            </p>
          </div>
        </div>

        {/* 付箋追加ボタン */}
        <button
          onClick={() => onAddNote()}
          className="group flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-blue-400/20 text-sm md:text-base"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span className="hidden sm:inline">付箋を追加</span>
          <span className="sm:hidden">追加</span>
        </button>
      </div>
    </header>
  )
}
