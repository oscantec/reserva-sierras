# Sistema de Monitoreo de Agua

Este documento describe cómo configurar y usar el sistema de monitoreo de agua para sensores ultrasónicos Tuya.

## 📋 Descripción General

El sistema integra sensores ultrasónicos Tuya (Modelo: EPT- Ultrasonic sensor Z) para monitorear los niveles de agua en tres zonas:

- **Zona Baja (Suministro Principal)**: 3 tanques cónicos idénticos
- **Zona Alta (Reserva)**: 2 tanques cónicos idénticos
- **Zona Casa**: 1 tanque cúbico

### Características Principales

✅ **Conexión API Cloud de Tuya** para extraer datos de `liquid_depth`  
✅ **Cálculos geométricos precisos** (tronco de cono e interpolación de radios)  
✅ **Actualización automática** cada 30 minutos vía Cron Job  
✅ **Almacenamiento histórico** en Supabase  
✅ **Dashboard administrativo** con alertas y gráficos  
✅ **Detección de fugas** mediante análisis de patrones de consumo  

---

## 🛠️ Instalación y Configuración

### Paso 1: Configurar Supabase

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Navega a **SQL Editor**
3. Ejecuta el script `water_measurements_setup.sql`:

```bash
# El archivo está en la raíz del proyecto
/water_measurements_setup.sql
```

Esto creará la tabla `water_measurements` con los índices necesarios.

### Paso 2: Configurar Variables de Entorno

1. Copia `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Completa las variables necesarias:
```bash
# Supabase (obligatorio)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui

# Cron Secret (obligatorio para producción)
CRON_SECRET=genera-un-secreto-aleatorio-seguro

# Tuya API (opcional - se puede configurar desde el panel admin)
# TUYA_CLIENT_ID=tu-client-id
# TUYA_CLIENT_SECRET=tu-client-secret
```

3. **En Vercel**, añade estas mismas variables en:
   - Settings → Environment Variables

### Paso 3: Obtener Credenciales de Tuya

1. Ve a [Tuya IoT Platform](https://iot.tuya.com/)
2. Crea un proyecto Cloud o usa uno existente
3. Obtén tus credenciales:
   - **Access ID** (Client ID)
   - **Access Secret** (Client Secret)
4. Añade tus dispositivos al proyecto y obtén los **Device IDs**

### Paso 4: Configurar Dimensiones de Tanques

1. Accede al panel administrativo:
   ```
   https://tu-dominio.com/admin/agua/config
   ```

2. Completa los siguientes datos:

   **Credenciales API Tuya:**
   - Access ID (Client ID)
   - Access Secret (Client Secret)
   - Device IDs para cada zona

   **Dimensiones de Tanques:**
   
   Para **tanques cónicos** (Zona Baja y Zona Alta):
   - Cantidad de tanques
   - Altura total (cm)
   - Radio superior (cm)
   - Radio inferior (cm)

   Para **tanque cúbico** (Zona Casa):
   - Cantidad de tanques
   - Altura total (cm)
   - Largo (cm)
   - Ancho (cm)

   **Umbrales de Alertas:**
   - Umbral crítico (por defecto: 20%)
   - Umbral de advertencia (por defecto: 40%)

3. Haz clic en **Guardar Configuración**

---

## 📊 Uso del Dashboard

### Acceso al Dashboard

Navega a:
```
https://tu-dominio.com/admin/agua/stats
```

### Funcionalidades del Dashboard

1. **Vista Global**
   - Muestra el total de metros cúbicos disponibles en todo el complejo
   - Se actualiza automáticamente cada 30 minutos

2. **Estado por Zona**
   - Tarjetas individuales para cada zona
   - Barra de progreso visual
   - Datos detallados:
     - Volumen total (m³)
     - Capacidad máxima (m³)
     - Nivel de agua (cm)
     - Número de tanques
   - Alertas visuales:
     - 🔴 **CRÍTICO**: Nivel < 20%
     - 🟡 **BAJO**: Nivel < 40%
     - 🟢 **NORMAL**: Nivel ≥ 40%

3. **Histórico de Consumo**
   - Tabla con todas las mediciones
   - Filtros por:
     - Zona (todas, baja, alta, casa)
     - Período (24h, 7 días, 30 días, 90 días)
   - Detección de fugas:
     - Analiza descensos abruptos en horas nocturnas (11 PM - 6 AM)

4. **Actualización Manual**
   - Botón "Actualizar Ahora" para forzar lectura de sensores
   - Útil para diagnóstico inmediato

---

## 🔧 Arquitectura Técnica

### Componentes del Sistema

```
┌─────────────────────────────────────────────────┐
│         Sensores Tuya (3 dispositivos)          │
│     EPT- Ultrasonic sensor Z (liquid_depth)     │
└──────────────────┬──────────────────────────────┘
                   │
                   │ Tuya Cloud API
                   ▼
┌─────────────────────────────────────────────────┐
│           API Endpoint: /api/water-tuya         │
│      Extrae liquid_depth de cada sensor         │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│     Cálculos Geométricos (waterCalculations)    │
│  • Tronco de cono con interpolación de radios   │
│  • Prisma rectangular                           │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│        Almacenamiento: Supabase                 │
│     Tabla: water_measurements                   │
│  Campos: zone, level_cm, volume_m3, percentage  │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│     Dashboard Administrativo (React)            │
│  • Vista global                                 │
│  • Estado por zona                              │
│  • Gráficos históricos                          │
│  • Alertas automáticas                          │
└─────────────────────────────────────────────────┘
```

### Endpoints API

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/water-tuya` | GET | Consulta sensores Tuya y retorna liquid_depth |
| `/api/water-data` | GET | Obtiene histórico de mediciones |
| `/api/water-data` | POST | Guarda nueva medición |
| `/api/cron-water-monitoring` | GET | Cron job automático (cada 30 min) |

