# 💧 Sistema de Monitoreo de Agua - Instalación Rápida

## 📋 Pasos de Instalación

### 1. Configurar Base de Datos en Supabase

1. Ve a tu proyecto en [Supabase](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Ejecuta el archivo `water_measurements_setup.sql`

### 2. Configurar Variables de Entorno

Añade a tu archivo `.env` (y también en Vercel):

```bash
# Supabase (ya deberías tenerlo)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui

# Cron Secret (genera uno aleatorio)
CRON_SECRET=genera-un-secreto-aleatorio-seguro-aqui
```

**En Vercel:** Añade `CRON_SECRET` en Settings → Environment Variables

### 3. Configurar Credenciales de Tuya

1. Ve al panel de administración:
   ```
   https://tu-dominio.com/admin/agua/config
   ```

2. Completa:
   - **Access ID** (Client ID de Tuya)
   - **Access Secret** (Client Secret de Tuya)
   - **Device IDs** para cada zona (Zona Baja, Zona Alta, Zona Casa)

3. Configura las **Dimensiones de los Tanques**:
   - Para tanques cónicos: altura, radio superior, radio inferior
   - Para tanque cúbico: altura, largo, ancho
   - Número de tanques por zona

4. Haz clic en **Guardar Configuración**

### 4. Desplegar a Vercel

```bash
git add .
git commit -m "feat: Sistema de monitoreo de agua con sensores Tuya"
git push
```

Vercel automáticamente detectará el cron job en `vercel.json` y lo configurará.

---

## 🚀 Acceso al Sistema

### Panel de Configuración
```
https://tu-dominio.com/admin/agua/config
```

### Dashboard de Estadísticas
```
https://tu-dominio.com/admin/agua/stats
```

---

## 🔧 Obtener Credenciales de Tuya

1. Ve a [Tuya IoT Platform](https://iot.tuya.com/)
2. Inicia sesión o crea una cuenta
3. Crea un proyecto Cloud (o usa uno existente)
4. Navega a **Cloud** → **Development** → **Your Project**
5. Copia:
   - **Access ID** (Client ID)
   - **Access Secret** (Client Secret)
6. Ve a **Devices** → **Link Tuya App Account** para vincular tus dispositivos
7. Anota los **Device IDs** de tus 3 sensores

---

## ✅ Verificar Instalación

1. **Verificar tabla creada:**
   - En Supabase, ve a **Table Editor**
   - Busca la tabla `water_measurements`

2. **Verificar cron job:**
   - En Vercel, ve a **Deployments** → **Functions**
   - Busca `/api/cron-water-monitoring`

3. **Probar manualmente el cron:**
   ```bash
   curl "https://tu-dominio.com/api/cron-water-monitoring?secret=TU_CRON_SECRET"
   ```

4. **Ver dashboard:**
   - Accede a `/admin/agua/stats`
   - Deberías ver datos después de la primera ejecución del cron

---

## 📊 Funcionamiento

- **Automático:** El sistema consulta los sensores cada 30 minutos
- **Manual:** Usa el botón "Actualizar Ahora" en el dashboard
- **Alertas:** 
  - 🔴 Crítico: < 20%
  - 🟡 Advertencia: < 40%
  - 🟢 Normal: ≥ 40%

---

## 📖 Documentación Completa

Para más información, consulta `SISTEMA_AGUA.md`

---

## 🐛 Problemas Comunes

### "No water monitoring config found"
**Solución:** Completa la configuración en `/admin/agua/config`

### "Tuya API error"
**Solución:** Verifica tus credenciales en Tuya IoT Platform

### "No hay datos históricos"
**Solución:** Espera 30 minutos o ejecuta manualmente el cron job

---

## 📞 Soporte

Para problemas:
1. Revisa los logs en Vercel → Functions → Logs
2. Consulta la consola del navegador (F12)
3. Verifica que tus sensores estén activos en Tuya

---

**¡Listo! El sistema está configurado y funcionando.**
