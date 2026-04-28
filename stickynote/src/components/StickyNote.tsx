import { useState, useRef, useCallback, useEffect } from 'react'
import { Pin, Trash2, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getColorConfig } from '@/constants/colors'
import { ColorPicker } from '@/components/ColorPicker'
import type { Note, NoteColor } from '@/types'
import { MAX_PINNED_NOTES } from '@/types'

// props の型
interface StickyNoteProps {
  note: Note
  onUpdate: (id: string, content: string) => void
  onDelete: (id: string) => void
  onMove: (id: string, position: { x: number; y: number }) => void
  onColorChange: (id: string, color: NoteColor) => void
  onTogglePin: (id: string) => void
  canPin: boolean
  zIndex: number
  onFocus: (id: string) => void
}

// ドラッグ状態の型
interface DragState {
  isDragging: boolean
  startX: number
  startY: number
  noteStartX: number
  noteStartY: number
}

export function StickyNote({
  note,
  onUpdate,
  onDelete,
  onMove,
  onColorChange,
  onTogglePin,
  canPin,
  zIndex,
  onFocus,
}: StickyNoteProps) {
  // カラーピッカー表示/非表示
  const [showColorPicker, setShowColorPicker] = useState(false)
  // ドラッグ状態（再描画なし）
  const dragState = useRef<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    noteStartX: 0,
    noteStartY: 0,
  })
  // ドラッグの有無
  const [isDragging, setIsDragging] = useState(false)
  // 付箋の DOM 要素そのものへの参照 画面上に実際に存在する <div> 要素を指し示すための変数
  // コンポーネントが画面に描画される前は、まだ <div> が存在しません。なので最初は「まだ何も指していない」= null です。ref={noteRef} が実行されて初めて noteRef.current に <div> が入ります。
  const noteRef = useRef<HTMLDivElement>(null)
  const colorConfig = getColorConfig(note.color)

  // ドラッグ開始（マウス）
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // テキストエリア・ボタン上はドラッグを開始しない
      if ((e.target as HTMLElement).closest('textarea, button')) return
      if (note.isPinned) return
      e.preventDefault()

      onFocus(note.id)
      dragState.current = {
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY,
        noteStartX: note.position.x,
        noteStartY: note.position.y,
      }
      setIsDragging(true)
    },
    [note.id, note.isPinned, note.position.x, note.position.y, onFocus],
  )

  // ドラッグ開始（タッチ）
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if ((e.target as HTMLElement).closest('textarea, button')) return
      if (note.isPinned) return

      onFocus(note.id)
      const touch = e.touches[0]
      dragState.current = {
        isDragging: true,
        startX: touch.clientX,
        startY: touch.clientY,
        noteStartX: note.position.x,
        noteStartY: note.position.y,
      }
      setIsDragging(true)
    },
    [note.id, note.isPinned, note.position.x, note.position.y, onFocus],
  )

  useEffect(() => {
    // クリーンアップが必要なイベントハンドラについてはこれ以降に記述
    // マウスを動かす
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.current.isDragging) return
      const dx = e.clientX - dragState.current.startX
      const dy = e.clientY - dragState.current.startY
      onMove(note.id, {
        x: dragState.current.noteStartX + dx,
        y: dragState.current.noteStartY + dy,
      })
    }
    // タッチして動かす
    const handleTouchMove = (e: TouchEvent) => {
      if (!dragState.current.isDragging) return
      e.preventDefault()
      const touch = e.touches[0]
      const dx = touch.clientX - dragState.current.startX
      const dy = touch.clientY - dragState.current.startY
      onMove(note.id, {
        x: dragState.current.noteStartX + dx,
        y: dragState.current.noteStartY + dy,
      })
    }

    // マウスを離す（動きを止める）
    const handleEnd = () => {
      if (!dragState.current.isDragging) return
      dragState.current.isDragging = false
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleEnd)

    return () => { // useEffect のクリーンアップ
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [note.id, onMove])

  // カラーピッカー外クリックで閉じる
  useEffect(() => {
    if (!showColorPicker) return
    const handleClick = (e: MouseEvent) => {
      // 「クリックが付箋の中か外か」を判定する
      if (!noteRef.current?.contains(e.target as Node)) {
        setShowColorPicker(false) // 付箋の外をクリックしたらカラーピッカーを閉じる
      }
    }
    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [showColorPicker])

  // 固定可能かどうか
  const pinDisabled = !canPin && !note.isPinned
  // 固定状態テキストを格納するラベル
  const pinLabel = note.isPinned
    ? '固定を解除'
    : pinDisabled
      ? `固定は最大${MAX_PINNED_NOTES}件まで`
      : '固定する'

  return (
    <div
      ref={noteRef} // JSX で div に紐付ける（これで noteRef.current が div を指すようになる）
      data-testid="sticky-note"
      className={cn(
        'absolute w-72 min-h-44 p-5 rounded-2xl border select-none backdrop-blur-sm',
        'transition-shadow duration-200 ease-out',
        colorConfig.bgClass,
        isDragging
          ? 'cursor-grabbing shadow-2xl'
          : 'cursor-grab shadow-lg hover:shadow-xl hover:scale-[1.01]',
        note.isPinned && 'ring-2 ring-offset-2 ring-yellow-400',
      )}
      style={{
        left: note.position.x,
        top: note.position.y,
        zIndex,
        boxShadow: isDragging
          ? `0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px ${colorConfig.accent}33`
          : `0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05), 0 0 0 1px ${colorConfig.accent}22`,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* ヘッダーエリア（操作ボタン） */}
      <div className="flex items-center justify-between mb-3 gap-1">
        {/* カラーピッカートグル */}
        <div className="relative">
          <button
            title="色を変更"
            onClick={() => setShowColorPicker((v) => !v)}
            className="group p-2 rounded-xl bg-white/40 hover:bg-white/60 backdrop-blur-sm border border-white/30 hover:border-white/50 transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
          >
            <Palette className="w-4 h-4 text-gray-700 group-hover:text-gray-900 transition-colors" />
          </button>
          {showColorPicker && (
            <ColorPicker
              current={note.color}
              onChange={(color) => {
                onColorChange(note.id, color)
                setShowColorPicker(false)
              }}
            />
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* 固定ボタン */}
          <button
            title={pinLabel}
            disabled={pinDisabled}
            onClick={() => onTogglePin(note.id)}
            className={cn(
              'group p-2 rounded-xl backdrop-blur-sm border transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md',
              note.isPinned
                ? 'bg-yellow-400/60 hover:bg-yellow-400/80 border-yellow-400/50 hover:border-yellow-500/50'
                : 'bg-white/40 hover:bg-white/60 border-white/30 hover:border-white/50',
              pinDisabled && 'opacity-40 cursor-not-allowed hover:scale-100',
            )}
          >
            <Pin
              className={cn(
                'w-4 h-4 transition-colors',
                note.isPinned
                  ? 'text-yellow-700 fill-yellow-600'
                  : 'text-gray-700 group-hover:text-gray-900',
              )}
            />
          </button>

          {/* 削除ボタン */}
          <button
            title="削除"
            onClick={() => onDelete(note.id)}
            className="group p-2 rounded-xl bg-white/40 hover:bg-red-100/70 backdrop-blur-sm border border-white/30 hover:border-red-200/50 transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
          >
            <Trash2 className="w-4 h-4 text-gray-700 group-hover:text-red-600 transition-colors" />
          </button>
        </div>
      </div>

      {/* テキストエリア */}
      <textarea
        value={note.content}
        onChange={(e) => onUpdate(note.id, e.target.value)}
        placeholder="メモを入力..."
        className="w-full bg-transparent resize-none outline-none text-gray-800 placeholder-gray-400 text-sm leading-relaxed min-h-24 cursor-text"
        rows={5}
      />

      {/* フッター（更新日時） */}
      <div className="mt-2 text-[10px] text-gray-400 text-right">
        {new Date(note.updatedAt).toLocaleDateString('ja-JP', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  )
}
