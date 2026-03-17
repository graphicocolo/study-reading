import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AnimatePresence, motion } from 'framer-motion';
import { TodoItem } from './TodoItem';

/**
 * Todoリストコンポーネント
 * ドラッグ＆ドロップによる並び替え対応
 * タスクデータ（todos）、Todo編集・削除・完了・並べ替え関数を受け取り
 * それを元にしてTodoItemで複数のタスクを表示している
 * タスク一つひとつは、編集・削除・完了・並べ替えが可能である
 */
export const TodoList = ({
  todos,
  onUpdate,
  onDelete,
  onToggle,
  onReorder,
}) => {
  // ドラッグセンサーの設定
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px動かしてからドラッグ開始
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ドラッグ終了時の処理
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      onReorder(active.id, over.id);
    }
  };

  // Todoが空の場合
  if (todos.length === 0) {
    return (
      <motion.div
        className="empty-state"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <svg viewBox="0 0 24 24" width="64" height="64">
          <path
            fill="currentColor"
            d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"
          />
          <path
            fill="currentColor"
            d="M18 9l-1.4-1.4-6.6 6.6-2.6-2.6L6 13l4 4z"
          />
        </svg>
        <p>タスクがありません</p>
        <span>上のフォームから新しいタスクを追加してください</span>
      </motion.div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={todos} strategy={verticalListSortingStrategy}>
        <motion.div
          className="todo-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AnimatePresence mode="popLayout">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onToggle={onToggle}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </SortableContext>
    </DndContext>
  );
};
