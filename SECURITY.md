# Seguridad — DentaApp

> Lineamientos de seguridad para el manejo de datos clínicos dentales.

## 1. Datos Sensibles

- **Expedientes clínicos** y **odontogramas** contienen datos de salud protegidos (PII/PHI).
- Nunca almacenar datos sensibles en `localStorage` ni en el service worker cache.
- Toda transferencia de datos usa **HTTPS/TLS** obligatoriamente.

## 2. Autenticación y Autorización

- Auth gestionado por **Supabase Auth** (magic link, OAuth o email/password).
- Tokens **JWT** con expiración corta (60 min) y refresh tokens.
- **Row Level Security (RLS)** activado en todas las tablas de Supabase para aislamiento multi-tenant.

## 3. Cifrado

| Capa | Mecanismo |
|------|-----------|
| En tránsito | TLS 1.3 (Supabase + Nginx) |
| En reposo | AES-256 (Supabase managed) |
| Backups | Cifrados por Supabase |

## 4. Aislamiento Multi-Tenant

- Cada clínica tiene un `clinic_id` como columna de partición.
- RLS policies filtran todas las queries por `clinic_id` del JWT.
- No existe acceso cruzado entre clínicas salvo super-admin.

## 5. Almacenamiento de Archivos

- Radiografías e imágenes en **Supabase Storage** con políticas RLS.
- URLs firmadas con expiración para acceso temporal.
- No se sirven archivos directamente al público.

## 6. Mejores Prácticas

- [ ] Auditoría de acceso habilitada en Supabase.
- [ ] Rate limiting en endpoints de API.
- [ ] Validación de entrada en backend (Pydantic) y frontend.
- [ ] Sanitización de HTML/texto para prevenir XSS.
- [ ] CORS restringido a dominios conocidos.
- [ ] Dependencias auditadas periódicamente (`pip-audit`, `npm audit`).

## 7. Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad, repórtala de forma privada a: **security@dentaapp.com** (placeholder).
