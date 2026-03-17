import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Todo追加フォームコンポーネント
 * 入力されたテキストを状態管理し、onAddハンドラーに渡している
 * 送信時入力欄をリセット
 */
export const TodoInput = ({ onAdd }) => {
  const [text, setText] = useState('');

  // フォーム送信処理
  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text);
      setText('');
    }
  };

  return (
    <motion.form
      className="todo-input"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="新しいタスクを入力..."
        aria-label="新しいタスク"
      />
      <motion.button
        type="submit"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={!text.trim()}
      >
        追加
      </motion.button>
    </motion.form>
  );
};
