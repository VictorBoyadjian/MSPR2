"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await apiFetch("/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });

            if (data.bearer_token) {
                setToken(data.bearer_token);
                document.cookie = `token=${data.bearer_token}; path=/`;
                router.push("/dashboard");
            } else {
                setError("Email ou mot de passe incorrect.");
            }
        } catch {
            setError("Impossible de contacter le serveur.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white tracking-tight">HealthAI Admin</h1>
                    <p className="text-sm text-gray-400 mt-1">Connectez-vous à votre espace</p>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                                Adresse email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="vous@exemple.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-400 bg-red-950 border border-red-800 rounded-lg px-4 py-2.5">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
                        >
                            {loading ? "Connexion…" : "Se connecter"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}