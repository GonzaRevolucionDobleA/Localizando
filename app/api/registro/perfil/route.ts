import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Cliente con permisos de administrador — solo se usa en el servidor
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.json();
  const { tipo, userId, ...datos } = body;

  if (!userId) {
    return NextResponse.json({ error: "userId requerido" }, { status: 400 });
  }

  // Guardar perfil base
  const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
    id: userId,
    role: tipo,
    nombre: datos.nombre,
    email: datos.email,
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Guardar datos específicos según el tipo
  if (tipo === "buscador") {
    const { error } = await supabaseAdmin.from("buscador_preferences").insert({
      user_id: userId,
      rubro: datos.rubro,
      zonas: datos.zonas,
      superficie_min: datos.superficie_min || null,
      superficie_max: datos.superficie_max || null,
      precio_maximo: datos.precio_maximo || null,
      umbral_alerta: datos.umbral_alerta ?? 75,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (tipo === "publicador") {
    const { error } = await supabaseAdmin.from("publicador_profiles").insert({
      user_id: userId,
      empresa: datos.empresa || null,
      telefono: datos.telefono,
      cuit: datos.cuit,
      condicion_iva: datos.condicion_iva,
      tipo_publicador: datos.tipo_publicador,
      matricula: datos.matricula || null,
      sitio_web: datos.sitio_web || null,
      plan_actual: datos.plan_actual || "estandar",
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
