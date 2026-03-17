// 複数のクラス名を結合しつつ、Tailwind の競合を解決する関数

// 条件付きでクラス名を結合する 
import { clsx, type ClassValue } from "clsx"
// Tailwind のクラスが競合したとき、後勝ちで解決する
import { twMerge } from "tailwind-merge"

// 実際の使われ方
// コンポーネント側でデフォルトクラスに、呼び出し元のクラスを上書き合成できる
// <Button className={cn('px-4 py-2', props.className)} />
// components/timer/TimerDisplay.tsx などを参照

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
