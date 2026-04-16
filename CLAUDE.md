# Localizando — Contexto del proyecto para Claude Code

## Qué es esto
Webapp llamada **Localizando**: el primer agregador inteligente de locales comerciales para Buenos Aires.
Permite a buscadores encontrar locales con datos reales de tráfico y viabilidad, y a publicadores listar sus locales.

El product brief completo está en: `../Localizando_ProductBrief.pdf`

## Stack
- **Framework**: Next.js 14 (App Router)
- **Base de datos / Auth / Storage**: Supabase
- **Estilos**: Tailwind CSS
- **Hosting**: Vercel
- **Emails**: Resend
- **Pagos**: MercadoPago
- **Mapas**: Google Maps Platform + Google Places API

## Perfiles de usuario
- **Buscador** (gratuito): busca locales, recibe alertas por email cuando un local supera su umbral de match
- **Publicador** (pago): publica locales — Plan Estándar ($8.500 ARS/30d) o Destacado ($14.900 ARS/60d)

## Motor de scoring (el diferencial del producto)
- **Match Score (1-100)**: qué tan bien encaja un local con las preferencias del buscador. Se recalcula en tiempo real con cada cambio de filtros.
- **Score de visibilidad física (1-100)**: qué tan visible es el local desde la calle. Se calcula UNA SOLA VEZ al publicar.
- Colores: Verde = 75-100 · Amarillo = 50-74 · Rojo = <50

## Reglas de negocio NO negociables (validar siempre en frontend Y backend)

### Rubros
- Estado BINARIO: tildado = permitido / sin tildar = no permitido. Sin tercer estado.
- Mínimo 1 rubro tildado para publicar. Bloquea el stepper.
- El filtro de rubro se aplica ANTES del match score. Sin coincidencia → score = 0 → local oculto.

### Fotos
- Mínimo 4 fotos obligatorias: frente, interior, entorno, baño.
- Botón de publicar deshabilitado hasta tener las 4 fotos.
- Almacenadas en Supabase Storage con URL firmada (nunca URL pública directa).
- Locales sin fotos NO aparecen en resultados.

### Registro
- CUIT obligatorio para todos los publicadores.
- Matrícula inmobiliaria: OPCIONAL, solo para inmobiliarias y administradores.
- El pago se cobra al publicar el aviso, NO en el registro.
- Un mismo email puede tener perfil de buscador Y publicador.

## Orden de desarrollo (seguir estrictamente)
1. ✅ Setup: Next.js + Supabase + Vercel + Tailwind CSS
2. Autenticación: Google OAuth + email/contraseña + selección de rol
3. Formulario de publicación: 4 pasos + upload de fotos a Supabase Storage
4. Motor de scoring: match score con Google Places API
5. Dashboard del buscador: lista con filtros + cards con scores
6. Vista de detalle del local: mapa heatmap + score desglosado + galería
7. Sistema de alertas: email via Resend al superar umbral
8. Pagos: MercadoPago al publicar aviso
9. Flujo de visita: Calendly embed + WhatsApp pre-cargado
10. Vista de mapa: pins con scores + toggle heatmap
11. Panel del publicador: gestión de avisos

## Estructura de carpetas
```
app/
  (auth)/          → páginas de login, registro, selección de rol
  (dashboard)/     → dashboard del buscador
  (publisher)/     → panel del publicador
  api/             → API routes del servidor
components/
  ui/              → componentes reutilizables (botones, badges, sliders)
  auth/            → componentes de autenticación
  dashboard/       → componentes del dashboard del buscador
  publisher/       → componentes del panel del publicador
lib/
  supabase/        → cliente de Supabase (client.ts y server.ts)
  scoring/         → lógica del motor de scoring
types/             → tipos TypeScript del proyecto
utils/             → funciones utilitarias
```

## Variables de entorno requeridas
Ver `.env.local` — completar con valores reales de cada servicio antes de cada integración.
