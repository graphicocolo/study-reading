// 全体の流れ
// ----------
// 1. 型定義
//  - CardBrand カード会社名定義
//  - CardValidationResult カード情報検証結果
// 2. 定数定義
//  - BRAND_PATTERNS カード会社別にメタ情報を正規表現で定義
// 3. 関数定義
//  - stripNonDigits 引数を数字だけのものに変換
//  - detectBrand カード会社を検出
//  - isValidLuhn 誤入力検知
//  - formatCardNumber カード番号の形式に整える
//  - validateCardNumber カード番号入力値検証
//    stripNonDigits で数字のみに変換
//    入力値の型不一致、trim()後の空値で早期リターン
//    不正値、誤入力で早期リターン
//    detectBrand でカード会社を検出（結果が適切でなければ早期リターン）
//    ここまでで問題なければ検証結果を返す（digit は最後formatCardNumber()に通して形式を整える）
// 4. export
//  - validateCardNumber
//  - CardValidationResult
// 5. テスト
//  - cardTestCases テストデータ
//  - 定義したテストデータを validateCardNumber() で検証

// 何をしているコードか
// ----------
// カード番号の検証

// 特記事項
// ----------
// ●良い発想だと思った点
// validateCardNumber() 内部のエラーを返すタイミング
// 致命的排他的で即時返却した方が良いもの、同時に起こりうるまとめて返却した方が良いもの、それぞれに分けて考えられていた
// ●どこがなぜ分かりやすかったか
// 
// ●どこがなぜ分かりにくかったか
// 1.
// detectBrand()
// for (const [brand, pattern] of Object.entries(BRAND_PATTERNS) as [CardBrand, RegExp][])では何をしている？
// BRAND_PATTERNS オブジェクトのキーと値をそれぞれ brand と pattern としてループ処理の中で使用
// pattern にマッチした brand を返す
// どれにも当てはまらない場合は null を返す
// 2.
// isValidLuhn() の Luhn アルゴリズムが初見。なぜこの処理で検知されるのか
// カード番号は、1桁おきに2倍した上で各桁の総和が10で割り切れるようになっているため
// 3. validateCardNumber の内部の errors の定義位置
// const errors: string[] = []; が、なぜここで定義されているのか
// それ以前のerrors: ["..."] と、それ以降の errors と、分けているのはなぜ
// const errors: string[] = [];以前
// これらは「そもそもこれ以上のチェックが成立しない」致命的なケースです。文字列じゃなければ .trim()も呼べませんし、空文字なら桁数チェックもLuhnチェックも意味がありません。つまりこの2つは互いに排他的な、その場で打ち切るべき条件なので、エラーは1個確定・即 returnで十分です。配列変数を用意して溜め込む必要がありません。
// const errors: string[] = [];以降
// 「桁数が不正」と「チェックデジットが一致しない」は、同じ入力値に対して同時に成立し得ます（例：桁数が変な上にチェックデジットも合っていない番号）。この場合、1つ目のエラーだけ返して終わってしまうと、ユーザーは直してもう一度送信しないと2つ目のエラーに気づけません。なので、ここだけは配列に溜めて、両方該当していれば両方まとめて返す設計にしてあります。
// errors という可変の配列は、「複数同時に起こり得るチェック群」の直前・その範囲だけで用意されています。変数のスコープ（生存範囲）を、本当に必要な最小限の範囲に絞っている、とも言えます。

// 1. 型定義
// ----------

// カード会社名定義
// ユニオン型を型エイリアスで定義
// あらかじめ決まった値のみを受け付ける
type CardBrand = "VISA" | "MASTERCARD" | "AMEX" | "DISCOVER";

// カード情報検証結果
// isValid 検証パスか否か
// brand 先に定義されたカード会社名 もしくは null 値 のユニオン型
// normalized 文字列型 もしくは null 値 のユニオン型
// errors 文字列型エラー内容の配列
interface CardValidationResult {
  isValid: boolean;
  brand: CardBrand | null;
  normalized: string | null;
  errors: string[];
}

// 2. 定数定義
// ----------

// カード会社別にメタ情報を正規表現で定義
// Record<CardBrand, RegExp> のユーティリティ型
// Record<K, V> でマップ構造
const BRAND_PATTERNS: Record<CardBrand, RegExp> = {
  // ^ 先頭
  VISA: /^4\d{12}(\d{3})?$/, // 4 で始まり、13桁 または 16桁（12桁の後にさらに3桁が続く場合）のどちらかにマッチ。実際のVISAカードは13桁と16桁の両方が存在するため、この2パターンをカバー
  MASTERCARD: /^5[1-5]\d{14}$/, // 先頭2桁が 51〜55 のいずれかで始まり、合計16桁（2+14）にマッチ。Mastercardの伝統的な発行体番号（BIN）の範囲が51〜55だったことに基づいている
  AMEX: /^3[47]\d{13}$/, // 先頭2桁が 34 または 37 で始まり、合計15桁（2+13）にマッチ。Amexは他ブランドと違い15桁
  DISCOVER: /^6(?:011|5\d{2})\d{12}$/, // 先頭が 6011 または 65xx のどちらかで始まり、合計16桁（4+12）にマッチ。実際のDiscoverカードの発行体番号がこの2パターンに基づいている
};


