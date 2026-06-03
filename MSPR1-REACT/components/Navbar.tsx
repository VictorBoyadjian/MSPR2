"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, removeToken } from "@/lib/auth";

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkToken = async () => {
            setIsLoggedIn(!!await getToken());
        };
        checkToken();
    }, []);

    const handleLogout = () => {
        removeToken();
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setIsLoggedIn(false);
        router.push("/login");
    };

    return (
        <nav className="bg-gray-800 border-b border-gray-700 shadow-lg">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-8">
                    <a
                        href="/dashboard"
                        className="text-xl font-bold text-blue-400 hover:text-blue-300 transition"
                    >
                        HealthAI Admin
                    </a>
                    <div className="flex gap-6">
                        <a
                            href="/dashboard/users"
                            className="text-sm font-medium text-gray-300 hover:text-white transition"
                        >
                            Utilisateurs
                        </a>
                        <a
                            href="/dashboard/exercises"
                            className="text-sm font-medium text-gray-300 hover:text-white transition"
                        >
                            Exercices
                        </a>
                        <a
                            href="/dashboard/foods"
                            className="text-sm font-medium text-gray-300 hover:text-white transition"
                        >
                            Aliments
                        </a>
                    </div>
                </div>

                {isLoggedIn && (
                    <div className="flex items-end gap-4">

                        <button
                            onClick={handleLogout}
                            className="text-sm font-medium text-red-400 hover:text-red-300 transition"
                        >
                            Se déconnecter
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
