
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">HealthAI Admin</h1>
          <p className="text-sm text-gray-400 mt-1">Connectez-vous à votre espace</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">

          <a
            type="submit"
            href="/login"
          >
            <button className=" w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors">
              Se connecter
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
