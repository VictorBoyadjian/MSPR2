type ConfirmDeleteModalProps = {
    message?: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmDeleteModal({ message, onConfirm, onCancel }: ConfirmDeleteModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                    </div>
                    <h2 className="text-white font-semibold text-lg">Confirmer la suppression</h2>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                    {message ?? "Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible."}
                </p>
                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-200 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors"
                    >
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    );
}
