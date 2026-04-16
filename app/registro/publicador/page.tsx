"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Step = 1 | 2 | 3 | 4;
type TipoPublicador = "propietario" | "inmobiliaria" | "administrador";

export default function RegistroPublicador() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // Step 1: cuenta
  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2: datos fiscales
  const [tipoPublicador, setTipoPublicador] = useState<TipoPublicador>("propietario");
  const [telefono, setTelefono] = useState("");
  const [cuit, setCuit] = useState("");
  const [condicionIva, setCondicionIva] = useState("");
  const [matricula, setMatricula] = useState("");
  const [sitioWeb, setSitioWeb] = useState("");

  // Step 3: plan
  const [plan, setPlan] = useState<"estandar" | "destacado">("estandar");

  async function handleCrearCuenta(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
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

    if (data?.user) setUserId(data.user.id);
    setLoading(false);
    setStep(2);
  }

  async function handleGuardarFiscal(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const uid = userId;
    if (!uid) { setError("Error al recuperar la sesión. Intentá de nuevo."); setLoading(false); return; }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: uid,
      role: "publicador",
      nombre,
      email,
    });

    if (profileError) { setError("Error al guardar el perfil."); setLoading(false); return; }

    const { error: pubError } = await supabase.from("publicador_profiles").insert({
      user_id: uid,
      empresa: empresa || null,
      telefono,
      cuit,
      condicion_iva: condicionIva,
      tipo_publicador: tipoPublicador,
      matricula: matricula || null,
      sitio_web: sitioWeb || null,
    });

    if (pubError) { setError("Error al guardar los datos."); setLoading(false); return; }

    setLoading(false);
    setStep(3);
  }

  async function handleConfirmarPlan(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (userId) {
      await supabase.from("publicador_profiles")
        .update({ plan_actual: plan })
        .eq("user_id", userId);
    }

    setLoading(false);
    setStep(4);
  }

  const requiereMatricula = tipoPublicador === "inmobiliaria" || tipoPublicador === "administrador";

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={() => router.push("/")} className="text-2xl font-bold text-brand-700 tracking-tight">
            LOCALIZANDO
          </button>
          <p className="mt-2 text-gray-500 text-sm">Crear cuenta · Publicador de locales</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step === s ? "bg-brand-600 text-white" :
                step > s ? "bg-brand-100 text-brand-700" :
                "bg-gray-200 text-gray-400"
              }`}>
                {step > s ? "✓" : s}
              </div>
              {s < 4 && <div className={`w-6 h-0.5 ${step > s ? "bg-brand-300" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          {/* PASO 1: Cuenta */}
          {step === 1 && (
            <form onSubmit={handleCrearCuenta} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Creá tu cuenta</h2>
                <p className="text-sm text-gray-500 mb-4">El pago se realiza al publicar tu primer aviso, no ahora.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo *</label>
                <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Juan García" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre de empresa (si aplica)</label>
                <input type="text" value={empresa} onChange={(e) => setEmpresa(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Ej: Inmobiliaria García" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="tu@email.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña *</label>
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

          {/* PASO 2: Datos fiscales */}
          {step === 2 && (
            <form onSubmit={handleGuardarFiscal} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Datos fiscales</h2>
                <p className="text-sm text-gray-500 mb-2">Necesarios para emitir facturas automáticas.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de publicador *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["propietario", "inmobiliaria", "administrador"] as TipoPublicador[]).map((tipo) => (
                    <button key={tipo} type="button" onClick={() => setTipoPublicador(tipo)}
                      className={`px-2 py-2.5 rounded-xl text-xs font-medium border transition-colors capitalize ${
                        tipoPublicador === tipo
                          ? "bg-brand-600 text-white border-brand-600"
                          : "bg-white text-gray-600 border-gray-300 hover:border-brand-400"
                      }`}>
                      {tipo === "propietario" ? "Propietario" : tipo === "inmobiliaria" ? "Inmobiliaria" : "Administrador"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono *</label>
                <input type="tel" required value={telefono} onChange={(e) => setTelefono(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Ej: 1122334455" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">CUIT *</label>
                <input type="text" required value={cuit} onChange={(e) => setCuit(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Ej: 20-12345678-9" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Condición IVA *</label>
                <select required value={condicionIva} onChange={(e) => setCondicionIva(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                  <option value="">Seleccioná</option>
                  <option value="responsable_inscripto">Responsable Inscripto</option>
                  <option value="monotributista">Monotributista</option>
                  <option value="exento">Exento</option>
                </select>
              </div>

              {requiereMatricula && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Matrícula inmobiliaria <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input type="text" value={matricula} onChange={(e) => setMatricula(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="Ej: 12345" />
                  <p className="text-xs text-gray-400 mt-1">Aumenta la confianza en tu perfil público.</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Sitio web <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input type="url" value={sitioWeb} onChange={(e) => setSitioWeb(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="https://tu-sitio.com" />
              </div>

              {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm mt-2">
                {loading ? "Guardando..." : "Continuar"}
              </button>
            </form>
          )}

          {/* PASO 3: Plan */}
          {step === 3 && (
            <form onSubmit={handleConfirmarPlan} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Elegí tu plan</h2>
                <p className="text-sm text-gray-500 mb-2">El cobro se realiza al publicar cada aviso, no ahora.</p>
              </div>

              <div className="space-y-3">
                <button type="button" onClick={() => setPlan("estandar")}
                  className={`w-full border-2 rounded-xl p-4 text-left transition-all ${
                    plan === "estandar" ? "border-brand-600 bg-brand-50" : "border-gray-200 hover:border-gray-300"
                  }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-900">Estándar</p>
                      <p className="text-xs text-gray-500 mt-1">30 días · hasta 7 fotos · búsquedas orgánicas</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">$8.500</p>
                      <p className="text-xs text-gray-500">por aviso</p>
                    </div>
                  </div>
                </button>

                <button type="button" onClick={() => setPlan("destacado")}
                  className={`w-full border-2 rounded-xl p-4 text-left transition-all ${
                    plan === "destacado" ? "border-brand-600 bg-brand-50" : "border-gray-200 hover:border-gray-300"
                  }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-gray-900">Destacado</p>
                        <span className="bg-brand-100 text-brand-700 text-xs font-medium px-2 py-0.5 rounded-full">Recomendado</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">60 días · fotos ilimitadas · badge en resultados · prioridad en lista</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">$14.900</p>
                      <p className="text-xs text-gray-500">por aviso</p>
                    </div>
                  </div>
                </button>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm mt-2">
                {loading ? "Guardando..." : "Confirmar plan"}
              </button>
            </form>
          )}

          {/* PASO 4: Confirmación */}
          {step === 4 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">¡Cuenta creada!</h2>
              <p className="text-sm text-gray-500">
                Ya podés publicar tu primer local. El cobro se realiza al publicar cada aviso.
              </p>
              <div className="bg-brand-50 rounded-xl p-4 text-left">
                <p className="text-sm font-medium text-brand-800">Revisá tu email</p>
                <p className="text-xs text-brand-600 mt-1">
                  Enviamos un link de confirmación a <strong>{email}</strong>. Confirmá tu cuenta para activar la publicación.
                </p>
              </div>
              <button onClick={() => router.push("/panel")}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm mt-2">
                Ir a mi panel
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
