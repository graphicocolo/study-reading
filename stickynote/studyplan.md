# 付箋メモアプリ 読解プラン

## アプリの全体像

ドラッグ＆ドロップで動かせる付箋メモアプリ。付箋の追加・編集・削除・色変更・固定ができ、データは localStorage に永続化される。

## 読解の順番

types（データの形） → constants（定数・色設定） → hooks（状態管理ロジック） → App.tsx（橋渡し） → components（画面表示） → lib（ユーティリティ）

**ポモドーロとの違い**: このアプリは hooks が1つ（`useNotes`）でシンプルだが、**ドラッグ操作**と**z-index管理**という UI 固有のロジックが加わっている点に注目する。

---

## ① types/index.ts

アプリ全体で使うデータの「型」を定義する出発点。ここを読むと「付箋とは何か」がわかる。

- `NoteColor` ユニオン型（8色）
- `Note` インターフェース（id / content / color / position / isPinned / createdAt / updatedAt）
- `MAX_PINNED_NOTES` 定数（固定上限 = 3）

- [x] src/types/index.ts

## ② constants/colors.ts

付箋の色に関する定数ファイル。`ColorConfig` 型・`COLORS` 配列・`getColorConfig()` の3点セット。

- [x] src/constants/colors.ts

## ③ hooks/useNotes.ts

付箋の状態管理をまるごと担うカスタムフック。このアプリの「脳みそ」。

localStorage永続化・全操作のメモ化

読むときに注目するポイント：
- `loadNotes` / `saveNotes`：localStorage との橋渡し（初期化・副作用）
- `getRandomPosition()`：新しい付箋の初期位置をランダムに計算
- `useCallback` で全操作をメモ化している理由（再レンダリング抑制）
- `togglePin` の中の上限チェックのロジック

- [x] src/hooks/useNotes.ts

## ④ App.tsx

hooks の返り値を components に props として配る「橋渡し」ファイル。加えて、このアプリ独自の **z-index 管理**（フォーカス順）も担っている。

読むときに注目するポイント：
- `focusOrder` 配列でどうやって最前面表示を実現しているか
- `getZIndex()` の計算ロジック
- 背景の3層グラデーション（装飾レイヤーの構造）
- `notes.length === 0` の分岐（WelcomeScreen の出しわけ）

- [x] src/App.tsx

## ⑤ components/StickyNote.tsx

アプリの中心コンポーネント。付箋1枚の表示・ドラッグ・編集・削除・色変更・固定をすべて担う。このファイルが一番複雑。

コンポーネントとフックの境界線判断にも迷う

読むときに注目するポイント：
- `dragState`（`useRef`）でドラッグ状態を保持する理由（`useState` でないのはなぜか）
- `window` にイベントリスナーを登録する方式（`useEffect` でのクリーンアップも確認）
- マウス操作とタッチ操作が並列で実装されている構造
- `isPinned` の時はドラッグを無効化する条件分岐
- カラーピッカーの外クリックで閉じる処理（別の `useEffect`）

### このコンポーネントファイルコードの複雑さの原因

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

- [x] src/components/StickyNote.tsx

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

#### `dragState`（`useRef`）でドラッグ状態を保持する理由（`useState` でないのはなぜか）

**そもそも `useRef` とは？**

study-archive/react/react-hooks.md より

> ミューテーブル（「中身を自由に書き換えられる」という意味）な参照を作成するため、画面の再描画なしに値を保持する箱

この場合、「再描画なしに」というのがポイント

**`useState` ではなく `useRef` である理由**

`useState` で状態管理された値は、直接書き換えは不可で `set○○` を通しての書き換えが必要。ドラッグ操作のような頻繁に書き換えが必要な場合、操作の都度イベントハンドラ で`set○○` を実行するとその度に画面の再描画が起こり、表示が乱れる

なのでこの場合は `useState` ではなく `useRef` が使われている

#### `window` にイベントリスナーを登録する方式

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

#### マウス操作とタッチ操作が並列で実装されている構造

「並列で実装されている」= マウス用とタッチ用、2本のレールが同時に走っているという意味です。スレッドが同時に走る「並列処理」ではなく、「同じ機能を2系統で実装している」という意味です。

マウス系:
onMouseDown (付箋要素)  →  mousemove (window)  →  mouseup (window) 

タッチ系:
onTouchStart (付箋要素) →  touchmove (window)  →  touchend (window) 

同じ「付箋をドラッグする」という目的のために、マウス用とタッチ用がそれぞれ独立して書かれています。

#### onMouseDown, handleMouseDown, handleMouseMove の関係

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

## ⑥ components/ColorPicker.tsx ← **今このテーマを学習中**  🔥 現在地

色を選ぶポップアップ。`COLORS` 配列を map で回してボタンを並べるシンプルな構造。

- [ ] src/components/ColorPicker.tsx

## ⑦ components/Header.tsx

固定ヘッダー（Glassmorphism デザイン）。付箋数・固定数の表示と「追加」ボタンを担う。

- [ ] src/components/Header.tsx

## ⑧ components/WelcomeScreen.tsx

付箋が0件のときに表示する空状態画面。シンプルな表示コンポーネント。

- [ ] src/components/WelcomeScreen.tsx

## ⑨ lib/utils.ts

`cn()` ユーティリティ（clsx + tailwind-merge）。ポモドーロと同じパターン。

- [ ] src/lib/utils.ts

---

## useRef 復習（読解前の準備）

### ① useState と useRef の違い

どちらも「値を覚えておく箱」だが、**再レンダリングを起こすかどうか**が根本的に違う。