### Fórmulas de Cálculo

**Volumen de Tronco de Cono:**
```
V = (π × h / 3) × (R² + R×r + r²)

Donde:
- h = altura del agua (desde el fondo)
- R = radio a la altura del agua (interpolado)
- r = radio del fondo

Radio interpolado:
R = r_inferior + (r_superior - r_inferior) × (h / h_total)
```

**Volumen Cúbico:**
```
V = largo × ancho × altura_agua
```

**Conversión:**
```
Resultado en cm³ → dividir por 1,000,000 para obtener m³
```

---

## 🚨 Alertas y Notificaciones

### Niveles de Alerta

| Nivel | Condición | Color | Acción Recomendada |
|-------|-----------|-------|-------------------|
| Normal | ≥ 40% | 🟢 Verde | Ninguna |
| Advertencia | < 40% y ≥ 20% | 🟡 Amarillo | Revisar consumo |
| Crítico | < 20% | 🔴 Rojo | Rellenar urgente |

### Detección de Fugas

El sistema analiza patrones de consumo para identificar posibles fugas:

- **Descensos abruptos** en horario nocturno (11 PM - 6 AM)
- **Consumo constante** sin períodos de inactividad
- **Patrones anómalos** respecto al histórico

---

## 🔄 Cron Job Automático

El sistema ejecuta automáticamente cada **30 minutos**:

1. Se conecta a Tuya Cloud API
2. Lee el valor de `liquid_depth` de los 3 sensores
3. Calcula volúmenes según geometría de cada tanque
4. Guarda las mediciones en Supabase
5. Actualiza el dashboard en tiempo real

### Verificar Cron en Vercel

1. Ve a tu proyecto en Vercel
2. Navega a **Deployments** → **Functions**
3. Busca `/api/cron-water-monitoring`
4. Revisa los logs de ejecución

### Ejecutar Manualmente

Para testing, puedes invocar el cron manualmente:

```bash
curl "https://tu-dominio.com/api/cron-water-monitoring?secret=TU_CRON_SECRET"
```

---

## 📦 Archivos Creados

### Backend (API)
- `/api/water-tuya.js` - Conexión con Tuya Cloud
- `/api/water-data.js` - Operaciones con base de datos
- `/api/cron-water-monitoring.js` - Actualización automática

### Frontend (Admin)
- `/src/pages/admin/AdminWaterConfig.jsx` - Configuración
- `/src/pages/admin/AdminWaterStats.jsx` - Dashboard

### Utilidades
- `/src/utils/waterCalculations.js` - Cálculos geométricos

### Base de Datos
- `/water_measurements_setup.sql` - Script SQL para Supabase

### Configuración
- `vercel.json` - Actualizado con cron job
- `.env.example` - Variables de entorno

---

## 🐛 Solución de Problemas

### Error: "Configuración no disponible"

**Solución:** Asegúrate de haber guardado la configuración en `/admin/agua/config`

### Error: "Tuya API error"

**Posibles causas:**
- Credenciales incorrectas (Client ID / Secret)
- Device ID inválido
- Región de API incorrecta (verifica en `/api/water-tuya.js`)

**Solución:** 
1. Verifica credenciales en [Tuya IoT Platform](https://iot.tuya.com/)
2. Confirma que los dispositivos estén activos
3. Revisa la región del endpoint (`TUYA_API_REGION`)

### Error: "No hay datos históricos"

**Posibles causas:**
- Cron job no se ha ejecutado
- Tabla no creada en Supabase

**Solución:**
1. Ejecuta `water_measurements_setup.sql` en Supabase
2. Ejecuta manualmente el cron job para generar datos
3. Espera 30 minutos para la primera ejecución automática

### Datos inconsistentes

**Solución:**
1. Revisa las dimensiones configuradas en `/admin/agua/config`
2. Verifica que los sensores estén correctamente instalados
3. Comprueba que el sensor mide desde arriba (profundidad)

---

## 📝 Mantenimiento

### Limpieza de Datos Antiguos

Para eliminar mediciones con más de 90 días:

```sql
DELETE FROM water_measurements 
WHERE timestamp < NOW() - INTERVAL '90 days';
```

### Backup de Datos

Exporta los datos históricos periódicamente desde Supabase:

```bash
# En Supabase Dashboard
Table Editor → water_measurements → Export to CSV
```

---

## 🔐 Seguridad

- ✅ Row Level Security (RLS) habilitado en Supabase
- ✅ Cron job protegido con `CRON_SECRET`
- ✅ Credenciales Tuya almacenadas en localStorage (considera migrar a Supabase para mayor seguridad)
- ⚠️ **Recomendación:** Implementa autenticación para el panel admin en producción

---

## 📞 Soporte

Para problemas técnicos o preguntas:
- Revisa los logs en Vercel (Functions → Logs)
- Consulta los logs del navegador (Console)
- Verifica el estado de Tuya IoT Platform

---

**Última actualización:** Enero 2026  
**Versión del sistema:** 1.0.0
