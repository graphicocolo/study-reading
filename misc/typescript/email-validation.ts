// 全体の流れ
// ----------
// 1. 型定義
//  - EmailValidationResult
//  - ValidationRule
// 2. 定数定義
//  - MAX_EMAIL_LENGTH
//  - MAX_LOCAL_LENGTH
//  - LOCAL_PART_REGEX
//  - DOMAIN_LABEL_REGEX
//  - rules 
// 3. 関数定義
//  - splitEmail 
//  - validateDomain 
//  - validateEmail 
//  - validateEmails 
// 4. export
//  - 関数 validateEmail, validateEmails
//  - 型 EmailValidationResult

// 何をしているコードか
// ----------
// メールアドレスのバリデーション（単一、複数）

// 特記事項
// ----------
// ●良い発想だと思った点
// 1.
// 関数型を使って複数のバリデーションをオブジェクトの配列として定義
// さらにforで複数のバリデーションを行う形にしたこと
// 自分ならば複数のバリデーション関数を作ってしまいそう
// 2.
// ドメインをバリデーション処理は関数に書き出し
// rules の中で処理をさせるため
// ●どこがなぜ分かりやすかったか
// 1. splitEmail()
// メールアドレスを@を区切りにして分けて返却
// 後のバリデーションのしやすさに繋がる発想
// ●どこがなぜ分かりにくかったか
// 1.
// type ValidationRule の test プロパティは何？無名関数？この型が実際使われている場所を見て、こういうやり方は見たことがなかったのでわかりにくいと感じた
// ↑プロパティの型と関数の中身の型が一行に混在しているためわかりづらい
// message: string の string に相当する部分が、test では (email: string) => boolean という関数型になっています。つまり test の型は (email: string) => boolean という一塊です。
// test バリデーション関数?
// test 自体が何かがわからない
// 関数だったら型は void になるはずだが
// 引数と返り値の型のみ書かれている
// メールアドレスを入れたら真偽が返る処理を実行する無名関数
// しかしうまい書き方だと思った
// test: (email: string) => boolean; の、test は関数名になるのか？
// 2.
// validateEmails() のコード全体がわからない
// Map は初見。基礎的な知識含め使い方がわからない
// 3.
// validateEmails()
// Map が初見で理解しづらかった

// 1. 型定義
// ----------

// バリデーション結果の型
// valid バリデーションにパスしたか否かの結果
// error? エラーがあればその内容
type EmailValidationResult = {
  valid: boolean;
  error?: string; // オブジェクトの型のオプションプロパティ error はstring もしくは undefined のどちらか
};

// バリデーションそのものの型
// test バリデーション関数?
// test 自体が何かがわからない
// 関数だったら型は void になるはずだが
// 引数と返り値の型のみ書かれている
// メールアドレスを入れたら真偽が返る処理を実行する無名関数
// message バリデーションメッセージ
type ValidationRule = {
  // 「string を受け取って boolean を返す関数」という型の書き方です。実際の関数の中身はありません。
  // void は「戻り値がない」場合の型です。この test は boolean を返すので、戻り値の型は boolean になります。
  test: (email: string) => boolean; // 関数型のプロパティ
  // test: (string) => boolean; // このように書くこともできるが、その場合型が使用される箇所の記述も変えなくはならない
  message: string; // string型のプロパティ
};

// 2. 定数定義
// ----------

// test@example.com
// ↓test 部分のバリデーションに使用
// MAX_LOCAL_LENGTH, LOCAL_PART_REGEX
// ↓.com の部分に使用
// DOMAIN_LABEL_REGEX
// ↓全体のバリデーションに使用
// MAX_EMAIL_LENGTH

// メールアドレスの文字数最大値
const MAX_EMAIL_LENGTH = 254; // メールアドレス全体の最大値
const MAX_LOCAL_LENGTH = 64; // @より前の部分の最大値

const LOCAL_PART_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/; // @より前の部分の正規表現制約
const DOMAIN_LABEL_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/; // ドメイン部分の正規表現制約

