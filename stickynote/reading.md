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

---

study-reading/stickynote/src/App.tsx

getZIndexとgetZIndexがApp.tsxで記述されているのは、コンポーネントの配置側でイベントを感知するためですか？ロジックなのでuseNotesフックで記載できそうですが

関心の分離という設計判断です。

useNotes の責務は付箋データの永続化・操作（内容・色・位置・固定）に絞られています。

focusOrder はlocalStorageに保存しない、付箋データとは無関係な 「画面表示上の一時的なUI状態」 です。

もし useNotes に書いたらどうなるか

useNotes は複数の画面で使い回せる汎用フックになり得ます。しかし z-index やフォーカス順はUIの実装詳細なので、それを混ぜると「どこでも使えるフック」ではなく「この画面専用フック」になってしまいます。

判断基準のまとめ

- データとして永続・共有したい  → useNotes（またはカスタムフック）
- この画面だけの一時的なUI状態 → App.tsx（またはuseReducer）

「書けるかどうか」より「その責務がどこに属するか」で置き場所が決まります。

---

study-reading/stickynote/src/components/StickyNote.tsx

読むときに注目するポイント：
- `dragState`（`useRef`）でドラッグ状態を保持する理由（`useState` でないのはなぜか）
- `window` にイベントリスナーを登録する方式（`useEffect` でのクリーンアップも確認）
- マウス操作とタッチ操作が並列で実装されている構造
- `isPinned` の時はドラッグを無効化する条件分岐
- カラーピッカーの外クリックで閉じる処理（別の `useEffect`）

## このコンポーネントファイルコードの複雑さの原因

コンポーネントとフックの境界線判断にも迷う

「1枚の付箋が担う責務の多さ」にある。

```
StickyNote.tsx が持つ機能

  表示系
  ├─ 付箋の色・スタイルの表示
  └─ 更新日時の表示

  操作系
  ├─ ドラッグ移動（マウス＋タッチの2系統）
  ├─ テキスト編集
  ├─ 色変更（カラーピッカーの開閉も含む）
  ├─ 固定／固定解除
  └─ 削除
```

「今どの機能を読んでいるか」を意識しながら読むと、複雑さに飲み込まれにくい。

### 何をしているコードか

1つの付箋メモの UI を表示するコード。ユーザーから受け取った値を画面に表示し、ユーザー操作を親（App.tsx）に伝える

StickyNote.tsx は、App.tsx で import ・配置され、StickyNote.tsx の中で、useNotes から受け取った関数を呼ぶと App.tsx 経由で useNotes に届き、ロジックが実行される

### コードの流れ

- 関係データの import
- props や状態の型定義
- 状態や変数の定義
- イベントハンドラ定義
- 副作用の定義
  - イベントハンドラをイベントリスナーへ登録
  - useEffect（ドラッグ用イベントリスナーの登録（mousemove / mouseup など））
  - useEffect（カラーピッカーの外クリックで閉じる処理）
- 付箋ピン変数定義
- 付箋 UI
  - ヘッダー
    - カラーピッカー
    - 固定ピン
    - 削除ボタン
  - 付箋テキスト
  - フッター 更新日時

### props の内容

- 付箋についての情報
  - id
  - メモテキスト
  - 色
  - 位置情報
  - 固定状態
  - 作成日時、更新日時
- イベントハンドラ
  - 更新
  - 削除
  - 移動
  - 色変更
  - 固定
  - 操作中
- 現在の付箋の状態
  - 固定可能かどうか
  - 重なり順

### 読むときに注目するポイントについて

### `dragState`（`useRef`）でドラッグ状態を保持する理由（`useState` でないのはなぜか）

**そもそも `useRef` とは？**

study-archive/react/react-hooks.md より

> ミューテーブル（「中身を自由に書き換えられる」という意味）な参照を作成するため、画面の再描画なしに値を保持する箱

この場合、「再描画なしに」というのがポイント

**`useState` ではなく `useRef` である理由**

`useState` で状態管理された値は、直接書き換えは不可で `set○○` を通しての書き換えが必要。ドラッグ操作のような頻繁に書き換えが必要な場合、操作の都度イベントハンドラ で`set○○` を実行するとその度に画面の再描画が起こり、表示が乱れる

なのでこの場合は `useState` ではなく `useRef` が使われている

### `window` にイベントリスナーを登録する方式

ドラッグ中に**マウスが付箋の要素外に出ることがある**ため、`mousemove` / `mouseup` を `window` に登録している。

