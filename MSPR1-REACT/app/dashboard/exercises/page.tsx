"use client";

import ConfirmDeleteModal from "@/components/modals/ConfirmDeleteModal";
import CreateExerciceModal from "@/components/modals/CreateExerciceModal";
import RunEtlModal from "@/components/modals/RunEtlModal";
import UpdateExerciceModal from "@/components/modals/UpdateExerciceModal";
import { useAuth } from "@/hooks/useAuth";
import { deleteItem, fetchExercices } from "@/lib/api";
import { ApiResponse } from "@/types/api.type";
import { DifficultyEnum, Exercise } from "@/types/exercises.type";
import { useEffect, useState } from "react";

const difficultyBadge: Record<DifficultyEnum, string> = {
    debutant: "bg-green-500/20 text-green-400 border border-green-500/30",
    intermediaire: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    avance: "bg-red-500/20 text-red-400 border border-red-500/30",
};

const difficultyLabel: Record<DifficultyEnum, string> = {
    debutant: "Débutant",
    intermediaire: "Intermédiaire",
    avance: "Avancé",
};

export default function Exercises() {
    useAuth();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [paginated, setPaginated] = useState<Exercise[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showEtlModal, setShowEtlModal] = useState(false);
    const [editExercise, setEditExercise] = useState<Exercise | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const loadExercices = async (p: number, search: string) => {
        setLoading(true);
        try {
            const response: ApiResponse<Exercise> = await fetchExercices(p, search);
            setExercises(response.data);
            setTotalPages(response.last_page);
            setPaginated(response.data);
        } catch {
            console.error("Error fetching exercises");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExercices(page, search);
    }, [page, search]);

    const filtered = exercises.filter((e) =>
        [e.name, e.category, e.body_part, e.equipment]
            .some((v) => v?.toLowerCase().includes(search.toLowerCase()))
    );

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };
    const handleDeleteExercice = async (id: string) => {
        await deleteItem("exercises", [id]);
        setDeleteTarget(null);
        await loadExercices(page, search);
    };

    return (
        <div className="min-h-screen bg-gray-950">
            {deleteTarget && (
                <ConfirmDeleteModal
                    onConfirm={() => handleDeleteExercice(deleteTarget)}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
            {showModal && (
                <CreateExerciceModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        loadExercices(page, "");
                    }}
                />
            )}
            {editExercise && (
                <UpdateExerciceModal
                    exercise={editExercise}
                    onClose={() => setEditExercise(null)}
                    onSuccess={() => {
                        setEditExercise(null);
                        loadExercices(page, search);
                    }}
                />
            )}
            {showEtlModal && (
                <RunEtlModal
                    defaultDataset="exercises"
                    onClose={() => setShowEtlModal(false)}
                    onSuccess={() => setShowEtlModal(false)}
                />
            )}
            <div className="w-full flex flex-col p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-white tracking-tight">Exercices</h1>
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        />
                        <button
                            onClick={() => setShowEtlModal(true)}
                            className="px-4 py-2 text-sm rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold transition-colors"
                        >
                            ↑ Import CSV
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
                        >
                            + Créer
                        </button>
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-gray-800 text-gray-400 uppercase text-xs tracking-wider">
                                <th className="px-6 py-4">Nom</th>
                                <th className="px-6 py-4">Catégorie</th>
                                <th className="px-6 py-4">Partie du corps</th>
                                <th className="px-6 py-4">Équipement</th>
                                <th className="px-6 py-4">Difficulté</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            Chargement...
                                        </div>
                                    </td>
                                </tr>
                            ) : paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Aucun exercice trouvé.
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((exercise) => (
                                    <tr
                                        key={exercise.id}
                                        className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors"
                                    >
                                        <td className="px-6 py-4 text-white font-medium">{exercise.name}</td>
                                        <td className="px-6 py-4 text-gray-300">{exercise.category ?? "—"}</td>
                                        <td className="px-6 py-4 text-gray-300">{exercise.body_part ?? "—"}</td>
                                        <td className="px-6 py-4 text-gray-300">{exercise.equipment ?? "—"}</td>
                                        <td className="px-6 py-4">
                                            {exercise.difficulty ? (
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${difficultyBadge[exercise.difficulty]}`}>
                                                    {difficultyLabel[exercise.difficulty]}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setEditExercise(exercise)}
                                                className="px-3 py-1 text-xs rounded-lg bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 transition-colors"
                                            >
                                                Modifier
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(exercise.id)}
                                                className="px-3 py-1 text-xs rounded-lg bg-red-700 hover:bg-red-600 border border-red-600 text-gray-200 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
                    <span>{filtered.length} exercice{filtered.length !== 1 ? "s" : ""}</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            ‹
                        </button>
                        <span>Page {page} / {totalPages}</span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            ›
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}