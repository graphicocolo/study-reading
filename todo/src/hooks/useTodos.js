import { useState, useEffect, useCallback } from 'react';

// ローカルストレージのキー
const STORAGE_KEY = 'todos';

/**
 * Todo管理用カスタムフック
 * ローカルストレージを使用してデータを永続化
 * Todoの一覧を useState で管理し、追加・編集・削除・完了切り替え・並び替えの操作関数を提供する
 * データはローカルストレージに永続化され、ページを再読み込みしても状態が維持される
 */
export const useTodos = () => {
  // 初期状態をローカルストレージから読み込む
  // useState に関数を渡すと初回レンダリング時だけ実行される
  const [todos, setTodos] = useState(() => {
    // localStorage のデータが壊れていた場合（JSON.parse が失敗する場合）でもクラッシュせず、空配列で起動できるようにしている
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Todoが変更されたらローカルストレージに保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  // Todoを追加
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

  // Todoを編集
  const updateTodo = useCallback((id, newText) => {
    if (!newText.trim()) return;

    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, text: newText.trim() } : todo
      )
    );
  }, []);

  // Todoを削除
  const deleteTodo = useCallback((id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  // 完了状態を切り替え
  const toggleTodo = useCallback((id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  // Todoを並び替え
  const reorderTodos = useCallback((activeId, overId) => {
    setTodos((prev) => {
      const oldIndex = prev.findIndex((todo) => todo.id === activeId);
      const newIndex = prev.findIndex((todo) => todo.id === overId);

      if (oldIndex === -1 || newIndex === -1) return prev;

      const newTodos = [...prev];
      const [removed] = newTodos.splice(oldIndex, 1);
      newTodos.splice(newIndex, 0, removed);

      return newTodos;
    });
  }, []);

  // 完了したTodoを一括削除
  const clearCompleted = useCallback(() => {
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
