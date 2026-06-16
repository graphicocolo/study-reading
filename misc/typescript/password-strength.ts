// 全体の流れ
// ----------
// 1. 型定義
//  - StrengthLevel 強度レベル（ユニオン型、string でしかも値が限定的）
//  - Rule パスワード強度検査ルール
//  - PasswordResult パスワード検査結果
// 2. 変数定義
//  - rules パスワード強度を測る条件群
// 3. 関数定義
//  - toStrengthLevel 強度レベル出力
//  - checkPassword パスワード検査
//  - isPasswordResult 真偽値としてパスワード検査結果の存在確認出力
//  - formatResult 形式化されたパスワード検査結果出力
// 4. テスト
//  - testCases テストデータ
//  - testCases データをテスト

// 何をしているコードか
// ----------
// パスワード強度検査
// checkPassword で検査を行い（内部で toStrengthLevel を実行、結果の一部を強度レベルで返すため）、formatResult で形式化された結果を返す（内部で isPasswordResult を実行、形式に沿った結果内容かどうか判定）

// 特記事項
// ----------
// ●良い発想だと思った点
// 1.
// データ駆動を採用したパスワード強度検査
// 「ルール（データ）」と「実行ロジック」を分離するパターン。複数の関数を定義するアプローチに比べ、ルールが増えても実行ロジックを変更しなくてよい。
// ●どこがなぜ分かりやすかったか
// 特になし
// ●どこがなぜ分かりにくかったか
// 1.
// 検査結果を、isPasswordResult と formatResult の二段階を経て表示させているのはなぜか
// checkPassword の内部処理から、求められている形式以外のデータは返ってこなさそうに思える
// formatResult の中で空値チェックをしてしまっても良さそうだが
// ↓
// 今回のコードでは formatResult(checkPassword(pw)) と繋げて使っているので、checkPassword の戻り値は TypeScript が PasswordResult と知っています。
// formatResult(result: unknown) にしている理由は、「将来どんな値が渡ってきても壊れないようにする」防御的設計 です。たとえば formatResult(null) や formatResult("abc") を渡しても "invalid result" を返して例外を出さない、という保険です。
// 現状のコードでは過剰とも言えますが、外部から受け取ったデータをそのまま渡す可能性がある場面ではこのパターンが有効

// 1. 型定義
// ----------

// 強度レベル（ユニオン型、string でしかも値が限定的）
// パスワードの強度を、弱・中・強・より強、のいずれかのみで型付
type StrengthLevel = "weak" | "fair" | "strong" | "very-strong";

// パスワード強度検査ルール
// name 検査の内容
// test 検査を実施する関数 真偽値を返す（メールバリデーションの時と同様のパターン）
interface Rule {
  name: string;
  test: (password: string) => boolean;
}

// パスワード検査結果
// score 強度スコア
// level 強度レベル
// passed 合格だった検査項目 Rule の name が入る
// failed 不合格だった検査項目 Rule の name が入る
interface PasswordResult {
  score: number;
  level: StrengthLevel;
  passed: string[];
  failed: string[];
}

// 2. 変数定義
// ----------

// パスワード強度を測る項目群
// Rule 型のオブジェクトの集まり
// 具体的な強度検査内容とその実施関数がセット
const rules: Rule[] = [
  { name: "8文字以上", test: (p) => p.length >= 8 },
  { name: "大文字を含む", test: (p) => /[A-Z]/.test(p) },
  { name: "小文字を含む", test: (p) => /[a-z]/.test(p) },
  { name: "数字を含む", test: (p) => /[0-9]/.test(p) },
  { name: "記号を含む", test: (p) => /[^A-Za-z0-9]/.test(p) },
  { name: "12文字以上", test: (p) => p.length >= 12 },
];

// 3. 関数定義
// ----------

// 強度レベル出力
// score を引数として強度レベルを出力する
function toStrengthLevel(score: number): StrengthLevel {
  if (score <= 1) return "weak"; // 1以下は弱
  if (score <= 3) return "fair"; // 3以下は中
  if (score <= 5) return "strong"; // 5以下は強
  return "very-strong"; // 5より大きければより強
}

// パスワード検査
// 入力値を引数として以下の結果を返す
// スコア・強度レベル・合格だった検査項目（配列）・不合格だった検査項目（配列）
function checkPassword(input: unknown): PasswordResult {
  if (typeof input !== "string") {
    throw new TypeError("input must be a string");
  }

  const passed: string[] = [];
  const failed: string[] = [];

  // `checkPassword` は「`rules` を順番に回して、合格・不合格の配列に振り分ける」だけに専念しており、ルールの追加・削除に対して変更不要。
  for (const rule of rules) {
    if (rule.test(input)) {
      passed.push(rule.name);
    } else {
      failed.push(rule.name);
    }
  }

  // 検査に合格した配列の長さをスコアとして定義
  const score = passed.length;

  return {
    score, // スコア（合格した項目の数）
    level: toStrengthLevel(score), // 強度レベル
    passed, // 合格だった検査項目（配列）
    failed, // 不合格だった検査項目（配列）
  };
}

// 真偽値としてパスワード検査結果の存在確認出力
// formatResult の内部で使用することで、形式にそぐわないデータを弾く役割を担う
// 引数に検査結果となる何らかの値、真偽値として検査結果（型・空確認・PasswordResult で定義された必要な4つのキーが全て存在するか確認）が返る
// 引数の型は unknown 。「型が分からないものが来る可能性がある」という意思表示で、型ガードの典型的な使い方
function isPasswordResult(value: unknown): value is PasswordResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "score" in value &&
    "level" in value &&
    "passed" in value &&
    "failed" in value
  );
}

// 形式化されたパスワード検査結果出力
// 内部で isPasswordResult を実行し、形式にそぐわない結果は最初に弾く
// 引数に結果、形式に沿った検査結果が返る
function formatResult(result: unknown): string {
  if (!isPasswordResult(result)) {
    return "invalid result";
  }
  // 返る検査結果は下記形式の文字列
  // 強度レベル（大文字）・総合スコア（結果スコア（合格した項目の数） / パスワード強度を測る全項目 → 3 / 6 のような分数表記。 「〇個中〇個」という意味合いを表す）
  return `[${result.level.toUpperCase()}] score: ${result.score}/${rules.length}`;
}

// 4. テスト
// ----------

// テストデータ
const testCases = ["abc", "Password1", "MyP@ssw0rd", "C0mpl3x!Pass#2024"];

// データをテスト
// テストデータ配列を要素ごとに 要素の値: 形式化された検査結果 の形式でコンソール出力
// 不合格のものは 未達成: 要素の値, ... としてコンソール出力
for (const pw of testCases) {
  const result = checkPassword(pw);
  console.log(`"${pw}": ${formatResult(result)}`);
  if (result.failed.length > 0) {
    console.log(`  未達成: ${result.failed.join(", ")}`);
  }
}
