// 何をしているコード？
// hooks の返り値を components に props として配る「橋渡し」

// 背景のグラデーション
// ヘッダー表示
// 付箋の z-index 管理（フォーカスされた付箋を最前面に表示するため）
// WelcomeScreen の表示（付箋がないときに表示）
// 各付箋にカスタムフックの関数を props として渡す

// わからない点

// 背景のグラデーションの実装方法（3つのdivの閉じタグがないのも気になる）
// 土台にグラデーション背景色が合って、その上にさらにグラデーションの装飾レイヤーを重ねることで、より複雑で美しい背景を作り出している
// 土台の上のレイヤーは装飾の役目のみで中身がないため閉じタグがなく /> で自己完結している

// z-index 管理のロジック
// handleFocus 関数 順番を入れ替えて記録 フォーカスされた付箋のidを focusOrder 配列の最後に追加することで、常に最後にフォーカスされた付箋が配列の最後に来るようにしている
// getZIndex 関数 順番からz-indexを計算 フォーカスされた付箋のidが配列に存在しない場合は10を返し、存在する場合は10 + 配列のインデックスを返すため、handleFocus 関数によって配列の最後にあるフォーカスされた付箋のインデックスが一番大きくなるのでz-indexも最前面になる

import { useState, useCallback } from 'react'
import { Header } from '@/components/Header'
import { StickyNote } from '@/components/StickyNote'
import { WelcomeScreen } from '@/components/WelcomeScreen'
import { useNotes } from '@/hooks/useNotes'

function App() {
  const { notes, addNote, updateNote, deleteNote, moveNote, changeColor, togglePin, pinnedCount, canPin } =
    useNotes()

  // フォーカスされた付箋を最前面に表示するための z-index 管理
  const [focusOrder, setFocusOrder] = useState<string[]>([])

  // フォーカスされた付箋のidを除外してまず配列に追加、最後にフォーカスされたidを追加して常に配列の最後にする
  // これにより、最後にフォーカスされた付箋が常に配列の最後に来るため、z-indexも最前面になる
  const handleFocus = useCallback((id: string) => {
    setFocusOrder((prev) => {
      const filtered = prev.filter((v) => v !== id)
      return [...filtered, id]
    })
  }, [])

  // 各付箋のz-indexを計算する関数
  // 全ての付箋にpropsとしてのidを引数として渡されているため、getZIndex関数はそのidをもとに配列のインデックスを計算してz-indexを返す
  const getZIndex = (id: string) => {
    // フォーカスされた付箋のidが-1の場合は10、それ以外は10 + 配列のインデックスを返す
    // フォーカスされた付箋のidが-1になるのはどんな時か？ => フォーカスされた付箋のidが配列に存在しない場合（初期状態や、何らかの理由でidが配列から削除された場合など）
    const idx = focusOrder.indexOf(id)
    return idx === -1 ? 10 : 10 + idx
  }

  return (
    // 背景: 3層グラデーション
    <div className="relative min-h-svh bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* 装飾レイヤー 1 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
      {/* 装飾レイヤー 2: 大きな blur 円 */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />
      {/* 装飾レイヤー 3: 小さな blur 円 */}
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-pink-400/10 to-orange-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* ヘッダー */}
      <Header
        noteCount={notes.length}
        pinnedCount={pinnedCount}
        onAddNote={addNote}
      />

      {/* メインコンテンツ */}
      <main className="relative w-full" style={{ minHeight: '100svh' }}>
        {notes.length === 0 ? (
          <WelcomeScreen onAddNote={addNote} />
        ) : (
          notes.map((note) => (
            <StickyNote
              // note.id は、useNotes フック内で生成される
              key={note.id} // 付箋のidをkeyとして渡す Reactがリストの各要素を識別するための特別な属性 UUIDなど固定の一意ID
              note={note}
              onUpdate={updateNote}
              onDelete={deleteNote}
              onMove={moveNote}
              onColorChange={changeColor}
              onTogglePin={togglePin}
              canPin={canPin}
              zIndex={getZIndex(note.id)}
              onFocus={handleFocus}
            />
          ))
        )}
      </main>
    </div>
  )
}

export default App
