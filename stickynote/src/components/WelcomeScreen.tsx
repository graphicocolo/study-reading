import { StickyNote, MousePointerClick, Pin, Palette } from 'lucide-react'

interface WelcomeScreenProps {
  onAddNote: () => void
}

const features = [
  {
    icon: MousePointerClick,
    title: 'ドラッグ＆ドロップ',
    desc: '付箋を自由に配置できます',
  },
  {
    icon: Palette,
    title: '8色のカラー',
    desc: 'お気に入りの色でメモを彩りましょう',
  },
  {
    icon: Pin,
    title: '最大3件固定',
    desc: '重要なメモを固定して目立たせましょう',
  },
]

// 付箋が0件のときに表示するウェルカム画面
export function WelcomeScreen({ onAddNote }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full relative z-10 pt-20 md:pt-30">
      <div className="text-center max-w-2xl mx-auto px-6">
        {/* 装飾アイコン */}
        <div className="mb-8 relative inline-block">
          <div className="w-28 h-28 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-xl">
            <StickyNote className="w-14 h-14 md:w-16 md:h-16 text-blue-500" />
          </div>
          <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse" />
        </div>

        {/* グラデーションタイトル */}
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-3">
          付箋を追加しましょう
        </h2>
        <p className="text-gray-500 mb-8 text-sm md:text-base">
          右上の「付箋を追加」ボタンから最初の付箋を作りましょう
        </p>

        {/* 機能紹介グリッド */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-sm"
            >
              <f.icon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
              <p className="text-gray-500 text-xs mt-1">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA ボタン */}
        <button
          onClick={() => onAddNote()}
          className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <StickyNote className="w-5 h-5" />
          最初の付箋を追加する
        </button>
      </div>
    </div>
  )
}
