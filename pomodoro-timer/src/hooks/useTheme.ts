// UI のテーマ設定を管理するカスタムフック
// useTheme.ts の役割 「状態の管理」と「ロジック」をすべて担う
// localStorage への保存・読み込み
// OS のダークモード設定の監視
// theme の状態管理（useState）
// toggleTheme 関数（light ↔ dark の切り替え処理）
import { useState, useCallback, useEffect } from 'react'
import type { Theme } from '@/types/timer' // テーマの型定義
import { STORAGE_KEYS } from '@/lib/constants' // ローカルストレージのキー定数

// 1. 返り値の型定義
// 2. システム設定からテーマを取得
// 3. ローカルストレージから保存されたテーマを取得
// 4. テーマを管理するカスタムフック
// 4-1. テーマをDOMとローカルストレージに反映
// 4-2. システム設定の変更を監視
// 4-3. テーマの切り替えと設定関数を提供
// 4-4. フックの返り値として現在のテーマと操作関数を返す

// カスタムフックの返り値の型定義
export interface UseThemeReturn {
  /** 現在のテーマ */
  theme: Theme
  /** テーマを切り替え */
  toggleTheme: () => void
  /** テーマを設定 */
  setTheme: (theme: Theme) => void
}

/**
 * システム設定からテーマを取得
 * ここでは、ローカルストレージに保存されたテーマがないとき、この仕組みでOSの設定に合わせたテーマを自動で選ぶために使っている
 */
function getSystemTheme(): Theme {
  // コードがサーバー側（Node.js）で実行されている場合のチェック
  // window はブラウザが提供するオブジェクトです。サーバー（Node.js）にはブラウザがないので window が存在しません。
  // ブラウザで実行 → window がある
  // サーバーで実行 → window がない
  // なぜこのチェックが必要か Next.js のようなフレームワークでは、コンポーネントがまずサーバー側で実行されてHTMLを作り、その後ブラウザに送られる（サーバーサイドレンダリング）ことがあります。サーバー側で実行されたとき、window.matchMedia(...) や localStorage を使うとエラーになります。window がそもそも存在しないからです。
  // このコードは「今ブラウザで動いている？それともサーバーで動いている？」を判定する定番のパターン
  if (typeof window === 'undefined') return 'light' // サーバーサイドレンダリング対策
  // prefers-color-scheme: dark ユーザーのOS設定が「ダークモード」かどうかを表すCSSのメディア特性
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * ローカルストレージから保存されたテーマを取得
 */
function getSavedTheme(): Theme | null {
  if (typeof window === 'undefined') return null // サーバーサイドレンダリング対策
  const saved = localStorage.getItem(STORAGE_KEYS.THEME) // ローカルストレージからテーマを取得
  if (saved === 'light' || saved === 'dark') return saved
  return null
}

/**
 * テーマを管理するカスタムフック
 * テーマをDOMとローカルストレージに反映
 * システム設定の変更を監視
 * テーマの切り替えと設定関数を提供
 */
export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>(() => {
    // ローカルストレージから取得、なければシステム設定
    return getSavedTheme() ?? getSystemTheme()
  })

  // テーマをDOMとローカルストレージに反映
  useEffect(() => {
    //  Document インターフェイスの読み取り専用プロパティで、 document のルート要素である Element を返します（例えば、HTML 文書の場合は <html> 要素）。
    const root = document.documentElement

    // クラスを更新
    root.classList.remove('light', 'dark') // 既存のテーマクラスを削除
    root.classList.add(theme) // 新しいテーマクラスを追加

    // ローカルストレージに保存
    localStorage.setItem(STORAGE_KEYS.THEME, theme)
  }, [theme])

  // システム設定の変更を監視
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)') // メディアクエリリストを作成 「OSのダークモード設定」を監視するためのオブジェクトを取得 監視対象（OSのダークモード設定）

    // 変更イベントのリスナーを追加
    const handleChange = (e: MediaQueryListEvent) => {
      // ユーザーが明示的にテーマを設定していなければシステム設定に従う
      const saved = getSavedTheme()
      if (!saved) {
        setThemeState(e.matches ? 'dark' : 'light')
      }
    }

    // 'change' = イベントの種類（設定が切り替わったとき）
    // handleChange = イベントリスナー（切り替わったら実行する関数）
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange) // クリーンアップ関数（コンポーネントがアンマウントされるときや依存関係が変わるときに呼び出される）でリスナーを削除
  }, [])

  // テーマ切り替え
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  // テーマ設定
  // 現在 setTheme はどこにも使われていない
  // 将来的に例えば設定パネルにテーマ選択ドロップダウンを追加するような拡張に備えて用意された関数
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
  }, [])

  return {
    theme, // 現在のテーマ
    toggleTheme, // テーマを切り替え関数
    setTheme, // テーマを設定関数
  }
}
