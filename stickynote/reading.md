# 付箋メモアプリ コード読解

---

study-reading/stickynote/src/types/index.tsでNoteColorで色の名前を型で定義しているが、study-reading/stickynote/src/constants/colors.tsのCOLORSのvalueでNoteColorで定義されている色の名前を代入している。記述が分散しているが良いまとめ方はあるか

```ts
// types/index.ts — 色の名前を型として定義
type NoteColor = 'sunshine' | 'sky' | 'mint' | ...

// constants/colors.ts — 同じ名前を value として再び書く
{ value: 'sunshine', ... }
{ value: 'sky', ... } 
```

新しい色を追加するとき、2ファイルを両方変えないといけない。片方だけ変えるとバグになる。

## 改善策：データから型を導出する（Single Source of Truth）

`COLORS` 配列を「唯一の情報源」にして、型をそこから自動で生成する。

```ts
// constants/colors.ts だけに書く

export const COLORS = [
  { name: 'サンシャイン', value: 'sunshine', bgClass: '...', accent: '...' },
  { name: 'スカイ',       value: 'sky',       bgClass: '...', accent: '...' },
] as const  // ← 配列の中身をリテラル型として認識させる

// 型を配列から自動生成
export type NoteColor = typeof COLORS[number]['value']
// → 'sunshine' | 'sky' | ... が自動で作られる
```

### `as const` と `typeof COLORS[number]['value']` の意味

**`as const`**
TypeScript に「この配列の `value` は `string` じゃなくて `'sunshine'` というリテラル型だよ」と教えるおまじない。これがないと `NoteColor` が `string` になってしまう。

**`typeof COLORS[number]['value']`**

| 部分 | 意味 |
|---|---|
| `typeof COLORS` | COLORS 配列の型を取得 |
| `[number]` | 配列の各要素の型を取得（`number` は「何番目でも」という意味） |
| `['value']` | その要素の `value` プロパティの型を取り出す |

結果として `'sunshine' \| 'sky' \| 'mint' \| ...` という union 型が自動で作られる。

### このパターンのメリット

色を追加するとき、`COLORS` 配列に1行追加するだけで型も自動で更新される。

```ts
// これだけで NoteColor に 'coral' が自動追加される
{ name: 'コーラル', value: 'coral', bgClass: '...', accent: '...' },
```

### このアプリがあえて分散させている理由

`types/index.ts` に `NoteColor` を置いているのは、`Note` インターフェースと一緒に型を管理したいという設計判断。どちらも一般的な書き方だが、「データから型を導出する」パターンの方が修正漏れが起きにくい。

