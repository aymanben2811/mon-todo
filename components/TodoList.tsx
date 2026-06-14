import type { Priority, Todo } from "@/lib/todos";
import type { Category } from "@/lib/categories";
import TodoItem from "@/components/TodoItem";

type TodoListProps = {
  todos: Todo[];
  categories: Category[];
  newlyAddedId?: string | null;
  deletingIds?: Set<string>;
  onToggle: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onCategoryChange: (todo: Todo, categoryId: string | null) => void;
  onPriorityChange: (todo: Todo, priority: Priority | null) => void;
  onItemAnimationEnd?: (id: string) => void;
};

export default function TodoList({
  todos,
  categories,
  newlyAddedId = null,
  deletingIds = new Set(),
  onToggle,
  onDelete,
  onCategoryChange,
  onPriorityChange,
  onItemAnimationEnd,
}: TodoListProps) {
  if (todos.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-400">
        Aucune tâche pour le moment.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          categories={categories}
          isNew={todo.id === newlyAddedId}
          isDeleting={deletingIds.has(todo.id)}
          onToggle={onToggle}
          onDelete={onDelete}
          onCategoryChange={onCategoryChange}
          onPriorityChange={onPriorityChange}
          onAnimationEnd={() => onItemAnimationEnd?.(todo.id)}
        />
      ))}
    </ul>
  );
}
