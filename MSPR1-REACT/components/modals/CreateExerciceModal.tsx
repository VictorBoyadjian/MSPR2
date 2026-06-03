"use client";

import { mutateExercice } from "@/lib/api";
import { DifficultyEnum } from "@/types/exercises.type";
import { useState } from "react";

type Props = {
    onClose: () => void;
    onSuccess: () => void;
};

const DIFFICULTY_OPTIONS: { value: DifficultyEnum; label: string }[] = [
    { value: "debutant", label: "Débutant" },
    { value: "intermediaire", label: "Intermédiaire" },
    { value: "avance", label: "Avancé" },
];

export default function CreateExerciceModal({ onClose, onSuccess }: Props) {
    const [form, setForm] = useState({
        name: "",
        category: "",
        body_part: "",
        equipment: "",
        difficulty: "" as DifficultyEnum | "",
        instructions: "",
        source: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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
            await mutateExercice("create", {
                name: form.name.trim(),
                category: form.category.trim() || null,
                body_part: form.body_part.trim() || null,
                equipment: form.equipment.trim() || null,
                difficulty: (form.difficulty as DifficultyEnum) || null,
                instructions: form.instructions.trim() || null,
                source: form.source.trim() || null,
            });
            onSuccess();
        } catch {
            setError("Une erreur est survenue lors de la création.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white tracking-tight">
                        Nouvel exercice
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
                            placeholder="Ex : Squat"
                            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Catégorie + Partie du corps */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-400">Catégorie</label>
                            <input
                                type="text"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                placeholder="Ex : Musculation"
                                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-400">Partie du corps</label>
                            <input
                                type="text"
                                name="body_part"
                                value={form.body_part}
                                onChange={handleChange}
                                placeholder="Ex : Jambes"
                                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Équipement + Difficulté */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-400">Équipement</label>
                            <input
                                type="text"
                                name="equipment"
                                value={form.equipment}
                                onChange={handleChange}
                                placeholder="Ex : Haltères"
                                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-400">Difficulté</label>
                            <select
                                name="difficulty"
                                value={form.difficulty}
                                onChange={handleChange}
                                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">— Sélectionner —</option>
                                {DIFFICULTY_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400">Instructions</label>
                        <textarea
                            name="instructions"
                            value={form.instructions}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Décrivez les étapes de l'exercice..."
                            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    {/* Source */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400">Source</label>
                        <input
                            type="text"
                            name="source"
                            value={form.source}
                            onChange={handleChange}
                            placeholder="Ex : https://..."
                            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
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
