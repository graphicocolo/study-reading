import { useState, useEffect, useCallback } from 'react';

// ローカルストレージのキーを定数化
const STORAGE_KEY = 'todos';

/**
 * Todo管理用カスタムフック
 * データ初期化
 * CRUD、並べ替え、完了を行う関数を返す
 */
export const useTodos = () => {
  // TODO の状態を管理
  // 初期値に無名関数をセット、ローカルストレージからデータを取得し使用しやすい形式にパース
  // ローカルストレージにデータがない場合空配列を返す
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { // データ取得に失敗した場合、空配列で対応
      return [];
    }
  });

  // TODO のデータが更新されるたび、ローカルストレージにデータをセット
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  // 新規 TODO を追加
  const addTodo = useCallback((text) => {
    if (!text.trim()) return;

    const newTodo = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    setTodos((prev) => [...prev, newTodo]);
  }, []);

  // 既存 TODO を更新
  const updateTodo = useCallback((id, newText) => {
    if (!newText.trim()) return;

    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, text: newText.trim() } : todo
      )
    );
  }, []);

  // 既存 TODO を削除
  const deleteTodo = useCallback((id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  // 完了状態を更新
  const toggleTodo = useCallback((id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  // TODO 並べ替え
  // activeId 並べ替え対象（ドラッグしているTODO）
  // overId 順番変更対象（ドロップされるTODO）
  const reorderTodos = useCallback((activeId, overId) => {
    setTodos((prev) => {
      const oldIndex = prev.findIndex((todo) => todo.id === activeId); // 並べ替え対象となる TODO の index
      const newIndex = prev.findIndex((todo) => todo.id === overId); // 順番変更対象となる TODO の index

      if (oldIndex === -1 || newIndex === -1) return prev; // 該当する要素がなかった場合は現在の状態を返す

      const newTodos = [...prev]; // 配列をコピー
      const [removed] = newTodos.splice(oldIndex, 1); // splice で並べ替え対象を抜き取る
      // newTodos = [ A, B, C, D ] とすると...
      // splice(1, 1) → index1から1個取り出す
      // removed = B
      // const [removed] = の [] は分割代入。splice は取り出した要素を配列で返すので、その最初の1個を取り出している。
      // newTodos = [ A, C, D ]  ← B が抜けた
      newTodos.splice(newIndex, 0, removed); // 抜き取った B を newIndex の位置に差し込む
      // splice(3, 0, B) → index3の位置に、0個削除して、Bを挿入
      // newTodos = [ A, C, D, B ]
      // before: [ A, B, C, D ] after:  [ A, C, D, B ]
      // Bが末尾に移動した。配列の順番が変わったので、画面の表示順も変わる。

      return newTodos;
    });
  }, []);

  // 完了済み TODO を未完了にする
  // ↑間違い！
  // 完了済み TODO を削除
  const clearCompleted = useCallback(() => {
    // ↓自分の回答
    // setTodos((prev) => {
    //   const deletedTodos = prev.filter((todo) => !todo.completed);
    //   return deletedTodos;
    // });
    // よりスマートな書き方
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  }, []);

  return {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    reorderTodos,
    clearCompleted,
  };
};
