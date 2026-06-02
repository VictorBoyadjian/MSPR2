"use client";

import RunEtlModal from "@/components/modals/RunEtlModal";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export default function Dashboard() {
    useAuth();
    const [showEtlModal, setShowEtlModal] = useState(false);
    const [etlSuccess, setEtlSuccess] = useState(false);

    return (
        <div className="min-h-screen flex flex-col gap-8 items-center justify-center p-6">
            {showEtlModal && (
                <RunEtlModal
                    onClose={() => setShowEtlModal(false)}
                    onSuccess={() => {
                        setShowEtlModal(false);
                        setEtlSuccess(true);
                        setTimeout(() => setEtlSuccess(false), 4000);
                    }}
                />
            )}

            <div className="w-full max-w-2xl">
                <h1 className="text-4xl font-bold  mb-4">
                    Bienvenue sur HealthAI Admin
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                    Utilisez la navigation pour gérer les utilisateurs, les exercices et les aliments.
                </p>
            </div>

            <div className="w-full max-w-2xl  rounded-xl shadow-lg p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Accédez à votre outil analyse de données
                </h2>
                <p className="text-gray-600 mb-6">
                    Consultez vos tableaux de bord Grafana pour analyser les données en temps réel.
                </p>
                <a
                    href={process.env.NEXT_PUBLIC_GRAFANA_URL ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                    → Ouvrir Grafana
                </a>
            </div>

            {/* <div className="w-full max-w-2xl rounded-xl shadow-lg p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Pipeline ETL
                </h2>
                <p className="text-gray-600 mb-6">
                    Importez un fichier CSV pour alimenter la base de données via le pipeline ETL.
                </p>
                {etlSuccess && (
                    <p className="text-green-600 text-sm mb-4">
                        ETL lancé avec succès.
                    </p>
                )}
                <button
                    onClick={() => setShowEtlModal(true)}
                    className="inline-block px-6 py-3 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                    → Lancer l&apos;ETL
                </button>
            </div> */}
        </div>
    );
}