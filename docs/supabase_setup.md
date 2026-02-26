# Configuración de Supabase para DentaApp

Guía paso a paso para configurar tu proyecto de Supabase.

## 1. Crear Proyecto

1. Ve a [supabase.com](https://supabase.com) e inicia sesión.
2. Clic en **New Project**.
3. Nombre: `denta-app` (o el que prefieras).
4. Región: selecciona la más cercana a tus usuarios.
5. Genera y guarda la contraseña de la base de datos.

## 2. Obtener Claves

En **Settings → API** encontrarás:

| Variable | Dónde usarla |
|----------|-------------|
| **Project URL** | `SUPABASE_URL` / `VITE_SUPABASE_URL` |
| **anon public key** | `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY` |
| **service_role key** | `SUPABASE_SERVICE_ROLE_KEY` (solo backend, nunca exponer al frontend) |

> [!CAUTION]
> La `service_role key` tiene acceso total a la base de datos. Nunca la expongas en el frontend ni la subas a control de versiones.

## 3. Habilitar Autenticación

En **Authentication → Providers**:

1. Habilita **Email** (con confirm email activado).
2. Opcionalmente habilita **Google OAuth** o **Magic Link**.
3. Configura la URL de redirección: `http://localhost:5173` para desarrollo.

## 4. Configurar Storage

En **Storage**:

1. Crea un bucket llamado `clinical-files` (privado).
2. Crea un bucket llamado `profile-photos` (privado).
3. Configura políticas RLS para cada bucket:
   - Solo el usuario dueño puede leer/escribir sus archivos.
   - Admins de la clínica pueden leer archivos de su clínica.

## 5. Row Level Security (RLS)

> [!IMPORTANT]
> RLS **debe estar habilitado** en todas las tablas para aislamiento multi-tenant.

Ejemplo de política para tabla `patients`:

```sql
-- Permitir SELECT solo a usuarios de la misma clínica
CREATE POLICY "Users can view patients of their clinic"
ON patients
FOR SELECT
USING (
  clinic_id = (
    SELECT clinic_id FROM user_profiles
    WHERE id = auth.uid()
  )
);
```

## 6. Variables de Entorno

Copia las claves a tus archivos `.env`:

```bash
# Raíz del monorepo
cp .env.example .env

# Edita con tus valores reales
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## 7. Verificar Conexión

Después de configurar, verifica ejecutando la app y revisando la consola del navegador para confirmar la conexión exitosa con Supabase.
