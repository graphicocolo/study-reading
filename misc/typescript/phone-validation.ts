// 全体の流れ
// ----------
// 1. 型定義
//  - PhoneFormat 電話番号フォーマット
//    - E164 国際電話番号標準フォーマット [+][CC国コード][NDC国内の宛先コード][SN加入者番号] 例: +14151231234
//    - JP 日本電話番号フォーマット 03-0000-0000 のような番号
//    - US 米国の標準電話番号フォーマット (555) 555-1234 のような 10 桁の番号
// - PhoneValidationResult 電話番号バリデーション結果
// 2. 変数・定数定義
//  - PATTERNS 電話番号フォーマット指定とその正規表現をセットにしたオブジェクトであり Record<PhoneFormat, RegExp> のユーティリティ型
//    - RegExp は TypeScript の組み込み型
//    - E164：/^\+[1-9]\d{1,14}$/
//      - ^        先頭
//      - \+       + リテラル（\ でエスケープ）
//      - [1-9]    1〜9 の数字1文字（0始まりの国コードは存在しないため）
//      - \d{1,14} 数字が1〜14文字
//      - $        末尾
//      - 例：+819012345678、+14151231234
//    - JP：/^(0\d{1,4}-\d{1,4}-\d{4}|0[789]0-\d{4}-\d{4})$/ | で2パターンに分かれている
//      - パターン1：0\d{1,4}-\d{1,4}-\d{4}
//      - 0          先頭の0（国内番号の始まり）
//      - \d{1,4}    市外局番（1〜4桁）
//      - -          ハイフン
//      - \d{1,4}    市内局番（1〜4桁）
//      - -          ハイフン
//      - \d{4}      加入者番号（4桁）
//      - 例：03-1234-5678、0120-000-000
//      - パターン2：0[789]0-\d{4}-\d{4}
//      - 0          先頭の0
//      - [789]      7・8・9 のいずれか1文字
//      - 0          0固定
//      - -          ハイフン
//      - \d{4}      4桁
//      - -          ハイフン
//      - \d{4}      4桁
//      - 例：090-1234-5678（070・080・090 の携帯番号）
//    - US：/^(\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/
//      - (\+1[-.\s]?)?   +1（国コード）があってもなくてもよい。後ろに - . スペースが1文字あってもよい
//      - \(?             ( があってもなくてもよい
//      - \d{3}           市外局番3桁
//      - \)?             ) があってもなくてもよい
//      - [-.\s]?         区切り文字（- . スペース）があってもなくてもよい
//      - \d{3}           局番3桁
//      - [-.\s]?         区切り文字があってもなくてもよい
//      - \d{4}           加入者番号4桁
//      - 例：+1 (800) 555-0100、800-555-0100、8005550100
// 3. 関数定義
//  - stripNonDigits 引数を数字だけのものに変換
//  - detectFormat 電話番号フォーマット検出
//  - normalizeToE164 E164のフォーマットへ正規化
//  - validatePhoneNumber 電話番号検証・正規化番号出力 実装のキモ
//    内部で以下の値を弾いた後、検証結果を返す
//    - 入力値が文字以外の場合
//    - ここで即結果を返す -
//    - 入力値が空の場合
//    - ここで即結果を返す -
//    - 入力値の長さ超過している場合（20文字より大きい）
//    - 入力値の数字以外除外後の長さ不足している場合（7文字より小さい）
//    - ここまででまとめて結果を返す（「長さ超過」と「桁数不足」は同時に発生しうるため、両方のエラーをまとめて返せる設計） -
//    - 電話番号フォーマット検出後、パターンに該当しない場合結果を返す
//    - 最後にE164のフォーマットへ正規化、結果を返す
// 4. テスト
//  - phoneTestCases テストデータ
//  - phoneTestCases データをテスト

// 何をしているコードか
// ----------
// 電話番号検証
// 国際・日本・米国のいずれかの標準フォーマットである電話番号を検証し、国際標準に正規化された番号を含む検証結果を返す

// 特記事項
// ----------
// ●良い発想だと思った点
// 1.
// 受け付ける電話番号のフォーマットを限定し、電話番号フォーマットを検出している
// 受付可能なもの以外は弾けるので、対象を絞ることができる
// 2.
// normalizeToE164 として正規化の処理を関数に分けている
// 他のフォーマットに正規化したければ、normalizeToOtherFormat として、差し替えることが可能
// 3.
// validatePhoneNumber() 内部の、errors.push と早期リターンの使い分け
// 早期リターンで即終了（その後の検証を行うまでもない値に対して）
// pushでまとめてリターン（文字の長さ関連エラーをまとめて処理）
// ●どこがなぜ分かりやすかったか
// 全体的にわかりやすかった
// ●どこがなぜ分かりにくかったか
// なし

// 1. 型定義
// ----------

