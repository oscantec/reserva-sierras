# 🎉 Sistema de Monitoreo de Agua - Implementación Completa

## ✅ Resumen de Implementación

Se ha implementado exitosamente un **sistema completo de monitoreo de agua** que integra sensores ultrasónicos Tuya para monitorear tres zonas de tanques con diferentes geometrías.

---

## 📁 Archivos Creados

### Backend API (6 archivos)

1. **`/api/water-tuya.js`**
   - Conexión con Tuya Cloud API
   - Extrae datos de `liquid_depth` de sensores ultrasónicos
   - Maneja autenticación HMAC-SHA256

2. **`/api/water-data.js`**
   - Endpoint para guardar/obtener mediciones históricas
   - Integración con Supabase
   - Filtros por zona y período de tiempo

3. **`/api/cron-water-monitoring.js`**
   - Cron job que ejecuta cada 30 minutos
   - Consulta sensores automáticamente
   - Guarda mediciones en base de datos

### Frontend Admin (2 componentes)

4. **`/src/pages/admin/AdminWaterConfig.jsx`**
   - Panel de configuración de tanques
   - Formulario para credenciales Tuya
   - Configuración de dimensiones por zona
   - Umbrales de alertas personalizables

5. **`/src/pages/admin/AdminWaterStats.jsx`**
   - Dashboard con vista global
   - Cards por zona con alertas visuales
   - Tabla de histórico
   - Detección de fugas
   - Actualización manual y automática

### Utilidades (1 archivo)

6. **`/src/utils/waterCalculations.js`**
   - Cálculos de volumen para tanques cónicos
   - Cálculos de volumen para tanques cúbicos
   - Interpolación de radios
   - Conversión de unidades (cm³ → m³)
   - Procesamiento de datos por zona

### Base de Datos (1 script)

7. **`/water_measurements_setup.sql`**
   - Tabla `water_measurements`
   - Índices para optimización
   - Políticas de seguridad (RLS)

### Configuración (3 archivos)

8. **`vercel.json`** (actualizado)
   - Cron job configurado: cada 30 minutos

9. **`.env.example`** (actualizado)
   - Variable `CRON_SECRET` añadida
   - Variables opcionales para Tuya

10. **`/src/App.jsx`** (actualizado)
    - Rutas para `/admin/agua/config`
    - Rutas para `/admin/agua/stats`
    - Imports de componentes

11. **`/src/pages/admin/AdminLayout.jsx`** (actualizado)
    - Menú lateral con sección "Agua"
    - Submenú: Estadísticas y Configuración
    - Navegación móvil actualizada

### Documentación (3 archivos)

12. **`SISTEMA_AGUA.md`**
    - Documentación técnica completa
    - Arquitectura del sistema
    - Fórmulas matemáticas
    - Troubleshooting

13. **`INSTALACION_AGUA.md`**
    - Guía rápida de instalación
    - Pasos numerados
    - Verificación de instalación

14. **`EJEMPLOS_CONFIGURACION_TANQUES.md`**
    - Ejemplos prácticos
    - Cómo medir tanques
    - Tabla de referencia rápida

### Testing (1 archivo)

15. **`test-water-calculations.js`**
    - Tests de verificación de cálculos
    - Escenarios de prueba
    - Validación de fórmulas

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                   SENSORES TUYA                         │
│  • Zona Baja: EPT-Ultrasonic Z (liquid_depth)          │
│  • Zona Alta: EPT-Ultrasonic Z (liquid_depth)          │
│  • Zona Casa: EPT-Ultrasonic Z (liquid_depth)          │
└──────────────────┬──────────────────────────────────────┘
                   │ Lee datos cada 30 min
                   ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND API (Vercel)                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ /api/cron-water-monitoring (Cron: */30 * * * *) │   │
│  │  → Consulta Tuya Cloud API                       │   │
│  │  → Calcula volúmenes (waterCalculations.js)     │   │
│  │  → Guarda en Supabase                           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ /api/water-tuya (GET)                           │   │
│  │  → Obtiene liquid_depth de sensores             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ /api/water-data (GET/POST)                      │   │
│  │  → Histórico de mediciones                      │   │
│  └─────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              BASE DE DATOS (Supabase)                   │
│  Tabla: water_measurements                              │
│  • timestamp (TIMESTAMPTZ)                              │
│  • zone (TEXT): zonaBaja, zonaAlta, zonaCasa           │
│  • level_cm (DECIMAL)                                   │
│  • volume_m3 (DECIMAL)                                  │
│  • percentage (DECIMAL)                                 │
│  • tank_count (INTEGER)                                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│            PANEL ADMINISTRATIVO (React)                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │ /admin/agua/config                               │  │
│  │  • Configurar credenciales Tuya                  │  │
│  │  • Definir dimensiones de tanques               │  │
│  │  • Establecer umbrales de alertas               │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ /admin/agua/stats                                │  │
│  │  • Vista global (m³ totales)                     │  │
│  │  • Cards por zona con alertas                    │  │
│  │  • Histórico filtrable                           │  │
│  │  • Detección de fugas                            │  │
│  │  • Actualización manual/automática               │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔢 Cálculos Implementados

### Tanque Cónico (Tronco de Cono)

**1. Interpolación de Radio:**
```javascript
R_actual = r_inferior + (r_superior - r_inferior) × (h_agua / h_total)
```

**2. Volumen del Tronco de Cono:**
```javascript
V = (π × h / 3) × (R² + R×r + r²)
```

**3. Conversión:**
```javascript
V_m³ = V_cm³ / 1,000,000
```

### Tanque Cúbico

