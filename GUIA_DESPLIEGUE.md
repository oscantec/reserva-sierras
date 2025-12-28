# Guía de Despliegue: Vercel + Supabase

## PASO 1: Crear Proyecto en Supabase

1. Abre tu navegador y ve a **https://supabase.com**
2. Haz clic en **"Start your project"** o **"Sign In"** si ya tienes cuenta
3. Una vez dentro, haz clic en **"New Project"**
4. Completa:
   - **Name**: `reserva-sierras` (o el nombre que quieras)
   - **Database Password**: Pon una contraseña segura (guárdala)
   - **Region**: Selecciona el más cercano a ti
5. Haz clic en **"Create new project"** y espera 2 minutos

---

## PASO 2: Crear la Tabla en Supabase

1. En tu proyecto de Supabase, ve al menú izquierdo → **"SQL Editor"**
2. Haz clic en **"New query"**
3. Copia y pega este código SQL:

```sql
CREATE TABLE IF NOT EXISTS site_config (
    id BIGINT PRIMARY KEY,
    config_data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to config" ON site_config
    FOR ALL USING (true) WITH CHECK (true);

INSERT INTO site_config (id, config_data) VALUES (1, '{}')
ON CONFLICT (id) DO NOTHING;
```

4. Haz clic en el botón verde **"Run"** (o presiona Ctrl+Enter)
5. Deberías ver: **"Success. No rows returned"**

---

## PASO 3: Obtener las Credenciales de Supabase

1. Ve a **Settings** (icono de engranaje en el menú izquierdo)
2. Haz clic en **"API"** en el submenú
3. Copia estos dos valores (los necesitarás después):
   - **Project URL**: Algo como `https://xxxxx.supabase.co`
   - **anon public key**: Una cadena larga que empieza con `eyJ...`

---

## PASO 4: Crear Usuario Admin

1. Ve a **Authentication** en el menú izquierdo
2. Haz clic en **"Users"**
3. Haz clic en **"Add user"** → **"Create new user"**
4. Completa:
   - **Email**: Tu email de administrador
   - **Password**: Tu contraseña
5. Haz clic en **"Create user"**

---

## PASO 5: Subir el Código a GitHub

1. Abre la terminal en tu proyecto
2. Ejecuta estos comandos:

```bash
git init
git add .
git commit -m "Preparado para Vercel"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

(Reemplaza `TU_USUARIO` y `TU_REPO` con tus datos de GitHub)

---

## PASO 6: Desplegar en Vercel

1. Ve a **https://vercel.com** e inicia sesión con GitHub
2. Haz clic en **"Add New..."** → **"Project"**
3. Selecciona tu repositorio de la lista
4. En la sección **"Environment Variables"**, agrega:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | (Pega tu Project URL del Paso 3) |
| `VITE_SUPABASE_ANON_KEY` | (Pega tu anon key del Paso 3) |

5. Haz clic en **"Deploy"**
6. Espera 2-3 minutos mientras se construye

---

## PASO 7: Verificar

1. Cuando termine, Vercel te dará una URL como `https://tu-proyecto.vercel.app`
2. Abre esa URL en el navegador
3. Ve a `/admin/login` e inicia sesión con el usuario que creaste en el Paso 4
4. ¡Listo! Tu sitio está en producción

---

## Resumen de lo que Guardará Supabase

✅ Colores y tipografía  
✅ Contenido de todas las páginas  
✅ Tarifas y precios  
✅ Conexiones (Google Sheets, iCal)  
✅ Configuración del footer  
✅ Usuarios administradores