| | useState | useRef |
|---|---|---|
| 値を変えると？ | **画面が更新される** | 画面は更新されない |
| 値はいつリセットされる？ | 再レンダリングのたびに関数が走るが値は保持 | コンポーネントが消えるまで保持 |
| 書き方 | `const [value, setValue] = useState(0)` | `const ref = useRef(0)` |
| 読み書き | `value` / `setValue(1)` | `ref.current` / `ref.current = 1` |

```ts
// useState — 変えたら画面が更新される
const [count, setCount] = useState(0)
setCount(1) // → 画面が再描画される

// useRef — 変えても画面は更新されない
const count = useRef(0)
count.current = 1 // → 画面は何も変わらない。でも値は 1 になっている
```

**どっちを使う？の判断基準**

> 「この値が変わったとき、画面を更新する必要があるか？」
> - Yes → `useState`
> - No（でも値は覚えておきたい） → `useRef`

---

### ② 「ミューテーブルな参照を作成するため、画面の再描画なしに値を保持する箱」とは

一言ずつ分解すると理解しやすい。

**「ミューテーブルな（mutable）」**
= 「中身を自由に書き換えられる」という意味。

Reactのstateはイミュータブル（直接書き換えNGのルール）だが、`useRef` の `.current` は直接書き換えていい。

```ts
// useState は直接書き換えNG（イミュータブル）
state.count = 1 // ❌ ダメ！setCountを使わないと

// useRef は直接書き換えOK（ミュータブル）
ref.current = 1 // ✅ これでいい
```

**「参照を作成する」**
= `useRef(0)` で作られるのは `{ current: 0 }` というオブジェクト。`.current` の中に値が入っている。「参照」とは、その箱（オブジェクト）へのポインタのようなもの。

**「画面の再描画なしに」**
= `.current` を書き換えても、Reactは「変わった！」と気づかないので画面は更新されない。

**「値を保持する箱」**
= 再レンダリングが起きても、`.current` の中身はリセットされずに残り続ける（普通の変数は再レンダリングで初期化されるのに対して）。

**中学生向けのたとえ**

> 黒板（useState）と、先生の手元のメモ帳（useRef）の違い。
>
> - 黒板に書いた値が変わると → クラス全員が気づいて画面が更新される（再レンダリング）
> - メモ帳の値が変わっても → 先生だけが知っていて、クラスには知らせない（再レンダリングなし）
>
> でもメモ帳の中身は消えずにずっと残っている。次にメモ帳を開けば、前に書いた値が読める。

**このアプリでの使われ方（StickyNote.tsx）**

```ts
const dragState = useRef<DragState>({
  isDragging: false,
  startX: 0,
  ...
})
```

ドラッグ中は `mousemove` が1秒に何十回も発火する。その度に state を更新すると画面が何十回も再描画されてガクガクする。`useRef` に保持することで、「値は覚えておくが、画面は更新しない」を実現している。

---

### ③ 実務での useRef の使用頻度

**結論：直接使う機会は少ない。でも知っておく価値は高い。**

| 用途 | 頻度 | 備考 |
|---|---|---|
| DOM要素への参照（フォームにフォーカス当てるなど） | 中 | これは今も普通に使う |
| ドラッグ・タイマー等の「画面に出さない値」の保持 | 低〜中 | ライブラリが隠蔽してくれることも多い |
| 前回の値を覚えておく（previous value） | 低 | カスタムフックにまとめることが多い |

**よく使うライブラリとの関係**

- **TanStack Query（React Query）**: サーバーデータの取得・キャッシュを担う。`useEffect` + `fetch` + `useState` の組み合わせをまるごと置き換える。内部では `useRef` を使っているが、使う側は意識しなくていい。
- **React Hook Form**: フォームの状態管理。実は内部で `useRef` を多用している（再レンダリングを最小化するため）。使う側は意識しなくていい。

**まとめ**

> ライブラリが「内側で useRef を使って最適化してくれている」ことが多い。
> 使う側は意識しなくていいが、「なぜ useRef が必要なのか？」を知っていると、ライブラリが何をしてくれているのかが理解できる。
> このアプリのドラッグ実装は「ライブラリなしで useRef の本質を学べる」良い教材。

---

## このアプリで学べる新しいパターン

| パターン | 登場箇所 |
|---|---|
| `useRef` でドラッグ状態管理（再レンダリングなし） | StickyNote.tsx |
| `window` へのイベントリスナー登録＋クリーンアップ | StickyNote.tsx |
| タッチ操作対応（`{ passive: false }`） | StickyNote.tsx |
| 配列で z-index を動的管理 | App.tsx |
| localStorage の読み書き（try/catch） | useNotes.ts |
| `useState` の初期値に関数を渡す遅延初期化 | useNotes.ts（`useState<Note[]>(loadNotes)`） |

---

## コードリーディングのコツ（ポモドーロ編から引継ぎ）

### 読む順番

1. **`import` を流し読みする** — 何のライブラリや自作コンポーネントを使っているか把握。細部は後回しでOK。
2. **`interface` / Props 型を読む** — 「何を受け取るか」が全て書いてある。これだけでコンポーネントの役割が分かる。
3. **JSXの構造をざっくり把握する** — 最初は細部より「どんなブロックが並んでいるか」を掴む。コメント（`{/* */}`）がガイドになる。
4. **`on〇〇` のコールバックがどこで呼ばれるか追う** — 「ユーザー操作 → 何が起きるか」の流れが分かる。
5. **条件分岐（三項演算子・`&&`）に注目する** — 「何が変わると表示が変わるか」＝ state / props の影響範囲が分かる。

### 心構え

- **「一言で言うと何するコンポーネント？」** と常に問いかける
- 分からない部分は飛ばして後から戻る
- `useRef` が出てきたら「なぜ state でないのか？」を考える

---

ドラッグ系ライブラリの例

dnd-kit、react-draggable、Framer Motion などがある