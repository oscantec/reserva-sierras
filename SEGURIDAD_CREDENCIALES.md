# 🔐 Guía de Seguridad - Rotación de Credenciales

## ⚠️ ACCIÓN REQUERIDA INMEDIATAMENTE

Este documento contiene los pasos para rotar las credenciales de Supabase expuestas en el repositorio.

---

## 📋 Resumen del Problema

Las credenciales de Supabase fueron encontradas en el archivo `.env`:
- `VITE_SUPABASE_URL`: https://xazejrlmgeugpnzmmsvn.supabase.co
- `VITE_SUPABASE_ANON_KEY`: sb_publishable_CkLUGwJpPO9LwqoPPhuvBw_8KTv4V3D

Aunque la Anon Key es pública por diseño, es una buena práctica rotarla periódicamente.

---

## 🔄 Pasos para Rotar Credenciales de Supabase

### Paso 1: Acceder a Supabase Dashboard

1. Ve a https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Selecciona el proyecto: `xazejrlmgeugpnzmmsvn`

### Paso 2: Rotar la Anon Key

1. En el dashboard de Supabase, ve a: **Project Settings** → **API**
2. Busca la sección "Project API keys"
3. Haz clic en **"Generate a new anon key"**
4. Confirma la acción

⚠️ **Nota**: Al rotar la key, la anterior dejará de funcionar inmediatamente.

### Paso 3: Actualizar Variables de Entorno en Vercel

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Actualiza las siguientes variables:
   - `VITE_SUPABASE_URL`: `https://xazejrlmgeugpnzmmsvn.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `[NUEVA_KEY_GENERADA]`
   - `SUPABASE_URL`: `https://xazejrlmgeugpnzmmsvn.supabase.co` (para API routes)
   - `SUPABASE_ANON_KEY`: `[NUEVA_KEY_GENERADA]` (para API routes)
   - `CRON_SECRET`: `[GENERA_UN_SECRETO_ALEATORIO]` (para el cron job)

### Paso 4: Generar CRON_SECRET

Genera un secreto aleatorio seguro:

```bash
# En terminal:
openssl rand -base64 32

# O en Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copia este valor como `CRON_SECRET` en Vercel.

### Paso 5: Actualizar Archivo Local .env

Crea un nuevo archivo `.env` local con las nuevas credenciales:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://xazejrlmgeugpnzmmsvn.supabase.co
VITE_SUPABASE_ANON_KEY=tu-nueva-anon-key-aqui

# Cron Job Secret
CRON_SECRET=tu-secreto-generado-aqui
```

**IMPORTANTE**: Este archivo `.env` ya está en `.gitignore` y NO debe ser commiteado.

### Paso 6: Redeploy en Vercel

1. Haz un nuevo deploy para que las variables se apliquen:
   ```bash
   git commit --allow-empty -m "Trigger deploy for new env vars"
   git push
   ```

2. O manualmente en Vercel: **Deployments** → **Redeploy**

### Paso 7: Actualizar Configuración del Cron Job

En Vercel, verifica que el cron job tenga el secreto configurado en la URL:

La URL del cron debe ser:
```
/api/cron-water-monitoring?secret=TU_CRON_SECRET
```

O configura el header `X-Cron-Secret` en la petición.

---

## 🧹 Limpieza del Historial de Git (Opcional pero Recomendado)

Si deseas eliminar completamente las credenciales antiguas del historial de git:

⚠️ **ADVERTENCIA**: Esto reescribe el historial de git. Coordina con tu equipo si es un repo compartido.

```bash
# 1. Hacer backup del repo
cd ..
cp -r "100. Web Reserva 100" "100. Web Reserva 100-backup"

# 2. Usar git-filter-repo o BFG Repo-Cleaner
# Instalar git-filter-repo
pip install git-filter-repo

# 3. Eliminar el archivo .env del historial
cd "100. Web Reserva 100"
git filter-repo --path .env --invert-paths

# 4. Forzar push (CUIDADO: esto reescribe el historial)
git push origin --force --all
```

Alternativa más segura (sin reescribir historial):
- Simplemente rotar las keys (pasos 1-6) es suficiente para invalidar las expuestas

---

## ✅ Checklist de Verificación

Después de completar los pasos:

- [ ] Nueva Anon Key generada en Supabase
- [ ] Variables actualizadas en Vercel
- [ ] CRON_SECRET configurado en Vercel
- [ ] Deploy exitoso
- [ ] Login en admin funciona correctamente
- [ ] Cron job responde con 401 si no tiene secret
- [ ] Cron job funciona con el secret correcto

---

## 🧪 Probar el Cron Job

```bash
# Debe retornar 401 Unauthorized
curl https://tu-dominio.vercel.app/api/cron-water-monitoring

# Debe retornar 200 OK
curl "https://tu-dominio.vercel.app/api/cron-water-monitoring?secret=TU_CRON_SECRET"

# O con header
curl -H "X-Cron-Secret: TU_CRON_SECRET" \
  https://tu-dominio.vercel.app/api/cron-water-monitoring
```

---

## 📞 Soporte

Si tienes problemas:
1. Revisar logs en Vercel: **Deployments** → **[Deploy]** → **Logs**
2. Verificar que todas las variables estén configuradas correctamente
3. Contactar soporte de Supabase si la rotación falla

---

*Documento generado automáticamente como parte de la auditoría de seguridad.*
