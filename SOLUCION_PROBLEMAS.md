# 🔧 GUÍA DE CONFIGURACIÓN: Solución de Problemas

## Problemas Resueltos

### ✅ Problema 1: Calendarios Externos No Cargan
**Síntoma**: Las fechas de Airbnb, Booking y Google Calendar no aparecen en el calendario de reservas en producción.

**Causa**: El archivo `icalParser.js` solo leía de `localStorage`, pero en producción (Vercel) necesita cargar desde Supabase.

**Solución Aplicada**: Modificado `src/utils/icalParser.js` para cargar configuración desde API/Supabase primero, con fallback a localStorage.

---

### ✅ Problema 2: Supabase Se Desactiva por Inactividad
**Síntoma**: El plan gratuito de Supabase se pausa después de 7 días de inactividad.

**Solución Aplicada**: 
- Creado `api/cron-keep-alive.js` que hace ping a Supabase automáticamente
- Configurado Vercel Cron en `vercel.json` para ejecutar cada 5 días
- Esto mantiene tu proyecto Supabase activo permanentemente

---

## 📝 PASOS PARA DESPLEGAR (URGENTE)

### Paso 1: Configurar Variable de Entorno en Vercel

1. **Ve a tu proyecto en Vercel**: https://vercel.com/tu-usuario/tu-proyecto/settings/environment-variables

2. **Agrega una nueva variable de entorno**:
   - **Name**: `CRON_SECRET`
   - **Value**: Genera una clave secreta aleatoria (puedes usar este comando en terminal):
     ```bash
     openssl rand -base64 32
     ```
     O simplemente usa esta: `tu_clave_secreta_muy_larga_y_dificil_de_adivinar_2024`
   
   - **Environments**: Marca "Production", "Preview", y "Development"

3. **Clic en "Save"**

### Paso 2: Asegurar que las URLs de iCal están en Supabase

Las URLs de tus calendarios iCal deben estar guardadas en Supabase. Verifica esto:

1. **Opción A - Desde el Admin (Recomendado)**:
   - Ve a `reservadelassierras.com/admin/conexiones`
   - Verifica que las URLs de Airbnb, Booking y Google Calendar estén completas
   - Clic en **"Guardar Cambios"** (esto guarda en Supabase)

2. **Opción B - Verificar directamente en Supabase**:
   - Ve a tu proyecto Supabase: https://supabase.com/dashboard/project/xazejrlmgeugpnzmmsvn
   - Table Editor → `site_config` → Revisa que el campo `config_data` tenga:
     - `airbnbUrl`
     - `bookingUrl`
     - `googleCalendarUrl`

### Paso 3: Desplegar los Cambios

**Opción A - Desde Terminal (Automático)**:
```bash
cd "/Users/oscar/Library/CloudStorage/OneDrive-Trafing/100. Web Reserva 100"
git add .
git commit -m "Fix: Calendarios externos + Supabase keep-alive automático"
git push origin main
```

**Opción B - Desde Vercel Dashboard (Manual)**:
- Ve a tu proyecto en Vercel
- Pestaña "Deployments"
- Clic en "Redeploy" en el último deployment

### Paso 4: Verificar que Funciona

1. **Verificar Calendarios Externos**:
   - Espera 2-3 minutos después del deploy
   - Ve a `reservadelassierras.com/reservas`
   - Abre la consola del navegador (F12)
   - Deberías ver: `✅ iCal URLs loaded from Supabase`
   - El calendario debe mostrar las fechas bloqueadas de tus plataformas

2. **Verificar Cron Job (Keep-Alive)**:
   - Ve a Vercel → Tu Proyecto → Cron Jobs
   - Deberías ver: `api/cron-keep-alive` programado para `0 0 */5 * *`
   - El cron se ejecutará automáticamente cada 5 días a las 00:00 UTC
   - También puedes ejecutarlo manualmente desde el dashboard para probarlo

---

## 🎯 Resumen de Cambios en el Código

### Archivos Modificados:
1. ✅ `src/utils/icalParser.js` - Ahora carga URLs desde Supabase
2. ✅ `vercel.json` - Configuración de Cron Jobs
3. ✅ `api/cron-keep-alive.js` - Nuevo endpoint para keep-alive

### Archivos que NO necesitas modificar:
- Todos los demás archivos permanecen igual

---

## ⚠️ IMPORTANTE: Notas de Seguridad

1. **CRON_SECRET**: Esta variable debe ser secreta. No la compartas públicamente.
2. **Keep-Alive**: El cron job se ejecuta cada 5 días (no necesitas hacer nada manualmente)
3. **Free Tier**: Esta solución mantiene tu proyecto Supabase activo indefinidamente en el plan gratuito

---

## 🆘 Troubleshooting

### Si los calendarios externos aún no cargan:

1. **Verifica que las URLs estén guardadas en Supabase**:
   - Ve a admin/conexiones
   - Guarda los cambios nuevamente

2. **Verifica la consola del navegador**:
   - Abre F12 en Chrome/Firefox
   - Busca errores en la pestaña "Console"
   - Deberías ver mensajes de log de icalParser.js

3. **Verifica que la API funciona**:
   - Abre: `https://reservadelassierras.com/api/config`
   - Deberías ver un JSON con `airbnbUrl`, `bookingUrl`, etc.

### Si Supabase sigue pausándose:

1. **Verifica que CRON_SECRET esté configurado** en Vercel
2. **Verifica que el cron job esté activo** en Vercel Dashboard
3. **Ejecuta el cron manualmente** una vez para probarlo
4. **Revisa los logs** en Vercel → Functions → cron-keep-alive

---

## 📞 Soporte

Si tienes problemas, revisa:
- Logs de Vercel: https://vercel.com/tu-proyecto/logs
- Logs de Supabase: https://supabase.com/dashboard/project/xazejrlmgeugpnzmmsvn/logs/explorer

---

**Fecha de Creación**: 2026-01-06  
**Última Actualización**: 2026-01-06
