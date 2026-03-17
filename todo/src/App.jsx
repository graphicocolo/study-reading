import { useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useTodos } from './hooks/useTodos';
import { TodoInput } from './components/TodoInput';
import { TodoList } from './components/TodoList';
import { motion } from 'framer-motion';
import './App.css';

/**
 * 派手な紙吹雪エフェクトを発火する即時関数
 */
const fireConfetti = () => {
  // 中央から大きく発火
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#6366f1', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'],
  });

  // 左側から発火
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#6366f1', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'],
    });
  }, 150);

  // 右側から発火
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#6366f1', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'],
    });
  }, 300);
};

/**
 * Todoアプリのメインコンポーネント
 */
function App() {
  const {
    todos, // TODOリスト TodoListへ
    addTodo, // TODO追加関数 TodoInput コンポーネントへ
    updateTodo, // TODO更新関数 TodoListへ
    deleteTodo, // TODO削除関数 TodoListへ
    toggleTodo, // TODOトグル関数
    reorderTodos, // TODO並べ替え関数 TodoListへ
    clearCompleted, // 完了タスク削除関数 motion.button コンポーネントへ
  } = useTodos();

  // タスク状態別のカウント
  const totalCount = todos.length;
  const completedCount = todos.filter((todo) => todo.completed).length;
  const activeCount = totalCount - completedCount;

  // タスク完了時に紙吹雪を発火
  // TodoListのonToggleのハンドラーはhandleToggle
  // 完了ボタンをクリックすると紙吹雪を発火（未完了→完了の場合のみ）
  // toggleTodo で状態を更新
  const handleToggle = useCallback(
    (id) => {
      const todo = todos.find((t) => t.id === id);
      // 未完了→完了の場合のみ紙吹雪を発火
      if (todo && !todo.completed) {
        fireConfetti();
      }
      toggleTodo(id);
    },
    [todos, toggleTodo]
  );

  return (
    <div className="app">
      <header className="app-header">
        <h1>Todo App</h1>
        {/* タスク状態別カウント */}
        {totalCount > 0 && (
          <div className="task-stats">
            <span className="stat">
              <span className="stat-label">アクティブ</span>
              <span className="stat-value active">{activeCount}</span>
            </span>
            <span className="stat">
              <span className="stat-label">完了</span>
              <span className="stat-value completed">{completedCount}</span>
            </span>
            <span className="stat">
              <span className="stat-label">合計</span>
              <span className="stat-value total">{totalCount}</span>
            </span>
          </div>
        )}
      </header>

      <main className="app-main">
        <TodoInput onAdd={addTodo} />

        {/* 完了タスク削除ボタン */}
        {completedCount > 0 && (
          <motion.button
            className="clear-completed-btn"
            onClick={clearCompleted}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            完了したタスクを削除 ({completedCount}件)
          </motion.button>
        )}

        <TodoList
          todos={todos}
          onUpdate={updateTodo}
          onDelete={deleteTodo}
          onToggle={handleToggle}
          onReorder={reorderTodos}
        />
      </main>

      <footer className="app-footer">
        <p>ダブルクリックで編集 | ドラッグで並び替え</p>
      </footer>
    </div>
  );
}

export default App;