// 電話番号フォーマット（ユニオン型、string でしかも値が限定的）
// 電話番号フォーマットを、国際・日本・米国のいずれかの標準フォーマットで型付
type PhoneFormat = "E164" | "JP" | "US";

// 電話番号バリデーション結果
// isValid 有効かどうか
// format 電話番号のフォーマット
// normalized 正規化された電話番号
// errors エラー内容
interface PhoneValidationResult {
  isValid: boolean;
  format: PhoneFormat | null;
  normalized: string | null;
  errors: string[];
}

// 2. 変数・定数定義
// ----------

// 電話番号フォーマット指定とその正規表現をセットにしたオブジェクト
// Record<PhoneFormat, RegExp> のユーティリティ型（RegExp は TypeScript の組み込み型）
const PATTERNS: Record<PhoneFormat, RegExp> = {
  E164: /^\+[1-9]\d{1,14}$/,
  JP: /^(0\d{1,4}-\d{1,4}-\d{4}|0[789]0-\d{4}-\d{4})$/,
  US: /^(\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/,
};

// 3. 関数定義
// ----------

// 引数を数字だけのものに変換
// - \D   数字以外の文字1文字（\d の反転）
// - g    グローバルフラグ：文字列全体で一致するものをすべて対象にする g があることで文字列中の数字以外をすべて空文字に置換し、数字だけ残す
function stripNonDigits(value: string): string {
  return value.replace(/\D/g, "");
}

// 電話番号フォーマット検出
// 加工なしの文字列引数を、PATTERNS オブジェクトの正規表現と照合しフォーマットを返す
// パターンに該当しない場合、null を返す
function detectFormat(raw: string): PhoneFormat | null {
  for (const [format, pattern] of Object.entries(PATTERNS) as [PhoneFormat, RegExp][]) {
    if (pattern.test(raw)) {
      return format;
    }
  }
  return null;
}

// E164のフォーマットへ正規化
// 加工なしの文字列とフォーマットタイプを引数として、国際電話番号標準フォーマットへの正規化後の文字列もしくは null を返す
function normalizeToE164(raw: string, format: PhoneFormat): string | null {
  const digits = stripNonDigits(raw);

  switch (format) {
    case "E164":
      return raw;
    case "JP":
      return "+81" + digits.slice(1); // 2文字目から取り出す 0（国内番号の先頭0）を除いて +81 に置き換え
    case "US":
      return "+1" + digits.slice(-10); // 末尾10文字目から取り出す
    default:
      return null;
  }
}

// 電話番号検証・正規化番号出力
// 入力値を引数にとり、以下の検証結果を返す
// isValid 有効かどうか
// format 電話番号のフォーマット
// normalized 正規化された電話番号
// errors エラー内容
function validatePhoneNumber(input: unknown): PhoneValidationResult {
  const errors: string[] = []; // エラー内容初期化

  // 入力値が文字以外の場合の早期リターン
  if (typeof input !== "string") {
    return { isValid: false, format: null, normalized: null, errors: ["入力値は文字列である必要があります"] };
  }

  // ホワイトスペース削除
  const trimmed = input.trim();

  // 入力値が空の場合の早期リターン
  if (trimmed.length === 0) {
    return { isValid: false, format: null, normalized: null, errors: ["電話番号が空です"] };
  }

  // 入力値長さ超過対応
  if (trimmed.length > 20) {
    errors.push("電話番号が長すぎます");
  }

  // 数字以外除外後の長さ不足対応
  const digits = stripNonDigits(trimmed);
  if (digits.length < 7) {
    errors.push("桁数が不足しています");
  }

  // 入力値長さ超過・数字以外除外後の長さ不足
  // 上記いずれかに該当し入力値が不適切だった場合、まとめて結果を返す
  // 「長さ超過」と「桁数不足」は同時に発生しうるため、両方のエラーをまとめて返せる設計
  if (errors.length > 0) {
    return { isValid: false, format: null, normalized: null, errors };
  }

  // ここで初めて電話番号フォーマット検出（ここまでのチェックを抜けてきた値のみが検出される）
  const format = detectFormat(trimmed);

  // パターンに該当しない場合
  if (!format) {
    return {
      isValid: false,
      format: null,
      normalized: null,
      errors: ["対応フォーマット（E.164 / JP / US）と一致しません"],
    };
  }

  // E164のフォーマットへ正規化（ここまでのチェックを抜けてきた値のみが正規化される）
  const normalized = normalizeToE164(trimmed, format);

  return {
    isValid: true,
    format,
    normalized,
    errors: [],
  };
}

// テストデータ
const phoneTestCases: unknown[] = [
  "090-1234-5678",
  "+819012345678",
  "03-1234-5678",
  "+1 (800) 555-0100",
  "800-555-0100",
  "abc",
  "",
  null,
  "0120-000-000",
];

// データをテスト
// 入力値と結果がセットになったオブジェクトがコンソール出力
for (const input of phoneTestCases) {
  const result = validatePhoneNumber(input);
  console.log({ input, ...result });
}
