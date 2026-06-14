import type { Category } from "@/lib/categories";

export const FILTRE_SANS_CATEGORIE = "sans-categorie";

type CategoryFilterProps = {
  categories: Category[];
  filtreActif: string | null;
  onFiltreChange: (filtre: string | null) => void;
};

export default function CategoryFilter({
  categories,
  filtreActif,
  onFiltreChange,
}: CategoryFilterProps) {
  if (categories.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onFiltreChange(null)}
        className={[
          "rounded-full px-3 py-1 text-xs font-medium transition-colors",
          filtreActif === null
            ? "bg-violet-600 text-white"
            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700",
        ].join(" ")}
      >
        Toutes
      </button>

      {categories.map((categorie) => (
        <button
          key={categorie.id}
          type="button"
          onClick={() => onFiltreChange(categorie.id)}
          className={[
            "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
            filtreActif === categorie.id
              ? "text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700",
          ].join(" ")}
          style={
            filtreActif === categorie.id
              ? { backgroundColor: categorie.color }
              : undefined
          }
        >
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: categorie.color }}
            aria-hidden
          />
          {categorie.name}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onFiltreChange(FILTRE_SANS_CATEGORIE)}
        className={[
          "rounded-full px-3 py-1 text-xs font-medium transition-colors",
          filtreActif === FILTRE_SANS_CATEGORIE
            ? "bg-violet-600 text-white"
            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700",
        ].join(" ")}
      >
        Sans catégorie
      </button>
    </div>
  );
}
