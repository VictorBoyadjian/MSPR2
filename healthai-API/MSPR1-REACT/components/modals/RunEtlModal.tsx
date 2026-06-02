"use client";

import { runEtl } from "@/lib/api";
import { useRef, useState } from "react";

const currentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
};

type Props = {
    onClose: () => void;
    onSuccess: () => void;
    defaultDataset?: string;
};

const DATASET_OPTIONS = ["foods", "exercises", "users"];

export default function RunEtlModal({ onClose, onSuccess, defaultDataset = "foods" }: Props) {
    const [dataset, setDataset] = useState(defaultDataset);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError("Veuillez sélectionner un fichier CSV.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await runEtl(file, dataset);
            onSuccess();
        } catch {
            setError("Une erreur est survenue lors de l'exécution de l'ETL.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white tracking-tight">
                        Lancer l&apos;ETL
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400">Dataset</label>
                        <select
                            value={dataset}
                            onChange={(e) => setDataset(e.target.value)}
                            className={inputClass}
                        >
                            {DATASET_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400">Fichier CSV</label>
                        <div
                            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 flex items-center gap-3 cursor-pointer hover:border-blue-500 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <span className="text-gray-400 text-sm">
                                {file ? file.name : "Choisir un fichier…"}
                            </span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                    )}

                    <div className="flex justify-end gap-3 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
                        >
                            {loading ? "Envoi…" : "Lancer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
