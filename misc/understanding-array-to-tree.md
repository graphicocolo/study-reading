# array-to-tree.ts 読解 理解サポート

対象：`study-reading/misc/typescript/array-to-tree.ts`

## 自分の理解の答え合わせ

### ✅ 正しかった理解

- `Map` オブジェクトの説明：キーと値のペアを保持し、挿入順を記憶する。今回は「id → TreeNode」の対応表として使われている。
- `buildTree` 内の `if (item.parentId === null) {...}` / `if (parent) {...} else {...}` の分岐：`parentId` に対応する親が `nodeMap` に見つからない場合（例：`id: 8, parentId: 99` の "Orphaned"）は roots 行きになる、という理解も含めて正しい。
- `countNodes` / `findNodeById` の再帰処理の説明：正確。

### ⚠️ ズレがあった理解

**1. interface vs type の使い分け**

「拡張する可能性があるなら interface」は方向性としては合っているが、本質的な違いは以下。

- 宣言のマージ（declaration merging）ができるのは interface だけ
- union型・タプル・プリミティブの別名は type でしか書けない

「React は type を使うことが多い」は現場・チーム依存であり、一般化しすぎ。

**2. `rawItems` が Node になる仕組み**

`new Map()` 自体は何も変換していない。変換しているのは `buildTree` 内のオブジェクトリテラルの部分。

```ts
nodeMap.set(item.id, { id: item.id, name: item.name, children: [] })
```

ここで `FlatNode`（`parentId` を持つ）から `parentId` を捨てて `children: []` を足した新しいオブジェクト（＝`TreeNode`）を作り、それを Map に登録している。Map はあくまで「id → TreeNode」の検索用の対応表であり、変換ロジックの実体ではない。

また、当初書いていた ASCII 図は `TreeNode` の子に `FlatNode` が入る構造になっていたが、これは誤り。`TreeNode.children` の型は `TreeNode[]` なので、ツリー内に現れるノードは深さに関わらず全て `TreeNode`。`FlatNode` は変換前の配列（入力）としてのみ存在し、ツリー構造そのものには一切登場しない。

**3. `flattenTree` の「最上位は push、下位は再帰で push」という理解**

実際はどの深さのノードも同じ処理（`result.push({...})` してから子を再帰で潜る）を受けている。「最上位だけ特別扱い」ではなく、`for (const node of tree)` のループ自体が再帰のたびに繰り返し実行されている、という理解の方が正確。

### 💡 気づいていなかった補足

- `const node = nodeMap.get(item.id); if (!node) continue;` は、実は現在のコードでは絶対に通らない分岐。直前のループで `items` の全要素を同じ id で `nodeMap` にセットしているため、2回目のループで `get` が `undefined` を返すことはない。これは `Map.get()` の戻り値型が `T | undefined` であることに対する TypeScript 上の型ガードとして書かれているだけ。
- このパターンの実際の使用場面：カテゴリ一覧、コメント欄の返信ツリー、組織図、フォルダ階層など、DBでは `parentId` を持つフラットなレコードとして保存されているデータを、UI表示用にネストした形へ組み立てる場面でよく使われる。

## flattenTree は何をしているか

`flattenTree` は一度組み立てた `TreeNode[]` を、`rawItems` のような配列に戻す処理ではない。**似ているが持っている情報が違う。**

| | `rawItems`（元データ） | `flattenTree` の結果 |
|---|---|---|
| フィールド | `id`, `parentId`, `name` | `id`, `name`, `depth` |
| 親子関係の表現方法 | `parentId`（親のidを直接持つ） | 配列内の並び順 ＋ `depth`（階層の深さ） |
| 並び順 | 入力時のまま（バラバラ） | 親の直後に子が続く（深さ優先探索の順） |

`parentId` は完全に捨てられ、代わりに `depth`（今何階層目か）が付与される。つまり「id→親id」の関係を、「木を上から順にたどった時の並び順＋深さ」という別の形式に変換している。

### 具体例でのトレース

`rawItems` から組み立てた `tree` の構造：

```
Root(1)
├─ Electronics(2)
│   ├─ Laptops(4)
│   │   └─ Ultrabooks(6)
│   └─ Phones(5)
└─ Furniture(3)
    └─ Chairs(7)
Orphaned(8)   ← parentId:99 が見つからないので roots 行き
```

`flattenTree(tree)` は木を上から下へ深さ優先でたどりながら1個ずつ `result` に積んでいくので、結果は以下になる。

```ts
[
  { id: 1, name: "Root",       depth: 0 },
  { id: 2, name: "Electronics",depth: 1 },
  { id: 4, name: "Laptops",    depth: 2 },
  { id: 6, name: "Ultrabooks", depth: 3 },
  { id: 5, name: "Phones",     depth: 2 },
  { id: 3, name: "Furniture",  depth: 1 },
  { id: 7, name: "Chairs",     depth: 2 },
  { id: 8, name: "Orphaned",   depth: 0 },
]
```

`rawItems` の並び順（1,2,3,4,5,6,7,8）と見比べると `Furniture(3)` の位置が変わっている。`flattenTree` は「木をたどった順」に並べ直しているため、元の配列の順序は保存されない。

### 何に使えるか

インデント付きリストとして階層を表示したいとき（ファイラーのツリービューを1本のリストとして描画する、など）によく使われる形式。`depth` を見れば `<div style={{ paddingLeft: depth * 16 }}>` のようにインデント幅を計算できるため、`parentId` で親を逆引きするより描画に向いた形になっている。

## tree の実体はネストされたオブジェクトか

`buildTree` が返す `tree` は、ネストされたオブジェクト（正確にはネストされたオブジェクトの配列）である。`rawItems` のように `parentId` で間接的につながっているのではなく、子要素が親オブジェクトの `children` プロパティの中に実体として埋め込まれている。

`console.log(JSON.stringify(tree, null, 2))` で出力される中身は以下。

```json
[
  {
    "id": 1,
    "name": "Root",
    "children": [
      {
        "id": 2,
        "name": "Electronics",
        "children": [
          {
            "id": 4,
            "name": "Laptops",
            "children": [
              { "id": 6, "name": "Ultrabooks", "children": [] }
            ]
          },
          { "id": 5, "name": "Phones", "children": [] }
        ]
      },
      {
        "id": 3,
        "name": "Furniture",
        "children": [
          { "id": 7, "name": "Chairs", "children": [] }
        ]
      }
    ]
  },
  { "id": 8, "name": "Orphaned", "children": [] }
]
```

`rawItems` との違い：

| | `rawItems` | `tree` |
|---|---|---|
| 構造 | フラットな配列。各要素は独立したオブジェクト | 配列だが、各要素が子オブジェクトを内部に持つ入れ子構造 |
| 親子関係の持ち方 | `parentId` という「id」で間接参照 | `children` プロパティに子オブジェクトそのものが格納される |

`buildTree` 内の

```ts
parent.children.push(node);
```

がこの「埋め込み」を行っている箇所。`nodeMap` から取り出した `node`（オブジェクト）を `parent.children` 配列に直接 push しているので、`parent` オブジェクトの中に `node` オブジェクトがそのまま格納される＝ネスト構造になる。

なお `nodeMap` に入っている `TreeNode` オブジェクトと、`tree` や `parent.children` の中にある `TreeNode` オブジェクトは同じオブジェクトへの参照（コピーではない）。だからこそ、後から `parent.children.push(node)` するだけで `tree` 側にも反映される。
