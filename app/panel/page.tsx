import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PanelPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nombre, role")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <span className="text-xl font-bold text-brand-700 tracking-tight">LOCALIZANDO</span>
        <span className="text-sm text-gray-500">Hola, {profile?.nombre ?? user.email}</span>
      </header>
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-12">
          <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Panel del Publicador</h1>
          <p className="text-gray-500 max-w-md mx-auto">
            Próximamente: gestión de avisos activos, borradores, vencidos y estadísticas de visitas.
          </p>
          <div className="mt-8 inline-block bg-brand-50 text-brand-700 text-sm font-medium px-4 py-2 rounded-full">
            Paso 11 del desarrollo
          </div>
        </div>
      </div>
    </main>
  );
}
