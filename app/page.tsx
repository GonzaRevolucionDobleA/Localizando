"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-8 py-6 border-b border-gray-100">
        <span className="text-2xl font-bold text-brand-700 tracking-tight">
          LOCALIZANDO
        </span>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="inline-block bg-brand-50 text-brand-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          Buenos Aires · Fase MVP
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 max-w-xl leading-tight">
          Encontrá el local comercial ideal
        </h1>
        <p className="text-lg text-gray-500 mb-12 max-w-md">
          Con datos reales de tráfico peatonal, score de viabilidad y alertas
          automáticas de match.
        </p>

        {/* Role cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
          <button
            onClick={() => router.push("/registro/buscador")}
            className="border-2 border-brand-600 rounded-2xl p-8 text-left hover:bg-brand-50 transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Busco un local
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Encontrá el espacio ideal con datos de viabilidad y score de match personalizado
            </p>
            <div className="mt-5 text-brand-600 font-semibold text-sm">
              Gratis &rarr;
            </div>
          </button>

          <button
            onClick={() => router.push("/registro/publicador")}
            className="border-2 border-gray-200 rounded-2xl p-8 text-left hover:border-brand-300 hover:bg-gray-50 transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Publico un local
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Publicá tu local y llegá a miles de buscadores activos con perfil calificado
            </p>
            <div className="mt-5 text-gray-500 font-semibold text-sm group-hover:text-brand-600 transition-colors">
              Desde $8.500 &rarr;
            </div>
          </button>
        </div>

        <button
          onClick={() => router.push("/login")}
          className="mt-8 text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          Ya tengo cuenta &rarr; Iniciar sesión
        </button>
      </div>

      {/* Footer */}
      <footer className="px-8 py-4 text-center text-xs text-gray-400">
        Localizando &copy; 2026
      </footer>
    </main>
  );
}
