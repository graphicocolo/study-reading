// Luhn を使った誤入力検知関数
// 自分で一から実装版

function isValidLuhn(digits: string): boolean {
  // digits を trim に通す
  // digits を Number に変換
  // for を digits の右端から左端まで回す
  // 1桁おきに2倍、2倍した結果が9超えなら9引く
  // 全部足して10で割り切れるか
  const trimmed = digits.trim(); // 元のコードに組み込む場合は不要
  let sum = 0;
  let shouldDouble = false;
  for (let i = trimmed.length - 1; i >= 0; i--) {
    let temp = Number(trimmed[i]);
    if (shouldDouble) {
      temp *= 2;
      if (temp > 9) {
        temp -= 9;
      }
    }
    sum += temp;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

const luhnTestCases: string[] = [
  "5637", // 正しい例（想定: true）
  "5631", // 誤入力例（想定: false）
  "4111111111111111",
  "5500000000000004",
  "340000000000009",
  "6011000000000004",
  "1234567890123456",
];

for (const digits of luhnTestCases) {
  console.log(digits, "->", isValidLuhn(digits));
}