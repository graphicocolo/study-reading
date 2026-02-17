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
