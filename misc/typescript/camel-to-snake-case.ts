// 全体の流れ
// ----------
// 前提知識
// キャメルケース 2つ目以降の単語の先頭が大文字 例：userName（ローワーキャメルケース）, UserName（アッパーキャメルケース）
// スネークケース 単語を（_アンダースコア）で繋ぐ 例：user_profile, USER_PROFILE（定数によく使われる）
// 1. 型定義
//  - CamelToSnakeCase
//  - SnakeCaseKeys
//  - UserProfile
// 2. 変数・定数定義
//  - rawProfile
// 3. 関数定義
//  - isPlainObject
//  - camelToSnake
//  - convertKeysToSnakeCase
//  - toJsonPayload

// 何をしているコードか
// ----------
// 受け取るデータをキャメルケース → スネークケースに変換（オブジェクトはキーのみ変換）

// 特記事項
// ----------
// ●良い発想だと思った点
// 1.
// ...
// ●どこがなぜ分かりやすかったか
// 1. 
// ...
// ●どこがなぜ分かりにくかったか
// 1.
// CamelToSnakeCase と SnakeCaseKeys の型定義のコードが何を表しているのかわからない
// 関数のように振る舞う型。CamelToSnakeCase は値単体に対して、SnakeCaseKeys は配列やオブジェクトに対して処理を行う
// ●疑問
// 1. 
// interface UserProfile は、rawProfileというオブジェクトにつける型なので interface なのか
// 単に「データモデルの形を表すときはinterfaceを使う」という一般的な慣習に沿っているだけ
// 2. 
// function isPlainObject(value: unknown): value is Record<string, unknown> の is キーワードは:の場合とどう違う？ここではなぜ is が使われている？
// value is Record<string, unknown>は**型ガード（Type Predicate）**という特別な戻り値型の書き方
// 「実行時にはboolean型を返すが、trueが返ってきたときは、呼び出し元でvalueの型をRecord<string, unknown>に絞り込んでいい」とTypeScriptに伝える宣言
// typescript-study10-type-guard.mdで学んだ型ガードの実例そのもの
// 3. 
// convertKeysToSnakeCase の中で返り値に as が使われているのはなぜ？
// 型アサーションを使い、コンパイラに返り値の型を明示している（自分が型より正確な情報を持っている場合）
// 「コンパイラには証明できないが、自分（このコード自体）はロジック上これが正しい形だと確信できる」という許容されるケース側に当てはまる
// 外部から予測不能な値が入ってくるわけではないので、document.getElementById(...) as HTMLInputElementと同じ「型システムの限界を人間が補う」使い方
// SnakeCaseKeys<T>はTに対する条件型（conditional type）
// Tはこの関数の中では「まだ何になるか確定していないジェネリックな型」なので、TypeScriptのコンパイラは「input.map(...)の結果」や「result（Record<string, unknown>として宣言）」が本当にSnakeCaseKeys<T>の形と一致するかを、コード上のロジックだけからは証明できません。これはTypeScriptの既知の制約で、ジェネリック型に依存する条件型は関数内部では自動解決されない
// ロジック自体は正しくSnakeCaseKeys<T>の形を作っているものの、コンパイラがそれを検証しきれないため、asで「これはこの型として扱ってよい」と明示的に伝えています。asは実行時には何もせず、型チェッカーへの申告に過ぎない点は注意が必要です（ロジックにバグがあってもここでは検出されません）
// 4. 
// 型定義の部分で関数っぽく変換した型を定義し、実際の値を camelToSnake と convertKeysToSnakeCase で変換しているのは、型と実際の値をそれぞれで変換するため？
// ↓このような対応関係で合ってる？
// 型の CamelToSnakeCase → 値の camelToSnake()
// 型の SnakeCaseKeys → 値の convertKeysToSnakeCase()
// TypeScriptの型はコンパイル時にしか存在せず、実行時には消える（型消去）ため、実際に文字列やオブジェクトを変換する処理はcamelToSnake・convertKeysToSnakeCaseという実行時のJavaScriptコードとして別途必要
// 一方、もし型側（CamelToSnakeCase/SnakeCaseKeys）が無かったら、convertKeysToSnakeCase(rawProfile)の戻り値の型はただのRecord<string, unknown>のような曖昧な型になり、snakeCaseProfile.user_idのような補完や型チェックが効きません。型側の定義は、「実行時の変換ロジックが実際にどんな形を作るか」をコンパイラに正確に伝えるために存在している

