"use client";

import { createFood, fetchFoodCategories } from "@/lib/api";
import { FoodCategory } from "@/types/foods.type";
import { useEffect, useState } from "react";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

const numericField = (val: string) =>
  val === "" ? null : parseFloat(val);

export default function CreateFoodModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    name: "",
    category_id: "",
    calories_kcal: "",
    proteins_g: "",
    carbs_g: "",
    fats_g: "",
    fiber_g: "",
    sugars_g: "",
    sodium_mg: "",
    cholesterol_mg: "",
    meal_type: "",
    water_intake_ml: "",
    source: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<FoodCategory[]>([]);

  useEffect(() => {
    fetchFoodCategories()
      .then((data) => setCategories(data.data))
      .catch(() => setCategories([]));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Le nom est obligatoire.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createFood({
        name: form.name.trim(),
        category_id: form.category_id || null,
        calories_kcal: numericField(form.calories_kcal),
        proteins_g: numericField(form.proteins_g),
        carbs_g: numericField(form.carbs_g),
        fats_g: numericField(form.fats_g),
        fiber_g: numericField(form.fiber_g),
        sugars_g: numericField(form.sugars_g),
        sodium_mg: numericField(form.sodium_mg),
        cholesterol_mg: numericField(form.cholesterol_mg),
        meal_type: form.meal_type.trim() || null,
        water_intake_ml: numericField(form.water_intake_ml),
        source: form.source.trim() || null,
      });
      onSuccess();
    } catch {
      setError("Une erreur est survenue lors de la création.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Nouvel aliment
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nom */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">
              Nom <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ex : Poulet grillé"
              className={inputClass}
            />
          </div>

          {/* Catégorie + Type de repas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Catégorie</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">— Sélectionner —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Type de repas</label>
              <input
                type="text"
                name="meal_type"
                value={form.meal_type}
                onChange={handleChange}
                placeholder="Ex : déjeuner"
                className={inputClass}
              />
            </div>
          </div>

          {/* Calories + Protéines */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Calories (kcal)</label>
              <input
                type="number"
                name="calories_kcal"
                value={form.calories_kcal}
                onChange={handleChange}
                placeholder="Ex : 165"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Protéines (g)</label>
              <input
                type="number"
                name="proteins_g"
                value={form.proteins_g}
                onChange={handleChange}
                placeholder="Ex : 31"
                className={inputClass}
              />
            </div>
          </div>

          {/* Glucides + Lipides */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Glucides (g)</label>
              <input
                type="number"
                name="carbs_g"
                value={form.carbs_g}
                onChange={handleChange}
                placeholder="Ex : 0"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Lipides (g)</label>
              <input
                type="number"
                name="fats_g"
                value={form.fats_g}
                onChange={handleChange}
                placeholder="Ex : 3.6"
                className={inputClass}
              />
            </div>
          </div>

          {/* Fibres + Sucres */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Fibres (g)</label>
              <input
                type="number"
                name="fiber_g"
                value={form.fiber_g}
                onChange={handleChange}
                placeholder="Ex : 0"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Sucres (g)</label>
              <input
                type="number"
                name="sugars_g"
                value={form.sugars_g}
                onChange={handleChange}
                placeholder="Ex : 0"
                className={inputClass}
              />
            </div>
          </div>

          {/* Sodium + Cholestérol */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Sodium (mg)</label>
              <input
                type="number"
                name="sodium_mg"
                value={form.sodium_mg}
                onChange={handleChange}
                placeholder="Ex : 74"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Cholestérol (mg)</label>
              <input
                type="number"
                name="cholesterol_mg"
                value={form.cholesterol_mg}
                onChange={handleChange}
                placeholder="Ex : 85"
                className={inputClass}
              />
            </div>
          </div>

          {/* Eau + Source */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Eau (ml)</label>
              <input
                type="number"
                name="water_intake_ml"
                value={form.water_intake_ml}
                onChange={handleChange}
                placeholder="Ex : 200"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Source</label>
              <input
                type="text"
                name="source"
                value={form.source}
                onChange={handleChange}
                placeholder="Ex : https://..."
                className={inputClass}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Création..." : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
