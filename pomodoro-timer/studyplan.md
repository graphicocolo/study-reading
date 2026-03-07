# ポモドーロタイマー 読解プラン

## 読解の順番

hooks（ロジック） → App.tsx（橋渡し） → components（画面表示） → lib（ユーティリティ）

## 読解済み

- [x] src/hooks/useAudio.ts
- [x] src/hooks/useTimer.ts
- [x] src/hooks/useTimerSettings.ts
- [x] src/hooks/useTheme.ts

## 次にやること

### ① App.tsx

hooks と components をつなぐ場所。hooks から受け取った値や関数を、components に props として渡している。「hooks で作ったロジックが、どうやって画面部品に届くのか」がわかるファイル。

### ② components/timer/

アプリの中心部分。読解済みの useTimer の返り値がどう画面に反映されるか確認できる。

- [ ] TimerDisplay.tsx
- [ ] TimerProgress.tsx
- [ ] TimerControls.tsx
- [ ] TimerPhaseIndicator.tsx

### ③ components/settings/

設定画面まわり。useTimerSettings / useAudio の返り値がどう使われるか確認できる。

- [ ] SettingsPanel.tsx
- [ ] TimeSettings.tsx

### ④ components/theme/

テーマ切り替え。useTheme の返り値がどう使われるか確認できる。

- [ ] ThemeToggle.tsx

### ⑤ lib/

定数やユーティリティ関数。hooks や components から import されている補助的なコード。

- [ ] constants.ts
- [ ] time.ts
- [ ] utils.ts

---

## コードリーディングのコツ（Reactコンポーネント編）

### 読む順番

1. **`import` を流し読みする** — 何のライブラリや自作コンポーネントを使っているか把握。細部は後回しでOK。
2. **`interface` / Props 型を読む** — 「何を受け取るか」が全て書いてある。これだけでコンポーネントの役割が分かる。
3. **JSXの構造をざっくり把握する** — 最初は細部より「どんなブロックが並んでいるか」を掴む。コメント（`{/* */}`）がガイドになる。
4. **`on〇〇` のコールバックがどこで呼ばれるか追う** — 「ユーザー操作 → 何が起きるか」の流れが分かる。
5. **条件分岐（三項演算子・`&&`）に注目する** — 「何が変わると表示が変わるか」＝ state / props の影響範囲が分かる。

### 心構え

- **「一言で言うと何するコンポーネント？」** と常に問いかける
- 分からない部分は飛ばして後から戻る
- 型コメント（`/** */`）は仕様書として読む
