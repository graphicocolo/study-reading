// 全体の流れ
// ----------
// 1. 型定義
//  - FieldError 入力項目エラー
//  - ValidationResult 検証結果
//  - Validator<T> 検証のユーティリティ型
//  - RegistrationForm 検証対象のフォーム
// 2. 変数定義
//  - usernameValidators ユーザー名についての複数検証関数
//  - emailValidators メールアドレスについての複数検証関数
//  - passwordValidators パスワードについての複数検証関数
//  - ageValidators 年齢についての複数検証関数
// 3. 関数定義
//  - createValidator 検証処理の枠定義
//  - validateRegistrationForm フォーム検証ファサード関数
// 4. export
//  - validateRegistrationForm
//  - RegistrationForm, ValidationResult, FieldError
// 5. テスト
// testForms テストデータ
// 定義したテストデータを validateRegistrationForm() で検証

// 何をしているコードか
// ----------
// フォームの複数入力項目のバリデーション

// 特記事項
// ----------
// ●良い発想だと思った点
// 1.
// 検証処理をフォームの各項目ごとにまとめ、さらにそれをファサード関数の中でまとめて処理していて、コードがきれいにまとまっている
// ●どこがなぜ分かりやすかったか
// 1. 
// 
// ●どこがなぜ分かりにくかったか
// 1.
// なぜ usernameValidators が定義されているのか
// 各項目についての検証関数を保持するために、usernameValidators を定義しそこに結果を代入しているため
// 2. validateRegistrationForm の返り値
// valid: errors.length === 0 の箇所
// 見慣れない書き方
// オブジェクトリテラルの書き方で、valid というキーに errors.length === 0 の評価結果（true か false）をそのまま代入
// 3.
// filter((e): e is string => e !== null)
// (e): e is string は型述語といい、フィルター後の配列の型を (string | null)[] から string[] に絞り込んでいる
// ↓↓↓さらに詳しく↓↓↓
// validators.map(v => v(value)) の結果は (string | null)[]
// 各バリデーターがエラーなら文字列、パスなら null を返すため
// 例：["ユーザー名は3文字以上にしてください", null, null]
//
// filter の書き方の分解：
// .filter((e): e is string => e !== null)
//          ↑    ↑              ↑
//          引数  型述語         実際の条件
// e !== null      → 通常の filter の条件（null を除外する）
// (e): e is string → 「この条件が true なら e は string 型だ」と TypeScript に伝える宣言
//
// 型述語がないと TypeScript は絞り込み後も (string | null)[] のままと判断する
// 型述語があることで filter 後の配列が string[] として扱われる


// 1. 型定義
// ----------

// 入力項目エラー
// field 入力項目名
// message エラーメッセージ
type FieldError = {
  field: string;
  message: string;
};

// 検証結果
// valid 検証パスか否か
// errors 入力項目名とエラーメッセージの複数セット
type ValidationResult = {
  valid: boolean;
  errors: FieldError[];
};

// 検証のユーティリティ型
// value 何らかの値
// 何らかの値を受け取りテキストか null を返す
type Validator<T> = (value: T) => string | null;

// 検証対象のフォーム
// username ユーザー名
// email メールアドレス
// password パスワード
// age 年齢
type RegistrationForm = {
  username: string;
  email: string;
  password: string;
  age: number | string;
};

// 3. 関数定義
// ----------

// 検証処理の枠定義
// 戻り値は (value: T) => string[] という関数
// 入力値を受け取り検証、エラーメッセージがあれば配列に入れて返す関数
// 入力項目への複数検証処理の枠を定義
// 以降、ユーザー名・メールアドレス・パスワード・年齢の検証に使用するため最初に定義
function createValidator<T>(...validators: Validator<T>[]): (value: T) => string[] {
  return (value: T) => validators.map(v => v(value)).filter((e): e is string => e !== null);
}

// 2. 変数定義
// ----------

// ユーザー名についての複数検証関数を保持
// ユーザー名を受け取り、エラーメッセージの配列を返す関数を保持している
// いずれも検証パスなら null 、そうでないならエラーメッセージを返しその結果を配列として返す
// - 空値
// - 最小文字数
// - 最大文字数
// - 入力可能文字
// 実際に検証が実行されるのは usernameValidators が呼び出された時
const usernameValidators = createValidator<string>(
  (v) => v.trim().length === 0 ? "ユーザー名を入力してください" : null,
  (v) => v.length < 3 ? "ユーザー名は3文字以上にしてください" : null,
  (v) => v.length > 20 ? "ユーザー名は20文字以内にしてください" : null,
  (v) => /[^a-zA-Z0-9_]/.test(v) ? "ユーザー名は英数字とアンダースコアのみ使用できます" : null,
);

// メールアドレスについての複数検証関数
// いずれも検証パスなら null 、そうでないならエラーメッセージを返しその結果を配列として返す関数を保持
// - 空値
// - 有効値
const emailValidators = createValidator<string>(
  (v) => v.trim().length === 0 ? "メールアドレスを入力してください" : null,
  (v) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "有効なメールアドレスを入力してください" : null,
);

// パスワードについての複数検証関数
// いずれも検証パスなら null 、そうでないならエラーメッセージを返しその結果を配列として返す関数を保持
// - 最小文字数
// - 文字種（アルファベット）
// - 文字種（数字）
const passwordValidators = createValidator<string>(
  (v) => v.length < 8 ? "パスワードは8文字以上にしてください" : null,
  (v) => !/[A-Z]/.test(v) ? "大文字を1文字以上含めてください" : null,
  (v) => !/[0-9]/.test(v) ? "数字を1文字以上含めてください" : null,
);

// 年齢についての複数検証関数
// いずれも検証パスなら null 、そうでないならエラーメッセージを返しその結果を配列として返す関数を保持
// - 文字種（文字列の数値）
// - 年齢制限
// - 有効値
const ageValidators = createValidator<string>(
  (v) => !/^\d+$/.test(v) ? "年齢は数値で入力してください" : null,
  (v) => Number(v) < 18 ? "18歳以上である必要があります" : null,
  (v) => Number(v) > 120 ? "有効な年齢を入力してください" : null,
);

// 3. 関数定義
// ----------

// フォーム検証ファサード関数
// エラーメッセージ配列の初期化とフォーム各項目複数検証実行と結果の返却を行う
function validateRegistrationForm(form: RegistrationForm): ValidationResult {
  const errors: FieldError[] = [];

  usernameValidators(form.username).forEach(message => errors.push({ field: "username", message }));
  emailValidators(form.email).forEach(message => errors.push({ field: "email", message }));
  passwordValidators(form.password).forEach(message => errors.push({ field: "password", message }));
  ageValidators(String(form.age)).forEach(message => errors.push({ field: "age", message }));

  return { valid: errors.length === 0, errors };
}

// 4. export
// ----------
export { validateRegistrationForm }; // 関数のエクスポート
export type { RegistrationForm, ValidationResult, FieldError }; // 型のみエクスポート

// 5. テスト
// ----------

// テストデータ
// オブジェクトの配列
const testForms: RegistrationForm[] = [
  { username: "alice", email: "alice@example.com", password: "Secret123", age: 25 },
  { username: "ab", email: "not-an-email", password: "weak", age: 15 },
  { username: "valid_user!", email: "", password: "NoDigits!", age: "abc" },
];

// 定義したテストデータを validateRegistrationForm() で検証
for (const form of testForms) {
  const result = validateRegistrationForm(form);
  console.log(result);
}