```
mousedown → 付箋の上で押す          ← 付箋要素にリスナー（onMouseDown）
mousemove → マウスは画面全体を動く  ← window にリスナーが必要
mouseup   → 画面のどこかで離す      ← window にリスナーが必要
```

もし `mousemove` を付箋要素だけに登録した場合、マウスを素早く動かすと付箋の外に出た瞬間にイベントが届かなくなり、ドラッグが途中で止まってしまう。

**代替手段：`setPointerCapture`**

`window` 以外の方法として `setPointerCapture` という API がある。「このポインターのイベントは、どこに動いてもこの要素に届けろ」と宣言できる。

```js
const handlePointerDown = (e) => {
  e.currentTarget.setPointerCapture(e.pointerId)  // キャプチャ開始
  // ...ドラッグ開始
}
const handlePointerMove = (e) => {
  // 要素の外に出ても届き続ける
}
const handlePointerUp = (e) => {
  e.currentTarget.releasePointerCapture(e.pointerId)
}
```

| 方法 | 登録場所 | mouse/touch の扱い |
|---|---|---|
| `window` にリスナー | `window`（グローバル） | 別々に書く必要あり |
| `setPointerCapture` | 付箋要素自身 | Pointer Events API で統一できる |

このコードが `window` 方式を採用しているのは、より広くサポートされており理解しやすいから。

### マウス操作とタッチ操作が並列で実装されている構造

「並列で実装されている」= マウス用とタッチ用、2本のレールが同時に走っているという意味です。スレッドが同時に走る「並列処理」ではなく、「同じ機能を2系統で実装している」という意味です。

マウス系:
onMouseDown (付箋要素)  →  mousemove (window)  →  mouseup (window) 

タッチ系:
onTouchStart (付箋要素) →  touchmove (window)  →  touchend (window) 

同じ「付箋をドラッグする」という目的のために、マウス用とタッチ用がそれぞれ独立して書かれています。

### onMouseDown, handleMouseDown, handleMouseMove の関係

`handleMouseDown`（54行目）と `handleMouseMove`（95行目）はどちらも**イベントハンドラ**（イベントが起きたときに実行される関数）。`onMouseDown`（176行目）は、その関数を付箋の `<div>` に**登録する仕組み**。

**登録方法が2種類ある**

```js
// ① React の JSX prop で登録（付箋要素に対して）
<div onMouseDown={handleMouseDown}>

// ② DOM の addEventListener で登録（window に対して）
window.addEventListener('mousemove', handleMouseMove)
```

`onMouseDown={handleMouseDown}` は React 流の書き方で、内部的には `div.addEventListener('mousedown', handleMouseDown)` と同じ。

**2つのハンドラの役割分担**

- `handleMouseDown` = **ドラッグの開始処理**（`isDragging: true` と押した座標を `dragState` に記録）
- `handleMouseMove` = **ドラッグ中の追跡処理**（移動量を計算して付箋を動かす）

```
ユーザー操作          イベント        実行されるハンドラ       登録方法
───────────────────────────────────────────────────────────────
付箋の上でクリック  → mousedown  →  handleMouseDown   ← JSX の onMouseDown
マウスを動かす      → mousemove  →  handleMouseMove   ← window.addEventListener
マウスを離す        → mouseup    →  handleEnd         ← window.addEventListener
```

「イベント開始だけは付箋の上で起きることが確定している、でも動く先・離す場所は画面のどこかわからない」という性質から、自然にこの登録先の分け方になっている

---

study-reading/stickynote/src/components/ColorPicker.tsx

## 何をしているコードか

付箋の現在の色と、色切り替えの操作（カラーピッカークリック）を親（StickyNote.tsx）に伝えるコード

色の型はユニオン型で、 study-reading/stickynote/src/types/index.ts で8種類の色が設定されている

カラーピッカー表示非表示は親（StickyNote.tsx）で制御（ピッカー以外の場所クリックで非表示となるため、親UIでの制御となる）、色の切り替えは親から App.tsx 経由で useNote.ts から関数を受け取って処理される

`cn()` による条件つきスタイリングで、選択中の色ボタンが目立つようにスタイリングされている

### コードの流れ

- 関係データの import
  - 定数化された色情報
  - 色の型
- props の型定義
- カラーピッカー UI
  - ピッカー文言（カラーを選択）
  - 各色ごとの色切り替えボタン

### props の内容

- 現在の色情報
- イベントハンドラ
  - 色切り替え