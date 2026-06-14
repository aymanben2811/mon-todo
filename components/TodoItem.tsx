import { PRIORITES, type Priority, type Todo } from "@/lib/todos";
import type { Category } from "@/lib/categories";

type TodoItemProps = {
  todo: Todo;
  categories: Category[];
  isNew?: boolean;
  isDeleting?: boolean;
  onToggle: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onCategoryChange: (todo: Todo, categoryId: string | null) => void;
  onPriorityChange: (todo: Todo, priority: Priority | null) => void;
  onAnimationEnd?: () => void;
};

export default function TodoItem({
  todo,
  categories,
  isNew = false,
  isDeleting = false,
  onToggle,
  onDelete,
  onCategoryChange,
  onPriorityChange,
  onAnimationEnd,
}: TodoItemProps) {
  const categorie = categories.find((c) => c.id === todo.category_id);
  const priorite = PRIORITES.find((p) => p.value === todo.priority);

  return (
    <li
      onAnimationEnd={onAnimationEnd}
      className={[
        "flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-300",
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
      <div className="flex shrink-0 items-center gap-1.5">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: priorite?.color ?? "#d4d4d8" }}
          aria-hidden
        />
        <select
          value={todo.priority ?? ""}
          onChange={(e) =>
            onPriorityChange(todo, (e.target.value || null) as Priority | null)
          }
          aria-label="Priorité de la tâche"
          className="rounded-lg border border-zinc-200/80 bg-white/80 px-1.5 py-1 text-xs text-zinc-600 outline-none focus:border-violet-400 dark:border-zinc-700/60 dark:bg-zinc-800/80 dark:text-zinc-300"
        >
          <option value="">Sans priorité</option>
          {PRIORITES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      {categories.length > 0 && (
        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: categorie?.color ?? "#d4d4d8" }}
            aria-hidden
          />
          <select
            value={todo.category_id ?? ""}
            onChange={(e) => onCategoryChange(todo, e.target.value || null)}
            aria-label="Catégorie de la tâche"
            className="rounded-lg border border-zinc-200/80 bg-white/80 px-1.5 py-1 text-xs text-zinc-600 outline-none focus:border-violet-400 dark:border-zinc-700/60 dark:bg-zinc-800/80 dark:text-zinc-300"
          >
            <option value="">Sans catégorie</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
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
