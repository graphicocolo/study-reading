# TODOアプリ コード読解

## アプリ全体の流れ

```
useTodos.js
  └─ todos の状態管理・localStorage 永続化・操作関数を提供
       ↓
App.jsx（ハブ）
  ├─ TodoInput に addTodo を渡す
  └─ TodoList に todos と操作関数を渡す
       ↓
TodoList.jsx
  └─ todos を map して TodoItem を並べる
       ↓
TodoItem.jsx
  └─ 1件のタスクを表示・編集・削除・完了切り替え
```

---

## ファイルごとの要約

### hooks/useTodos.js

Todoの一覧を `useState` で管理し、追加・編集・削除・完了切り替え・並び替えの操作関数を提供する。データはローカルストレージに永続化され、ページを再読み込みしても状態が維持される。

**ポイント**

- `useState` の初期値に関数を渡すことで、`localStorage` の読み込みを初回レンダリング時だけ実行している
- `try/catch` でデータが壊れていてもクラッシュせず空配列で起動できる
- `useEffect` で `todos` が変わるたびに `localStorage` へ保存

### App.jsx

hooks と components をつなぐハブ。`useTodos` から受け取った状態と操作関数を各コンポーネントに props として渡す。タスク完了時は `handleToggle` 経由で紙吹雪を発火してから `toggleTodo` を実行する（未完了→完了のときだけ）。

**ポイント**

- `totalCount` / `completedCount` / `activeCount` はここで計算して渡す
- カウンター表示と削除ボタンは条件付き表示（`todos` が0件のときは非表示）
- 紙吹雪は `fireConfetti()` → `toggleTodo(id)` の順で実行される

### components/TodoInput.jsx

入力されたテキストを `useState` で状態管理し、フォーム送信時に `onAdd` ハンドラーに渡す。送信後は入力欄をリセットする。

### components/TodoList.jsx

タスクデータ（todos）を受け取り、`map` で `TodoItem` を並べて表示する。タスクが0件のときは空状態メッセージ（SVG＋テキスト）を表示する。ドラッグによる並び替えが可能。

### components/TodoItem.jsx

単一のタスクデータを受け取り1件のタスクを表示する。編集・削除・完了切り替え・並び替えが可能。編集モードに入ると `useRef` でinputにフォーカスが当たり、キーボード操作（Enter で確定・Escape でキャンセル）にも対応している。
