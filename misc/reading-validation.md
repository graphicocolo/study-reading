# コードリーディング バリデーション系コード

study-reading/misc/typescript/email-validation.ts と study-reading/misc/typescript/phone-validation.ts は同じバリデーション系コード

違いと共通点を確認

## 型定義

- ○○○Rule, ○○○Format など、固有の形式を定義したり検証したりする型がある
- ○○○Result のように、バリデーション結果の型が定義されている
- 結果の値を決めることで、その後どんな処理が必要になるか決定できる
  - 入力値を検証して真偽を返すのか、検証してさらに正規化した値を返すのか

## 変数定義

- 「バリデーション基準を変数にまとめる」というパターンは両コードに共通
- email バリデーションでは、バリデーションの複数処理は変数で定義し、それを単一の関数内で for でループして処理実行をする形にしている
- 電話番号バリデーションでは、PATTERNS で 3 つの形式を正規表現で定義し、同じく単一の関数内で for でループして処理実行をする形

## 関数定義

- email 検証では、全ルールを順番に全部クリアするかチェック（AND）。1つでも落ちたら即 return（AND）。
- 電話番号バリデーションでは、メイン関数の中でまず検証に値しない入力値を弾き、その後、入力値を定義したフォーマットリストのどれか1つにマッチするかチェック（OR）。マッチしたら即 return。定義済みリストをforで照合する仕組みは同じだが、目的が異なる（AND vs OR）。定義済みフォーマットを持つ値のみを受け付けて最後に国際標準の形式に正規化している。phone の独自の工夫として、「早期リターンと push の使い分け」がある
- どちらも validate○○○ のような、メイン関数を定義しそこの中で補助的な処理を行う関数（入力値を区切ったり、必要な値に変換したりなど）をまとめて処理したりしている
- 複数の検証を行う場合は、それぞれの検証を複数の関数で定義するのではなく、変数で定義してメインの関数の中でその変数を for ループで検証するスマートなやり方
- フォーマットごとに正規表現を定義しフォーマット検出、メールアドレスを@を区切りにしてドメインとそれ以外でバリデーション、など、行いたい処理に即して適切に関数定義されている

## モジュール分割と再利用

- バリデーションロジックを専用ファイルに分けて export し、必要な場所で import して組み合わせるのが実務の一般的な設計
- `email-validation.ts` はすでに `validateEmail` と `EmailValidationResult` を export しているため、そのまま他ファイルから import して使える
- `password-strength.ts` は現時点で export がないため、import して使うには export の追加が必要
- `form-validation.ts` のメール・パスワード検証部分を、各専用ファイルからの import に差し替えることができる
  - `emailValidators` 内で `validateEmail(v)` を呼び出し、その result を使う形に書き直せる
  - `passwordValidators` 内で `checkPassword(v)` を呼び出し、その result を使う形に書き直せる
- `export` は実行時に存在する値（関数など）のエクスポート、`export type` は型のみのエクスポート（コンパイル後に消える）

**コード例**

```ts
import { validateEmail } from "./email-validation";
import { checkPassword } from "./password-strength"; // エクスポートが必要

// emailValidators の中身を validateEmail に差し替え
const emailValidators = createValidator<string>(
  (v) => {
    const result = validateEmail(v);
    return result.valid ? null : result.error ?? "無効なメールアドレスです";
  }
);

// passwordValidators の中身を checkPassword に差し替え
const passwordValidators = createValidator<string>(
  (v) => {
    const result = checkPassword(v);
    return result.passed ? null : result.failed.join(", ");
  }
);
```

## まとめ

- 返り値の型定義をすることで、関数の処理内容が決まる
- 判定内容（空値、最大文字数、定義フォーマットなど）を、変数で定義し、メインバリデーション関数の中でまとめて判定処理
- 補助的処理（フォーマット検出や正規化、値分割や部分的バリデーション）は、メイン処理の中で適時実行される
- メインにする処理と補助的処理、それぞれの内容を適切に定義