// 3. 関数定義
// ----------

// 引数を数字だけのものに変換
// - \D   数字以外の文字1文字（\d の反転）
// - g    グローバルフラグ：文字列全体で一致するものをすべて対象にする g があることで文字列中の数字以外をすべて空文字に置換し、数字だけ残す
// phone-validation.ts でも同様の関数あり
function stripNonDigits(value: string): string {
  return value.replace(/\D/g, "");
}

// カード会社を検出
// BRAND_PATTERNS オブジェクトのキーと値をそれぞれ brand と pattern としてループ処理の中で使用
// pattern にマッチした brand を返す
// どれにも当てはまらない場合は null を返す
function detectBrand(digits: string): CardBrand | null {
  for (const [brand, pattern] of Object.entries(BRAND_PATTERNS) as [CardBrand, RegExp][]) {
    if (pattern.test(digits)) {
      return brand;
    }
  }
  return null;
}

// 誤入力検知
// Luhn アルゴリズムによる識別番号の入力ミスやタイプミスを検出するための単純なチェックサム方式を実行
// digits 文字列型で渡された検証値
// 返り値は boolean
// 処理の流れは以下の通り（例：正しいコードが5637なとき、ユーザに5631という文字列を入力(7と1の見間違いによる誤入力)）
// 1. コードを右から数えて奇数番目、偶数番目と分類する
// 2. 偶数番目の数をそれぞれ2倍する
// 3. 2.にて数値が2桁になった場合、それぞれ別々の数字とする(9*2=18の場合、18でなく1と8とする)
// 4. それぞれの数をすべて加える
// 5. その数が10で割り切れれば正しく、そうでない場合は誤っている

// 先程の例を実際に検討すると、5637では、
// 奇数番目の数は7,6
// 偶数番目の数は3,5
// 2倍すると6,1,0です。
// 足し合わせると7+6+6+1+0=20で、10で割り切れるため正しいです。

// ですが、5631では
// 奇数番目の数は1,6
// 偶数番目の数は3,5
// 2倍すると6,1,0です。
// 足し合わせると1+6+6+1+0=14で、10で割り切れないため誤りです。

function isValidLuhn(digits: string): boolean {
  let sum = 0;
  let shouldDouble = false;

  // 右端（digits.length - 1）の桁から左へ1桁ずつ処理
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]); // 数値に変換

    if (shouldDouble) { // shouldDouble = true ならば
      digit *= 2; // 2倍にする
      if (digit > 9) { // 2倍にした結果が9を超えたら9を引く（2桁になった数の各桁を足し合わせるのと同じ効果）
        digit -= 9;
      }
    }

    sum += digit; // 各桁の値（2倍処理後のものも含む）を sum に積算（足し合わせ）していく
    shouldDouble = !shouldDouble; // ここで真偽を反転させることで毎ループ1つ飛ばしで true/false が入れ替わる
  }

  return sum % 10 === 0; // 最終的に sum が10で割り切れれば有効
}

// カード番号の形式に整える
// 4桁の数字が見つかって、かつその後ろにまだ数字が続く場合、その4桁の後ろにスペースを1つ追加する
// (\d{4}) — 数字4つを1グループとしてキャプチャ（マッチした部分を後で使えるように覚えておく）
// (?=\d) — その4つの直後に、もう1つ数字が続いている場合だけマッチを許可（この部分自体は置換対象に含まれない）
// g — 文字列全体を対象に、この探索を繰り返す
function formatCardNumber(digits: string): string {
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

// カード番号入力値検証
// 各処理や関数で値を検証、OKならば検証結果を返す
// 処理をまとめて実行する関数
function validateCardNumber(input: unknown): CardValidationResult {
  if (typeof input !== "string") {
    return { isValid: false, brand: null, normalized: null, errors: ["入力値は文字列である必要があります"] };
  }

  const digits = stripNonDigits(input.trim());

  if (digits.length === 0) {
    return { isValid: false, brand: null, normalized: null, errors: ["カード番号が空です"] };
  }

  const errors: string[] = [];

  if (digits.length < 13 || digits.length > 19) {
    errors.push("カード番号の桁数が不正です");
  }

  if (!isValidLuhn(digits)) {
    errors.push("チェックデジットが一致しません");
  }

  if (errors.length > 0) {
    return { isValid: false, brand: null, normalized: null, errors };
  }

  const brand = detectBrand(digits);

  if (!brand) {
    return {
      isValid: false,
      brand: null,
      normalized: null,
      errors: ["対応ブランド（VISA / MASTERCARD / AMEX / DISCOVER）と一致しません"],
    };
  }

  return {
    isValid: true,
    brand,
    normalized: formatCardNumber(digits),
    errors: [],
  };
}

// 4. export
// ----------

export { validateCardNumber };
export type { CardValidationResult };

// 5. テスト
// ----------

const cardTestCases: unknown[] = [
  "4111 1111 1111 1111",
  "5500-0000-0000-0004",
  "340000000000009",
  "6011000000000004",
  "1234567890123456",
  "4111111111111112",
  "",
  null,
  "abcd efgh ijkl mnop",
];

for (const input of cardTestCases) {
  const result = validateCardNumber(input);
  console.log({ input, ...result });
}
