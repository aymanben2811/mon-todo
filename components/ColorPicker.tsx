export const COULEURS_CATEGORIES = [
  { nom: "Rouge", valeur: "#ef4444" },
  { nom: "Orange", valeur: "#f97316" },
  { nom: "Jaune", valeur: "#eab308" },
  { nom: "Vert", valeur: "#22c55e" },
  { nom: "Bleu", valeur: "#3b82f6" },
  { nom: "Violet", valeur: "#8b5cf6" },
  { nom: "Rose", valeur: "#ec4899" },
  { nom: "Gris", valeur: "#6b7280" },
];

type ColorPickerProps = {
  value: string;
  onChange: (couleur: string) => void;
};

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Couleur de la catégorie">
      {COULEURS_CATEGORIES.map((couleur) => {
        const selectionnee = value === couleur.valeur;

        return (
          <button
            key={couleur.valeur}
            type="button"
            role="radio"
            aria-checked={selectionnee}
            aria-label={couleur.nom}
            onClick={() => onChange(couleur.valeur)}
            className={[
              "flex size-8 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95",
              selectionnee
                ? "ring-2 ring-zinc-900 ring-offset-2 ring-offset-white dark:ring-white dark:ring-offset-zinc-900"
                : "hover:scale-110",
            ].join(" ")}
            style={{ backgroundColor: couleur.valeur }}
          >
            {selectionnee && (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4 drop-shadow"
                aria-hidden
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}
