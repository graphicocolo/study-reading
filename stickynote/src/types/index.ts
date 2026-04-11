// 付箋の型定義

// 付箋の色の種類
// ユニオン型
// なぜtypeエイリアスを使うのか？
// ユニオン型は type エイリアスで定義するのが一般的だから
// インターフェースはオブジェクトの形状を定義するのに適しているから
export type NoteColor =
  | 'sunshine'
  | 'sky'
  | 'mint'
  | 'rose'
  | 'lavender'
  | 'peach'
  | 'lime'
  | 'cloud'

// 付箋についてのインターフェース
export interface Note {
  id: string
  content: string
  color: NoteColor
  position: { x: number; y: number }
  isPinned: boolean
  createdAt: number
  updatedAt: number
}

// ↓これは src/constants/note.ts に移動するべきかもしれない
// 固定できる付箋の最大数
export const MAX_PINNED_NOTES = 3

// 追記：NoteColorのユニオン型の中身がstudy-reading/stickynote/src/constants/colors.tsに分散している
//  「型とデータが二箇所に分散していて、片方を変えると片方も変えなければならない」 問題
// 例えば新しい色を追加するとき、2ファイルを両方変えないといけない。片方だけ変えるとバグになる
// study-reading/stickynote/reading.md に深掘り