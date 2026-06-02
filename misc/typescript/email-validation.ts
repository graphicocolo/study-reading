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
// メールアドレスのバリデーションを行う

// 特記事項
// ----------
// どこがなぜ分かりやすかったか
// どこがなぜ分かりにくかったか
// type ValidationRule
// test は何？無名関数？この型が実際使われている場所を見て、こういうやり方は見たことがなかったのでわかりにくいと感じた
// しかしうまい書き方だと思った
// test: (email: string) => boolean; の、test は関数名になるのか？
// RegExp.prototype.test() のことか？

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
// test バリデーション関数
// message バリデーションメッセージ
type ValidationRule = {
  test: (email: string) => boolean;
  message: string;
};

// 2. 定数定義
// ----------

const MAX_EMAIL_LENGTH = 254;
const MAX_LOCAL_LENGTH = 64;

const LOCAL_PART_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
const DOMAIN_LABEL_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;

function splitEmail(email: string): { local: string; domain: string } | null {
  const atIndex = email.lastIndexOf("@");
  if (atIndex === -1) return null;
  return {
    local: email.slice(0, atIndex),
    domain: email.slice(atIndex + 1),
  };
}

function validateDomain(domain: string): boolean {
  if (!domain || domain.length > 253) return false;
  const labels = domain.split(".");
  if (labels.length < 2) return false;
  return labels.every((label) => {
    if (!label || label.length > 63) return false;
    return DOMAIN_LABEL_REGEX.test(label);
  });
}

const rules: ValidationRule[] = [
  {
    test: (email) => email.length > 0,
    message: "メールアドレスを入力してください",
  },
  {
    test: (email) => email.length <= MAX_EMAIL_LENGTH,
    message: `メールアドレスは${MAX_EMAIL_LENGTH}文字以内で入力してください`,
  },
  {
    test: (email) => email.includes("@"),
    message: "@を含めてください",
  },
  {
    test: (email) => {
      const parts = splitEmail(email);
      return parts !== null && parts.local.length > 0;
    },
    message: "@の前に文字を入力してください",
  },
  {
    test: (email) => {
      const parts = splitEmail(email);
      return parts !== null && parts.local.length <= MAX_LOCAL_LENGTH;
    },
    message: `@の前は${MAX_LOCAL_LENGTH}文字以内にしてください`,
  },
  {
    test: (email) => {
      const parts = splitEmail(email);
      return parts !== null && LOCAL_PART_REGEX.test(parts.local);
    },
    message: "メールアドレスに使用できない文字が含まれています",
  },
  {
    test: (email) => {
      const parts = splitEmail(email);
      return parts !== null && validateDomain(parts.domain);
    },
    message: "ドメイン名が正しくありません",
  },
];

function validateEmail(email: string): EmailValidationResult {
  const trimmed = email.trim();
  for (const rule of rules) {
    if (!rule.test(trimmed)) {
      return { valid: false, error: rule.message };
    }
  }
  return { valid: true };
}

function validateEmails(emails: string[]): Map<string, EmailValidationResult> {
  return new Map(emails.map((email) => [email, validateEmail(email)]));
}

export { validateEmail, validateEmails };
export type { EmailValidationResult };
