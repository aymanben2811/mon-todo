import type { Todo } from "@/lib/todos";

type TodoItemProps = {
  todo: Todo;
  isNew?: boolean;
  isDeleting?: boolean;
  onToggle: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onAnimationEnd?: () => void;
};

export default function TodoItem({
  todo,
  isNew = false,
  isDeleting = false,
  onToggle,
  onDelete,
  onAnimationEnd,
}: TodoItemProps) {
  return (
    <li
      onAnimationEnd={onAnimationEnd}
      className={[
        "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-300",
        isDeleting
          ? "animate-tache-sortie"
          : isNew
            ? "animate-tache-entree"
            : "",
        todo.completed
          ? "border-dashed border-zinc-200/80 bg-zinc-100/60 opacity-70 dark:border-zinc-700/60 dark:bg-zinc-800/40"
          : "border-violet-200/80 bg-white shadow-sm dark:border-violet-800/40 dark:bg-zinc-800/80",
      ].join(" ")}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo)}
        className={[
          "size-4 shrink-0 cursor-pointer rounded transition-colors",
          todo.completed ? "accent-emerald-500" : "accent-violet-600",
        ].join(" ")}
      />
      <span
        className={[
          "flex-1 text-sm transition-all duration-300",
          todo.completed
            ? "text-zinc-400 line-through decoration-zinc-300"
            : "font-medium text-zinc-800 dark:text-zinc-100",
        ].join(" ")}
      >
        {todo.title}
      </span>
      {todo.completed && (
        <span className="shrink-0 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
          Terminée
        </span>
      )}
      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        disabled={isDeleting}
        className="shrink-0 rounded-lg px-2 py-1 text-sm text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/60 dark:hover:text-red-400"
        aria-label="Supprimer la tâche"
      >
        Supprimer
      </button>
    </li>
  );
}