// ●問題となる事象
// convertKeysToSnakeCase の最後の分岐（配列でもオブジェクトでもない値をそのまま返す）は、
// 実行時ロジックと型定義が一致しているように見えるが、関数を渡した場合に食い違いが起きる
//
// 実行時：typeof someFunction === "object" は false になるため、
// isPlainObject(fn) は false → 最後の分岐に落ちて、関数はそのまま無変換で返る（正しい挙動）
//
// 型レベル：TypeScriptでは関数の型は object 型の条件を満たす（T extends object が true になる）
// そのため SnakeCaseKeys<関数の型> は最後の「: T」分岐ではなく、
// オブジェクト用のマッピング型分岐（{ [K in keyof T as ...]: ... }）に入ってしまう
// → name, length, call など関数が持つプロパティをキーとして持つ、実態と全く違う型になる
//
// as SnakeCaseKeys<T> がこの食い違いを黙って握りつぶすため、コンパイルエラーは出ない
// 実行時：関数はそのまま返る（安全）
// 型：実際には存在しない「キーが変換されたオブジェクト」であるかのような型になる（誤り）
// クラッシュもコンパイルエラーもなく、型だけが実態と静かにズレたまま先に進む
// → typescript-ascast.md の「静かにバグる」パターンの具体例
//
// （このファイルの UserProfile には関数プロパティが無いため、実際には表面化していない）

// ●問題となる事象へのアプローチ
// このコードは toJsonPayload という名前の通りJSONシリアライズ前提の用途
// 関数はそもそも JSON.stringify でシリアライズできないため、
// 「JSON化するデータに関数プロパティが入っている」状況自体があまり想定されていない
// → 今すぐ絶対直さないと壊れるわけではないが、
//   入力の型 T に制限をかけていない以上、型システム上は関数を渡すことを防げていない、という穴は残る
//
// 対処法は主に2つ
//
// ① 入力の型 T 自体を制限する
// convertKeysToSnakeCase<T>(input: T) のジェネリクスに制約をかけ、
// 「JSON化できる値の形」以外を最初から受け付けないようにする
// → 関数やDateを渡そうとした時点で、実行前（コンパイル時）に呼び出し側でエラーになる
// 「対応できない値を後から弾く」のではなく「そもそも入れさせない」という方向性
//
// ② SnakeCaseKeys<T> 側に特別扱いの分岐を追加する
// T extends object の前に T extends Function（やDate、RegExpなど）のチェックを追加し、
// 「これらはオブジェクトとしてキー変換せず、そのままの型として扱う」という分岐を挟む
// isPlainObject 側の実行時ロジックも、関数だけでなくDateやMapなど他の
// 「typeofはobjectだが構造変換したくない値」を弾くように見直す必要が出てくる
//
// type-fest のような有名ライブラリの CamelCasedProperties 系の型定義は②のアプローチを取っていて、
// Function や Date などを明示的に除外してから再帰処理をかけている
// 実務でこの手の再帰的な型変換ユーティリティを書くと、
// ほぼ必ずこの「意図しない特殊なオブジェクトの扱い」が課題になる、という典型例

// 1. 型定義
// ----------

// interface では conditional typesは書けない

// キャメルからスネークへの変換の型
// 極めて関数に近い型定義
// ジェネリクスにextendsキーワードを用いて、型Sを特定のstring型に限定している
// 文字列を一文字ずつ再帰的に判定変換し、最終的にキャメルからスネークへと変換
// 詳しい処理の流れを理解するには下記参照
// study-practice/typescript/document/typescript-conditional-types-infer.md
type CamelToSnakeCase<S extends string> = S extends `${infer Head}${infer Tail}`
  ? Tail extends Uncapitalize<Tail>
    ? `${Lowercase<Head>}${CamelToSnakeCase<Tail>}`
    : `${Lowercase<Head>}_${CamelToSnakeCase<Tail>}`
  : S;

