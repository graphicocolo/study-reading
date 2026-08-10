// 全体の流れ
// ----------
// 1. 型定義
//  - FlatNode 階層なしの Node の型
//  - TreeNode 階層構造の Node の型
// 2. 関数定義
//  - buildTree ツリー構造を生成
//  - countNodes Node の総数をカウント
//  - findNodeById 各 Node の id で Node 検索
//  - flattenTree ツリー構造の平坦化
// 3. 変数定義
//  - tree 変換したツリー構造
//  - total Node の総数
//  - laptopNode id で検索された Node
//  - flatView 平坦化したツリー

// 何をしているコードか
// ----------
// 配列(rawItems)をツリー構造に変換
// 数値とTreeNode を対応表に記録、対応表の情報から 配列をツリー構造に変換している

// 特記事項
// ----------
// ●疑問点
// 1.
// interface 選定の理由
// 拡張する可能性がある場合は interface, 宣言のマージ（declaration merging）ができるのは interface だけ
// union型・タプル・プリミティブの別名は type でしか書けない
// 2.
// buildTree() で new Map() が使われている
// Map() コンストラクターは何か、どういう場合に使われるのか
// > Map オブジェクト（対応表）はキーと値のペアを保持し、キーが最初に挿入された順序を覚えています。 キーや値には任意の値（オブジェクトとプリミティブ値）を使用することができます。
// 今回の場合は、キー(number)と値(TreeNode)がセットになった Node の対応表を作成する意図で Map() コンストラクターが使われている
// 3.
// ツリー構造に変換後の Node がどんなものかがわからない
// rawItems はオブジェクトの配列だが、それがどうなるのか？ Node になるのか？ new Map すると Node になるのか
// ↓↓↓
// new Map() 自体は何も変換していません。 変換しているのは buildTree 内の nodeMap.set(item.id, { id: item.id, name: item.name, children: [] })の オブジェクトリテラル の部分
// ここで FlatNode（parentId を持つ）から parentId を捨てて children: [] を足した新しいオブジェクト（＝TreeNode）を作り、それを Map に登録しているだけ
// Map はあくまで「id → TreeNode」の検索用の対応表であり、変換ロジックの実体ではない
// ●その他
// 1.
// このコードを改修することになったら、元の処理がどうしてこうなっているのか理解しきれていないのでなかなか難しそう
// 2.
// 実際このコードは、どういう場面で使われるのだろう
// カテゴリ一覧、コメント欄の返信ツリー、組織図、フォルダ階層など、DBでは parentId を持つフラットなレコードとして保存されているデータを、UI表示用にネストした形へ組み立てる場面でよく使われるパターン

// 1. 型定義
// ----------

// TreeNode のイメージ
// TreeNode.children の型は TreeNode[] なので、ツリー内に現れるノードは深さに関わらず全て TreeNode です。FlatNode は変換前の配列（入力）としてのみ存在し、ツリー構造そのものには一切登場しない
// ```
// TreeNode/
// ├── TreeNode
// |    ├── TreeNode
// |    |   ├── TreeNode
// |    |   ├── TreeNode
// |    |   └── TreeNode
// |    └── TreeNode
// └── TreeNode
// ```

// 階層なしの Node の型
// id 自身の ID
// parentId 親 Node の ID
// name Node の名前
interface FlatNode {
  id: number;
  parentId: number | null;
  name: string;
}

// 階層構造の Node の型
// FlatNode で構成されているツリー構造
// id 自身の ID
// name Node の名前
// children 子 Node 、自身を型として指定している、再帰的
interface TreeNode {
  id: number;
  name: string;
  children: TreeNode[];
}


// 2. 関数定義
// ----------

// ツリー構造を生成
// 引数： items FlatNode[]
// 戻り値： root TreeNode[]
function buildTree(items: FlatNode[]): TreeNode[] {
  // Node 対応表
  const nodeMap = new Map<number, TreeNode>();
  // ルート Node の定義
  const roots: TreeNode[] = [];

  // Node を対応表にセット
  for (const item of items) {
    nodeMap.set(item.id, { id: item.id, name: item.name, children: [] });
  }

  // ツリー構造の組み立て
  for (const item of items) {
    // Map.get() の戻り値型が T | undefined であることに対する TypeScript 上の型ガードとして書かれているだけ
    const node = nodeMap.get(item.id); // 対応表から Node 取得
    if (!node) continue; // 早期リターンのような早期処理

    if (item.parentId === null) { // 早期リターンのような早期処理
      roots.push(node);
      continue;
    }

    const parent = nodeMap.get(item.parentId);
    // parent を持っていたら、parent の children として組み込む
    // parent を持っていなかったら、root 配下に組み込む
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

// Node の総数をカウント
// 引数： tree TreeNode[]
// 戻り値： 子 Node も含めた Node の総数 number
function countNodes(tree: TreeNode[]): number {
  return tree.reduce((total, node) => {
    return total + 1 + countNodes(node.children);
  }, 0);
}

// 各 Node の id で Node 検索
// 自身を再帰的に実行して子 Node まで検索対象を探しに行く
// 引数： tree TreeNode[], targetId: number
// 戻り値： 検索対象の Node TreeNode | undefined
function findNodeById(tree: TreeNode[], targetId: number): TreeNode | undefined {
  for (const node of tree) {
    if (node.id === targetId) return node;
    const found = findNodeById(node.children, targetId);
    if (found) return found;
  }
  return undefined;
}

// ツリー構造の平坦化
// 引数： tree: TreeNode[], depth = 0
// 戻り値： result オブジェクト { id: number; name: string; depth: number } の配列
function flattenTree(tree: TreeNode[], depth = 0): { id: number; name: string; depth: number }[] {
  // 戻り値の初期化
  const result: { id: number; name: string; depth: number }[] = [];

  // どの深さのノードも同じ処理（result.push({...}) してから子を再帰で潜る）を受けている
  for (const node of tree) {
    result.push({ id: node.id, name: node.name, depth });
    result.push(...flattenTree(node.children, depth + 1));
  }

  return result;
}

// 加工前のデータ
// ----------

const rawItems: FlatNode[] = [
  { id: 1, parentId: null, name: "Root" },
  { id: 2, parentId: 1, name: "Electronics" },
  { id: 3, parentId: 1, name: "Furniture" },
  { id: 4, parentId: 2, name: "Laptops" },
  { id: 5, parentId: 2, name: "Phones" },
  { id: 6, parentId: 4, name: "Ultrabooks" },
  { id: 7, parentId: 3, name: "Chairs" },
  { id: 8, parentId: 99, name: "Orphaned" },
];

// 3. 変数定義
// ----------

const tree = buildTree(rawItems);
const total = countNodes(tree);
const laptopNode = findNodeById(tree, 4);
const flatView = flattenTree(tree);

console.log(JSON.stringify(tree, null, 2));
console.log(`total nodes: ${total}`);
console.log(laptopNode);
console.log(flatView);
