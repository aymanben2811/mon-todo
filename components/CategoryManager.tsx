"use client";

import { useState } from "react";
import {
  addCategory,
  deleteCategory,
  updateCategory,
  type Category,
} from "@/lib/categories";
import ColorPicker, { COULEURS_CATEGORIES } from "@/components/ColorPicker";

type CategoryManagerProps = {
  categories: Category[];
  onCategoryAdded: (categorie: Category) => void;
  onCategoryUpdated: (categorie: Category) => void;
  onCategoryDeleted: (id: string) => void;
};

export default function CategoryManager({
  categories,
  onCategoryAdded,
  onCategoryUpdated,
  onCategoryDeleted,
}: CategoryManagerProps) {
  const [nom, setNom] = useState("");
  const [couleur, setCouleur] = useState(COULEURS_CATEGORIES[0].valeur);
  const [erreur, setErreur] = useState<string | null>(null);
  const [idEnSuppression, setIdEnSuppression] = useState<string | null>(null);
  const [idEnEdition, setIdEnEdition] = useState<string | null>(null);
  const [nomEdition, setNomEdition] = useState("");
  const [couleurEdition, setCouleurEdition] = useState("");

  async function ajouterCategorie(e: React.FormEvent) {
    e.preventDefault();
    const nomNettoye = nom.trim();
    if (!nomNettoye) return;

    setErreur(null);
    try {
      const categorie = await addCategory(nomNettoye, couleur);
      onCategoryAdded(categorie);
      setNom("");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur lors de l'ajout");
    }
  }

  function commencerEdition(categorie: Category) {
    setErreur(null);
    setIdEnEdition(categorie.id);
    setNomEdition(categorie.name);
    setCouleurEdition(categorie.color);
  }

  async function enregistrerEdition(e: React.FormEvent) {
    e.preventDefault();
    if (!idEnEdition) return;

    const nomNettoye = nomEdition.trim();
    if (!nomNettoye) return;

    setErreur(null);
    try {
      const categorie = await updateCategory(idEnEdition, {
        name: nomNettoye,
        color: couleurEdition,
      });
      onCategoryUpdated(categorie);
      setIdEnEdition(null);
    } catch (err) {
      setErreur(
        err instanceof Error ? err.message : "Erreur lors de la modification"
      );
    }
  }

  async function supprimerCategorie(id: string) {
    if (!window.confirm("Supprimer cette catégorie ? Les tâches associées resteront, mais sans catégorie.")) {
      return;
    }

    setErreur(null);
    setIdEnSuppression(id);

    try {
      await deleteCategory(id);
      onCategoryDeleted(id);
    } catch (err) {
      setErreur(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      );
    } finally {
      setIdEnSuppression(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {erreur && (
        <p className="text-sm text-red-600 dark:text-red-400">{erreur}</p>
      )}

      <ul className="flex flex-col gap-2">
        {categories.map((categorie) =>
          idEnEdition === categorie.id ? (
            <li
              key={categorie.id}
              className="rounded-xl border border-violet-200/80 bg-white/80 p-3 dark:border-violet-800/40 dark:bg-zinc-800/60"
            >
              <form
                onSubmit={enregistrerEdition}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nomEdition}
                    onChange={(e) => setNomEdition(e.target.value)}
                    autoFocus
                    className="flex-1 rounded-lg border border-zinc-200/80 bg-white/80 px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-violet-400 dark:border-zinc-700/60 dark:bg-zinc-800/80 dark:text-zinc-50"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-violet-600 transition-colors hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-950/40"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => setIdEnEdition(null)}
                    className="shrink-0 rounded-lg px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                  >
                    Annuler
                  </button>
                </div>
                <ColorPicker value={couleurEdition} onChange={setCouleurEdition} />
              </form>
            </li>
          ) : (
            <li
              key={categorie.id}
              className="flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-white/80 px-3 py-2 dark:border-zinc-700/60 dark:bg-zinc-800/60"
            >
              <span
                className="size-3.5 shrink-0 rounded-full"
                style={{ backgroundColor: categorie.color }}
                aria-hidden
              />
              <span className="flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-100">
                {categorie.name}
              </span>
              <button
                type="button"
                onClick={() => commencerEdition(categorie)}
                className="shrink-0 rounded-lg px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={() => supprimerCategorie(categorie.id)}
                disabled={idEnSuppression === categorie.id}
                className="shrink-0 rounded-lg px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/60 dark:hover:text-red-400"
              >
                {idEnSuppression === categorie.id ? "Suppression..." : "Supprimer"}
              </button>
            </li>
          )
        )}

        {categories.length === 0 && (
          <p className="py-2 text-center text-sm text-zinc-400">
            Aucune catégorie pour le moment.
          </p>
        )}
      </ul>

      <form
        onSubmit={ajouterCategorie}
        className="flex flex-col gap-3 rounded-xl border border-zinc-200/80 bg-white/80 p-2 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-800/60"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nouvelle catégorie..."
            className="flex-1 rounded-lg bg-transparent px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none dark:text-zinc-50"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-violet-500 hover:to-indigo-500 hover:shadow-md active:scale-95"
          >
            Ajouter
          </button>
        </div>
        <ColorPicker value={couleur} onChange={setCouleur} />
      </form>
    </div>
  );
}
