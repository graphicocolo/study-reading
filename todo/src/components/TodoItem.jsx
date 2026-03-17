import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 個々のTodo項目コンポーネント
 * ドラッグ＆ドロップ対応
 * 単一のタスクデータを受け取りそれを元にして一つのタスクを表示している。編集・削除・完了・並べ替えが可能である。編集モードに入ったら要素はフォーカスされ、キーボードでの操作も可能
 */
export const TodoItem = ({ todo, onUpdate, onDelete, onToggle }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const inputRef = useRef(null);

  // ソート機能の設定
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // 編集モードに入ったらフォーカス
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // 編集を保存
  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(todo.id, editText);
    } else {
      setEditText(todo.text);
    }
    setIsEditing(false);
  };

  // キーボード操作
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`todo-item ${todo.completed ? 'completed' : ''} ${isDragging ? 'dragging' : ''}`}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, x: -100 }}
      transition={{ duration: 0.2 }}
    >
      {/* チェックボックス（四角形） */}
      <label className="checkbox-wrapper">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          aria-label={todo.completed ? 'タスクを未完了に戻す' : 'タスクを完了にする'}
        />
        <motion.span
          className="checkbox-custom"
          initial={false}
          animate={todo.completed ? 'checked' : 'unchecked'}
        >
          <motion.svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            variants={{
              checked: { opacity: 1, scale: 1 },
              unchecked: { opacity: 0, scale: 0.5 },
            }}
            transition={{ duration: 0.15 }}
          >
            <path
              fill="white"
              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
            />
          </motion.svg>
        </motion.span>
      </label>

      {/* テキスト部分 */}
      <div className="todo-content">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.input
              key="input"
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="edit-input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          ) : (
            <motion.span
              key="text"
              className="todo-text"
              onDoubleClick={() => setIsEditing(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {todo.text}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* アクションボタン */}
      <div className="todo-actions">
        {!isEditing && (
          <>
            <motion.button
              className="edit-btn"
              onClick={() => setIsEditing(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="編集"
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  fill="currentColor"
                  d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                />
              </svg>
            </motion.button>
            <motion.button
              className="delete-btn"
              onClick={() => onDelete(todo.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="削除"
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  fill="currentColor"
                  d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                />
              </svg>
            </motion.button>
          </>
        )}
      </div>

      {/* ドラッグハンドル（右端） */}
      <button
        className="drag-handle"
        {...attributes}
        {...listeners}
        aria-label="ドラッグして並び替え"
      >
        <svg viewBox="0 0 20 20" width="20" height="20">
          <path
            fill="currentColor"
            d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"
          />
        </svg>
      </button>
    </motion.div>
  );
};
