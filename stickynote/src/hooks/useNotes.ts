// 付箋の状態管理を行うカスタムフック

import { useState, useCallback, useEffect } from 'react'
import type { Note, NoteColor } from '@/types'
import { MAX_PINNED_NOTES } from '@/types'
import { DEFAULT_COLOR } from '@/constants/colors'

const STORAGE_KEY = 'sticky-notes' // localStorage の付箋アプリデータのキー

// フックの機能一覧
// useNotes フック 付箋の追加、更新、削除、移動、色変更、固定/解除
// 他の機能
// localStorage から付箋を読み込む
// localStorage に付箋を保存する
// ランダムな初期位置を生成する（ヘッダー下・画面内に収まるよう調整）

// 疑問
// loadNotes, saveNotes, getRandomPosition は useNotes 内で定義しているが、外部に出すべきか？
// → これらは useNotes 内でしか使わないため、外部に出す必要はないと判断。コードの見通しも良くなる。
// 付箋を移動した際、位置の更新は moveNote で行うが、x, y の値はどこで制御しているのか？
// → 位置の制御は Note コンポーネント内で行う。useNotes はあくまで状態管理の役割に徹するため、位置のロジックは Note コンポーネントに任せる。これにより、useNotes はシンプルで再利用しやすくなる。

// 一つ一つのコードを見ていくと自分でも一から書けそうだが、いざとなると細かい部分で迷うことが多い。例えば、localStorage からの読み込みや保存のエラーハンドリング、ランダムな位置の生成ロジックなどは、実際にのコードが思いつかないと思う。思考をコードに落とし込む練習が必要だと感じた。
// 思考をコードに落とし込む際のポイントは、まずは大まかな構造や機能を考え、それを小さな部品に分解していくこと。例えば、useNotes フックの全体像を考えた後、localStorage 関連の処理や位置生成の処理など、独立した機能ごとに関数を作ると良い。また、エラーハンドリングも忘れずに行うことで、より堅牢なコードになる。

// localStorage から付箋を読み込む
function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Note[]
  } catch {
    return []
  }
}

// localStorage に付箋を保存する
function saveNotes(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  } catch {
    // localStorage の容量超過など、保存失敗は無視する
  }
}

// ランダムな初期位置を生成する（ヘッダー下・画面内に収まるよう調整）
function getRandomPosition(): { x: number; y: number } {
  const margin = 80
  const headerHeight = 80
  const noteWidth = 288 // w-72
  const noteHeight = 176 // min-h-44

  const maxX = window.innerWidth - noteWidth - margin
  const maxY = window.innerHeight - noteHeight - margin

  return {
    x: Math.max(margin, Math.random() * Math.max(maxX, margin)),
    y: Math.max(headerHeight + margin, Math.random() * Math.max(maxY, headerHeight + margin)),
  }
}

export interface UseNotesReturn {
  notes: Note[]
  addNote: (color?: NoteColor) => void
  updateNote: (id: string, content: string) => void
  deleteNote: (id: string) => void
  moveNote: (id: string, position: { x: number; y: number }) => void
  changeColor: (id: string, color: NoteColor) => void
  togglePin: (id: string) => void
  pinnedCount: number
  canPin: boolean
}

export function useNotes(): UseNotesReturn {
  const [notes, setNotes] = useState<Note[]>(loadNotes)

  // 付箋が変化したら localStorage に保存
  useEffect(() => {
    saveNotes(notes)
  }, [notes])
  // 付箋の追加
  const addNote = useCallback((color: NoteColor = DEFAULT_COLOR) => {
    const now = Date.now()
    const newNote: Note = {
      id: `note-${now}-${Math.random().toString(36).slice(2, 7)}`,
      content: '',
      color,
      position: getRandomPosition(),
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    }
    setNotes((prev) => [...prev, newNote])
  }, [])
  // 付箋の内容更新
  const updateNote = useCallback((id: string, content: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, content, updatedAt: Date.now() } : note,
      ),
    )
  }, [])
  // 付箋の削除
  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
  }, [])
  // 付箋の移動
  const moveNote = useCallback((id: string, position: { x: number; y: number }) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, position } : note)),
    )
  }, [])
  // 付箋の色変更
  const changeColor = useCallback((id: string, color: NoteColor) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, color, updatedAt: Date.now() } : note,
      ),
    )
  }, [])
  // 付箋の固定/解除
  const togglePin = useCallback((id: string) => {
    setNotes((prev) => {
      const target = prev.find((n) => n.id === id)
      if (!target) return prev

      // 固定解除は常に可能
      if (target.isPinned) {
        return prev.map((note) =>
          note.id === id ? { ...note, isPinned: false } : note,
        )
      }

      // 固定する場合は上限チェック
      const currentPinnedCount = prev.filter((n) => n.isPinned).length
      if (currentPinnedCount >= MAX_PINNED_NOTES) return prev

      return prev.map((note) =>
        note.id === id ? { ...note, isPinned: true } : note,
      )
    })
  }, [])

  const pinnedCount = notes.filter((n) => n.isPinned).length
  const canPin = pinnedCount < MAX_PINNED_NOTES

  return {
    notes, // 付箋の配列
    addNote, // 追加
    updateNote, // 内容更新
    deleteNote, // 削除
    moveNote, // 移動
    changeColor, // 色変更
    togglePin, // 固定/解除
    pinnedCount, // 現在固定されている付箋の数
    canPin, // これ以上固定できるかどうか
  }
}