// 3. 関数定義
// ----------

// メールアドレスを分割
// （バリデーションしやすくする）
function splitEmail(email: string): { local: string; domain: string } | null {
  const atIndex = email.lastIndexOf("@");
  if (atIndex === -1) return null; // @が見つからない場合何もしない
  return {
    local: email.slice(0, atIndex),
    domain: email.slice(atIndex + 1),
  };
}

// ドメインをバリデーション
function validateDomain(domain: string): boolean {
  if (!domain || domain.length > 253) return false; // 254ではなく253なのがポイント
  const labels = domain.split(".");
  if (labels.length < 2) return false;
  return labels.every((label) => {
    if (!label || label.length > 63) return false; // なぜ63?
    return DOMAIN_LABEL_REGEX.test(label);
  });
}

const rules: ValidationRule[] = [
  {
    // 空値判定
    // ↓ここでは実際のアロー関数
    test: (email) => email.length > 0,
    message: "メールアドレスを入力してください",
  },
  {
    // メールアドレス全体の最大文字数判定
    test: (email) => email.length <= MAX_EMAIL_LENGTH,
    message: `メールアドレスは${MAX_EMAIL_LENGTH}文字以内で入力してください`,
  },
  {
    // @を含むか否か
    test: (email) => email.includes("@"),
    message: "@を含めてください",
  },
  {
    // メールアドレスローカル部の空値判定
    test: (email) => {
      const parts = splitEmail(email);
      return parts !== null && parts.local.length > 0;
    },
    message: "@の前に文字を入力してください",
  },
  {
    // メールアドレスローカル部の最大文字数判定
    test: (email) => {
      const parts = splitEmail(email);
      return parts !== null && parts.local.length <= MAX_LOCAL_LENGTH;
    },
    message: `@の前は${MAX_LOCAL_LENGTH}文字以内にしてください`,
  },
  {
    // メールアドレスローカル部の正規表現判定
    test: (email) => {
      const parts = splitEmail(email);
      return parts !== null && LOCAL_PART_REGEX.test(parts.local);
    },
    message: "メールアドレスに使用できない文字が含まれています",
  },
  {
    // メールアドレスドメイン部の正規表現含むバリデーション判定
    test: (email) => {
      const parts = splitEmail(email);
      return parts !== null && validateDomain(parts.domain);
    },
    message: "ドメイン名が正しくありません",
  },
];

// 単一メールアドレスのバリデーション
function validateEmail(email: string): EmailValidationResult {
  const trimmed = email.trim();
  for (const rule of rules) {
    if (!rule.test(trimmed)) { // ここのtest()はValidationRule 型で定義した関数型プロパティ
      // rules で定義された各バリデーションの処理結果が false だった場合
      // { valid: false, error: rule.message } を返している
      return { valid: false, error: rule.message };
    }
  }
  return { valid: true };
}

// 複数メールアドレスのバリデーション
// Map でメールアドレスと真偽値を持つMapオブジェクトを作成し、それを返す
function validateEmails(emails: string[]): Map<string, EmailValidationResult> {
  // メールアドレスの配列をmapで処理
  // メールアドレスとバリデーション結果のペアにして、さらにそのペアの配列をMapに渡して返す
  return new Map(emails.map((email) => [email, validateEmail(email)]));
}
// emails = ["a@b.com", "bad@", "test@example.com"]
//          ↓ emails.map((email) => [email, validateEmail(email)])
// [
//   ["a@b.com",          { valid: true }],
//   ["bad@",             { valid: false, error: "ドメイン名が正しくありません" }],
//   ["test@example.com", { valid: true }],
// ]
//          ↓ new Map(...)
// Map {
//   "a@b.com"          => { valid: true },
//   "bad@"             => { valid: false, error: "ドメイン名が正しくありません" },
//   "test@example.com" => { valid: true },
// }

// 4. export
// ----------

export { validateEmail, validateEmails };
export type { EmailValidationResult };
