"use client";

import ConfirmDeleteModal from "@/components/modals/ConfirmDeleteModal";
import CreateUserModal from "@/components/modals/CreateUserModal";
import RunEtlModal from "@/components/modals/RunEtlModal";
import UpdateUserModal from "@/components/modals/UpdateUserModal";
import { useAuth } from "@/hooks/useAuth";
import { deleteItem, fetchUsers } from "@/lib/api";
import { ApiResponse } from "@/types/api.type";
import { User } from "@/types/users.type";
import { useEffect, useState } from "react";

export default function Users() {
    useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [paginated, setPaginated] = useState<User[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showEtlModal, setShowEtlModal] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUsers = async (p: number, search: string) => {
        setLoading(true);
        try {
            const response: ApiResponse<User> = await fetchUsers(p, search);
            setUsers(response.data);
            setTotalPages(response.last_page);
            setPaginated(response.data);
        } catch {
            console.error("Error fetching users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers(page, search);
    }, [page, search]);

    const filtered = users.filter((u) =>
        [u.first_name, u.last_name, u.email, u.gender]
            .some((v) => v?.toLowerCase().includes(search.toLowerCase()))
    );

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleDeleteUser = async (id: string) => {
        await deleteItem("users", [id]);
        setDeleteTarget(null);
        await loadUsers(page, search);
    };

    return (
        <div className="min-h-screen bg-gray-950">
            {deleteTarget && (
                <ConfirmDeleteModal
                    onConfirm={() => handleDeleteUser(deleteTarget)}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
            {showModal && (
                <CreateUserModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        loadUsers(page, "");
                    }}
                />
            )}
            {editUser && (
                <UpdateUserModal
                    user={editUser}
                    onClose={() => setEditUser(null)}
                    onSuccess={() => {
                        setEditUser(null);
                        loadUsers(page, search);
                    }}
                />
            )}
            {showEtlModal && (
                <RunEtlModal
                    defaultDataset="users"
                    onClose={() => setShowEtlModal(false)}
                    onSuccess={() => setShowEtlModal(false)}
                />
            )}
            <div className="w-full flex flex-col p-6 overflow-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-white tracking-tight">Users</h1>
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
                                <th className="px-6 py-4">Prénom</th>
                                <th className="px-6 py-4">Nom</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Âge</th>
                                <th className="px-6 py-4">Genre</th>
                                <th className="px-6 py-4">Poids (kg)</th>
                                <th className="px-6 py-4">Taille (cm)</th>
                                <th className="px-6 py-4">Premium</th>
                                <th className="px-6 py-4">Actif</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
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
                                    <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                                        Aucun utilisateur trouvé.
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors"
                                    >
                                        <td className="px-6 py-4 text-white font-medium">{user.first_name}</td>
                                        <td className="px-6 py-4 text-white font-medium">{user.last_name}</td>
                                        <td className="px-6 py-4 text-gray-300">{user.email}</td>
                                        <td className="px-6 py-4 text-gray-300">{user.age ?? "—"}</td>
                                        <td className="px-6 py-4 text-gray-300">{user.gender ?? "—"}</td>
                                        <td className="px-6 py-4 text-gray-300">{user.weight_kg ?? "—"}</td>
                                        <td className="px-6 py-4 text-gray-300">{user.height_cm ?? "—"}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${user.is_premium ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-700 text-gray-400"}`}>
                                                {user.is_premium ? "Oui" : "Non"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${user.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                                {user.is_active ? "Actif" : "Inactif"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setEditUser(user)}
                                                    className="px-3 py-1 text-xs rounded-lg bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 transition-colors"
                                                >
                                                    Modifier
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(user.id)}
                                                    className="px-3 py-1 text-xs rounded-lg bg-red-700 hover:bg-red-600 border border-red-600 text-gray-200 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
                    <span>{filtered.length} utilisateur{filtered.length !== 1 ? "s" : ""}</span>
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
        </div >
    );
}