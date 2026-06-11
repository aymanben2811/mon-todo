import type { Todo } from "@/lib/todos";
import TodoItem from "@/components/TodoItem";

type TodoListProps = {
  todos: Todo[];
  newlyAddedId?: string | null;
  deletingIds?: Set<string>;
  onToggle: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onItemAnimationEnd?: (id: string) => void;
};

export default function TodoList({
  todos,
  newlyAddedId = null,
  deletingIds = new Set(),
  onToggle,
  onDelete,
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
          isNew={todo.id === newlyAddedId}
          isDeleting={deletingIds.has(todo.id)}
          onToggle={onToggle}
          onDelete={onDelete}
          onAnimationEnd={() => onItemAnimationEnd?.(todo.id)}
        />
      ))}
    </ul>
  );
}
