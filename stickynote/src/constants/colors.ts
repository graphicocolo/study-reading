// 付箋の色の定義と関連するユーティリティ関数

import type { NoteColor } from '@/types'

export interface ColorConfig {
  name: string
  value: NoteColor
  // Tailwind クラス（付箋背景）
  bgClass: string
  // アクセントカラー（ボーダー・シャドウ用）
  accent: string
}

export const COLORS: ColorConfig[] = [
  {
    name: 'サンシャイン',
    value: 'sunshine',
    bgClass: 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300/30',
    accent: '#FCD34D',
  },
  {
    name: 'スカイ',
    value: 'sky',
    bgClass: 'bg-gradient-to-br from-sky-100 to-sky-200 border-sky-300/30',
    accent: '#7DD3FC',
  },
  {
    name: 'ミント',
    value: 'mint',
    bgClass: 'bg-gradient-to-br from-emerald-100 to-emerald-200 border-emerald-300/30',
    accent: '#6EE7B7',
  },
  {
    name: 'ローズ',
    value: 'rose',
    bgClass: 'bg-gradient-to-br from-rose-100 to-rose-200 border-rose-300/30',
    accent: '#FDA4AF',
  },
  {
    name: 'ラベンダー',
    value: 'lavender',
    bgClass: 'bg-gradient-to-br from-violet-100 to-violet-200 border-violet-300/30',
    accent: '#C4B5FD',
  },
  {
    name: 'ピーチ',
    value: 'peach',
    bgClass: 'bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300/30',
    accent: '#FDBA74',
  },
  {
    name: 'ライム',
    value: 'lime',
    bgClass: 'bg-gradient-to-br from-lime-100 to-lime-200 border-lime-300/30',
    accent: '#BEF264',
  },
  {
    name: 'クラウド',
    value: 'cloud',
    bgClass: 'bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300/30',
    accent: '#CBD5E1',
  },
] as const // readonlyにした上で、リテラル型を維持するためにas constを使用

export const DEFAULT_COLOR: NoteColor = 'sunshine'

// 色名から ColorConfig を取得するユーティリティ
// 付箋の色を変える機能で使用されると思われる
export function getColorConfig(value: NoteColor): ColorConfig {
  return COLORS.find((c) => c.value === value) ?? COLORS[0]
}

// 追記：色名のファイルを跨いだ分散問題
// study-reading/stickynote/reading.md に深掘り