// 配列やオブジェクトについてもキャメルからスネークへ変換する型
// 受け取った値が配列なら中身をキャメルからスネークへ変換し返す
// オブジェクトならキーを変換したオブジェクトを返す。再帰的に働いてネストしたオブジェクトのキーも対象とする
// それ以外はそのままを返す
type SnakeCaseKeys<T> = T extends Array<infer U>
  ? Array<SnakeCaseKeys<U>>
  : T extends object
  ? {
      [K in keyof T as CamelToSnakeCase<string & K>]: SnakeCaseKeys<T[K]>;
    }
  : T;

// 3. 関数定義
// ----------

// オブジェクト判定
// オブジェクト型で中身があり、配列でないかどうか確認し、値をキーバリューのオブジェクトで返す
// キー string, バリュー unknown のユーティリティ型
// convertKeysToSnakeCase の中で、オブジェクトのデータに対して処理を振り分けるのに活用される
// param value:unknown 判定対象値
// return value is Record<string, unknown>:boolean
// value is Record<string, unknown>は**型ガード（Type Predicate）**という特別な戻り値型の書き方
// 「実行時にはboolean型を返すが、trueが返ってきたときは、呼び出し元でvalueの型をRecord<string, unknown>に絞り込んでいい」とTypeScriptに伝える宣言
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// キャメルケースからスネークケースへの変換
// param key: string オブジェクトのキー値
// return string キャメルケースからスネークケースへ変換された string 値
// convertKeysToSnakeCase の中で、オブジェクトのキーを変換するのに活用される
function camelToSnake(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}

// キーの値をキャメルケースからスネークケースへ変換
// param input: T 入力値
// return SnakeCaseKeys<T> 配列やオブジェクト、それ以外ならそのままを返す
// 配列・オブジェクト・それ以外に分けて処理が行われる
function convertKeysToSnakeCase<T>(input: T): SnakeCaseKeys<T> {
  if (Array.isArray(input)) {
    return input.map((item) => convertKeysToSnakeCase(item)) as SnakeCaseKeys<T>;
  }

  // もし isPlainObject の戻り値の型が boolean ならば
  // input は T型のままでエラー
  // isがあるおかげで、inputがRecord<string, unknown>として扱われ、Object.entries(input)が型エラーなく呼べる
  if (isPlainObject(input)) {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(input)) {
      const snakeKey = camelToSnake(key);
      result[snakeKey] = convertKeysToSnakeCase(value);
    }

    return result as SnakeCaseKeys<T>;
  }

  return input as SnakeCaseKeys<T>;
}

// 1. 型定義
// ----------

// ユーザープロフィールの型
interface UserProfile {
  userId: number; // ID
  firstName: string; // 名
  lastName: string; // 氏
  contactInfo: { // 連絡手段
    emailAddress: string; // メールアドレス
    phoneNumber?: string; // 電話番号（オプション）
  };
  recentOrders: Array<{ // 最近の注文内容（オブジェクトの配列）
    orderId: string; // 注文ID
    totalAmount: number; // 合計金額
    isPaid: boolean; // 支払い状況
  }>;
}

// 2. 変数・定数定義
// ----------

// 加工前の元情報
const rawProfile: UserProfile = {
  userId: 1024,
  firstName: "Taro",
  lastName: "Yamada",
  contactInfo: {
    emailAddress: "taro@example.com",
  },
  recentOrders: [
    { orderId: "ORD-001", totalAmount: 3200, isPaid: true },
    { orderId: "ORD-002", totalAmount: 1500, isPaid: false },
  ],
};

const snakeCaseProfile = convertKeysToSnakeCase(rawProfile);

// 3. 関数定義
// ----------

// オブジェクトをスネークケースに変換してから JSON 文字列にシリアライズ
// param data: T
// return string
function toJsonPayload<T>(data: T): string {
  return JSON.stringify(convertKeysToSnakeCase(data), null, 2);
}

console.log(toJsonPayload(rawProfile));
console.log(snakeCaseProfile);
