"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const RUBROS = [
  "Gastronómico",
  "Indumentaria",
  "Salud y estética",
  "Depósito/logística",
  "Oficina/coworking",
  "Educación",
  "Servicios",
  "Entretenimiento",
];

const ZONAS = [
  "Palermo", "Belgrano", "Recoleta", "Villa Crespo", "Caballito",
  "Flores", "Almagro", "San Telmo", "Microcentro", "Once",
  "Colegiales", "Chacarita", "Devoto", "Liniers", "Mataderos",
  "Balvanera", "Barracas", "La Boca", "Nuñez", "Saavedra",
];

type Step = 1 | 2 | 3;

export default function RegistroBuscador() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: cuenta
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2: preferencias
  const [rubro, setRubro] = useState("");
  const [zonas, setZonas] = useState<string[]>([]);
  const [superficieMin, setSuperficieMin] = useState("");
  const [superficieMax, setSuperficieMax] = useState("");
  const [precioMaximo, setPrecioMaximo] = useState("");
  const [umbralAlerta, setUmbralAlerta] = useState(75);

  function toggleZona(zona: string) {
    setZonas((prev) =>
      prev.includes(zona) ? prev.filter((z) => z !== zona) : [...prev, zona]
    );
  }

  async function handleCrearCuenta(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: nombre } },
    });

    if (error) {
      setError(error.message === "User already registered"
        ? "Ya existe una cuenta con ese email."
        : "Error al crear la cuenta. Intentá de nuevo.");
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep(2);
  }

  async function handleGuardarPreferencias(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Sesión expirada. Volvé a registrarte."); setLoading(false); return; }

    // Guardar perfil
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      role: "buscador",
      nombre,
      email,
    });

    if (profileError) { setError("Error al guardar el perfil."); setLoading(false); return; }

    // Guardar preferencias
    const { error: prefError } = await supabase.from("buscador_preferences").insert({
      user_id: user.id,
      rubro,
      zonas,
      superficie_min: superficieMin ? parseInt(superficieMin) : null,
      superficie_max: superficieMax ? parseInt(superficieMax) : null,
      precio_maximo: precioMaximo ? parseInt(precioMaximo) : null,
      umbral_alerta: umbralAlerta,
    });

    if (prefError) { setError("Error al guardar las preferencias."); setLoading(false); return; }

    setLoading(false);
    setStep(3);
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={() => router.push("/")} className="text-2xl font-bold text-brand-700 tracking-tight">
            LOCALIZANDO
          </button>
          <p className="mt-2 text-gray-500 text-sm">Crear cuenta · Buscador de locales</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step === s ? "bg-brand-600 text-white" :
                step > s ? "bg-brand-100 text-brand-700" :
                "bg-gray-200 text-gray-400"
              }`}>
                {step > s ? "✓" : s}
              </div>
              {s < 3 && <div className={`w-8 h-0.5 ${step > s ? "bg-brand-300" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          {/* PASO 1: Crear cuenta */}
          {step === 1 && (
            <form onSubmit={handleCrearCuenta} className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Creá tu cuenta</h2>
              <p className="text-sm text-gray-500 mb-4">Gratis, sin tarjeta de crédito.</p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
                <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Juan García" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="tu@email.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Mínimo 6 caracteres" />
              </div>

              {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm mt-2">
                {loading ? "Creando cuenta..." : "Continuar"}
              </button>
            </form>
          )}

          {/* PASO 2: Preferencias */}
          {step === 2 && (
            <form onSubmit={handleGuardarPreferencias} className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Configurá tus preferencias</h2>
                <p className="text-sm text-gray-500">Usamos esto para calcular el match score.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rubro buscado *</label>
                <select required value={rubro} onChange={(e) => setRubro(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                  <option value="">Seleccioná un rubro</option>
                  {RUBROS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zonas de interés</label>
                <div className="flex flex-wrap gap-2">
                  {ZONAS.map((zona) => (
                    <button key={zona} type="button" onClick={() => toggleZona(zona)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        zonas.includes(zona)
                          ? "bg-brand-600 text-white border-brand-600"
                          : "bg-white text-gray-600 border-gray-300 hover:border-brand-400"
                      }`}>
                      {zona}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Superficie mín. (m²)</label>
                  <input type="number" value={superficieMin} onChange={(e) => setSuperficieMin(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="Ej: 30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Superficie máx. (m²)</label>
                  <input type="number" value={superficieMax} onChange={(e) => setSuperficieMax(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="Ej: 100" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio máximo mensual ($)</label>
                <input type="number" value={precioMaximo} onChange={(e) => setPrecioMaximo(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Ej: 500000" />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <label className="block text-sm font-medium text-amber-800 mb-3">
                  Alerta de match: <span className="font-bold">{umbralAlerta}%</span>
                </label>
                <input type="range" min={50} max={100} value={umbralAlerta}
                  onChange={(e) => setUmbralAlerta(parseInt(e.target.value))}
                  className="w-full accent-amber-500" />
                <p className="text-xs text-amber-700 mt-2">
                  Recibís un email cuando un local supere este score de match.
                </p>
              </div>

              {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

              <button type="submit" disabled={loading || !rubro}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                {loading ? "Guardando..." : "Continuar"}
              </button>
            </form>
          )}

          {/* PASO 3: Confirmación */}
          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">¡Cuenta creada!</h2>
              <p className="text-sm text-gray-500">
                Ya podés buscar locales y recibir alertas cuando aparezca uno que supere tu umbral de match.
              </p>
              <div className="bg-brand-50 rounded-xl p-4 text-left">
                <p className="text-sm font-medium text-brand-800">Revisá tu email</p>
                <p className="text-xs text-brand-600 mt-1">
                  Enviamos un link de confirmación a <strong>{email}</strong>. Confirmá tu cuenta para activar las alertas.
                </p>
              </div>
              <button onClick={() => router.push("/dashboard")}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm mt-2">
                Ir al dashboard
              </button>
            </div>
          )}
        </div>

        {step === 1 && (
          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tenés cuenta?{" "}
            <button onClick={() => router.push("/login")} className="text-brand-600 font-medium hover:underline">
              Iniciá sesión
            </button>
          </p>
        )}
      </div>
    </main>
  );
}
