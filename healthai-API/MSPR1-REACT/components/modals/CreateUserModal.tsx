"use client";

import { createUser } from "@/lib/api";
import { User } from "@/types/users.type";
import { useState } from "react";

type Props = {
    onClose: () => void;
    onSuccess: () => void;
};

const GENDER_OPTIONS: { value: User["gender"]; label: string }[] = [
    { value: "male", label: "Homme" },
    { value: "female", label: "Femme" },
    { value: "other", label: "Autre" },
];


export default function CreateUserModal({ onClose, onSuccess }: Props) {
    const [form, setForm] = useState({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        age: "",
        gender: "" as User["gender"] | "",
        weight_kg: "",
        height_cm: "",
        is_premium: false,
        is_active: true,
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.email.trim()) {
            setError("L'email est obligatoire.");
            return;
        }
        if (!form.password.trim()) {
            setError("Le mot de passe est obligatoire.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await createUser({
                email: form.email.trim(),
                password: form.password,
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                age: Number(form.age),
                gender: form.gender as User["gender"],
                weight_kg: Number(form.weight_kg),
                height_cm: Number(form.height_cm),
                is_premium: form.is_premium,
                is_active: form.is_active,
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
                className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white tracking-tight">
                        Nouvel utilisateur
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Email */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400">
                            Email <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Ex : john@example.com"
                            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Mot de passe */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400">
                            Mot de passe <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Prénom + Nom */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-400">Prénom</label>
                            <input
                                type="text"
                                name="first_name"
                                value={form.first_name}
                                onChange={handleChange}
                                placeholder="Ex : John"
                                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-400">Nom</label>
                            <input
                                type="text"
                                name="last_name"
                                value={form.last_name}
                                onChange={handleChange}
                                placeholder="Ex : Doe"
                                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Âge + Genre */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-400">Âge</label>
                            <input
                                type="number"
                                name="age"
                                value={form.age}
                                onChange={handleChange}
                                placeholder="Ex : 25"
                                min={1}
                                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-400">Genre</label>
                            <select
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">— Sélectionner —</option>
                                {GENDER_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Poids + Taille */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-400">Poids (kg)</label>
                            <input
                                type="number"
                                name="weight_kg"
                                value={form.weight_kg}
                                onChange={handleChange}
                                placeholder="Ex : 70"
                                min={1}
                                step="0.1"
                                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-400">Taille (cm)</label>
                            <input
                                type="number"
                                name="height_cm"
                                value={form.height_cm}
                                onChange={handleChange}
                                placeholder="Ex : 175"
                                min={1}
                                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Premium + Actif */}
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_premium"
                                checked={form.is_premium}
                                onChange={handleChange}
                                className="w-4 h-4 accent-blue-500"
                            />
                            Premium
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={form.is_active}
                                onChange={handleChange}
                                className="w-4 h-4 accent-blue-500"
                            />
                            Actif
                        </label>
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