**Volumen:**
```javascript
V = largo × ancho × altura_agua
V_m³ = V_cm³ / 1,000,000
```

### Porcentaje de Llenado

```javascript
% = (V_actual / V_máximo) × 100
```

---

## 🎛️ Configuración de Tres Zonas

### Zona Baja (Suministro Principal)
- **Tipo:** Cónico (tronco de cono)
- **Cantidad:** 3 tanques idénticos
- **Cálculo:** Volumen individual × 3

### Zona Alta (Reserva)
- **Tipo:** Cónico (tronco de cono)
- **Cantidad:** 2 tanques idénticos
- **Cálculo:** Volumen individual × 2

### Zona Casa
- **Tipo:** Cúbico (prisma rectangular)
- **Cantidad:** 1 tanque
- **Cálculo:** Volumen simple

---

## 🚨 Sistema de Alertas

| Nivel | Condición | Color | Badge |
|-------|-----------|-------|-------|
| Normal | ≥ 40% | 🟢 Verde | - |
| Advertencia | < 40% y ≥ 20% | 🟡 Amarillo | BAJO |
| Crítico | < 20% | 🔴 Rojo | CRÍTICO |

**Umbrales configurables** en el panel de administración.

---

## ⏰ Automatización

### Cron Job (Vercel)
```json
{
  "path": "/api/cron-water-monitoring",
  "schedule": "*/30 * * * *"
}
```
- Ejecuta cada **30 minutos**
- Protegido con `CRON_SECRET`
- Guarda automáticamente en Supabase

### Actualización Manual
- Botón "Actualizar Ahora" en dashboard
- Útil para diagnóstico inmediato

---

## 🔐 Seguridad

1. **Row Level Security (RLS)** en Supabase
2. **Cron Secret** para proteger endpoint
3. **Políticas de lectura pública / escritura controlada**
4. **Credenciales Tuya** almacenadas en localStorage

---

## 🌐 URLs de Acceso

### Configuración
```
https://tu-dominio.com/admin/agua/config
```

### Dashboard de Estadísticas
```
https://tu-dominio.com/admin/agua/stats
```

### API Endpoints
```
GET  /api/water-tuya?clientId=...&clientSecret=...&deviceIds=...
GET  /api/water-data?zone=zonaBaja&days=7
POST /api/water-data
GET  /api/cron-water-monitoring?secret=CRON_SECRET
```

---

## 📊 Funcionalidades del Dashboard

### Vista Global
- Suma total de m³ disponibles
- Actualización en tiempo real
- Timestamp de última medición

### Por Zona
- Barra de progreso visual
- Volumen actual vs máximo
- Nivel en centímetros
- Número de tanques
- Alertas coloreadas

### Histórico
- Tabla con todas las mediciones
- Filtros por zona y período
- Exportable (desde Supabase)

### Detección de Fugas
- Análisis de patrones de consumo
- Descensos abruptos en horario nocturno
- Mensaje informativo en UI

---

## 🛠️ Próximos Pasos para el Usuario

### 1. Ejecutar SQL en Supabase
```bash
# Ejecutar: water_measurements_setup.sql
```

### 2. Configurar Variables de Entorno
```bash
# En .env y en Vercel:
CRON_SECRET=genera-secreto-aleatorio
```

### 3. Obtener Credenciales Tuya
- Ir a https://iot.tuya.com/
- Obtener Access ID y Secret
- Anotar Device IDs de sensores

### 4. Configurar en Panel Admin
- Ir a `/admin/agua/config`
- Completar credenciales Tuya
- Ingresar dimensiones de tanques
- Guardar configuración

### 5. Verificar Funcionamiento
- Ir a `/admin/agua/stats`
- Hacer clic en "Actualizar Ahora"
- Verificar que aparezcan datos

### 6. Desplegar a Producción
```bash
git add .
git commit -m "feat: Sistema de monitoreo de agua"
git push
```

---

## 📚 Documentación de Referencia

| Archivo | Descripción |
|---------|-------------|
| `INSTALACION_AGUA.md` | Guía rápida paso a paso |
| `SISTEMA_AGUA.md` | Documentación técnica completa |
| `EJEMPLOS_CONFIGURACION_TANQUES.md` | Ejemplos prácticos |
| `test-water-calculations.js` | Tests de verificación |

---

## 🎓 Tuya IoT Platform

### Región del API
Por defecto: `https://openapi.tuyaus.com` (USA)

**Otras regiones:**
- Europa: `https://openapi.tuyaeu.com`
- China: `https://openapi.tuyacn.com`
- India: `https://openapi.tuyain.com`

Configurar en `/api/water-tuya.js` línea 8.

---

## ✨ Características Destacadas

✅ **Cálculos geométricos precisos** con interpolación de radios  
✅ **Soporte para múltiples tanques** idénticos por zona  
✅ **Actualización automática** cada 30 minutos  
✅ **Alertas visuales** con tres niveles  
✅ **Histórico completo** con filtros avanzados  
✅ **Detección de fugas** mediante análisis de patrones  
✅ **Configuración flexible** desde panel admin  
✅ **Totalmente responsive** (desktop y móvil)  
✅ **Integración nativa** con Tuya Cloud  
✅ **Almacenamiento persistente** en Supabase  

---

## 🏆 Sistema Implementado Con Éxito

El sistema está **listo para usar** siguiendo los pasos de instalación en `INSTALACION_AGUA.md`.

**Desarrollado para:** Reserva de las Sierras  
**Fecha:** Enero 2026  
**Tecnologías:** React, Vercel, Supabase, Tuya IoT Platform  

---

**¡Sistema completo y funcional! 🎉**
