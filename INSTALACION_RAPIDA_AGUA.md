# ✅ Checklist Rápido - Sistema Preconfigurado

## 🎯 Tu Sistema Ya Tiene Configurados:

✅ **Credenciales Tuya API**
- Access ID: `aw59ugmntjfevwdkx8py`
- Access Secret: `43fd349daf50449d8c2b061e25118c8e`

✅ **Device IDs de los 3 sensores**
- Tanque Abajo (Zona Baja): `ebd09863004e52db0ehcrq`
- Tanque Arriba (Zona Alta): `ebc4697fd7293917feksfa`
- Tanque Casa: `eb04c0fcf71d11da80m8rm`

✅ **Alturas máximas de agua** (liquid_depth_max)
- Tanque Abajo: 23 cm (230 mm)
- Tanque Arriba: 30 cm (300 mm)
- Tanque Casa: 25 cm (250 mm)

---

## 📋 Pasos de Instalación (Simplificados)

### 1️⃣ Ejecutar SQL en Supabase (5 min)

```sql
-- Ve a Supabase → SQL Editor
-- Copia y pega el contenido de: water_measurements_setup.sql
-- Haz click en RUN
```

✅ Esto crea la tabla `water_measurements`

---

### 2️⃣ Añadir Variable de Entorno (2 min)

**En tu `.env` local:**
```bash
# Ya tienes estas (verifica):
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key

# AÑADE ESTA NUEVA:
CRON_SECRET=TuSecretoAleatorioAqui123456
```

**En Vercel:**
1. Ve a tu proyecto → Settings → Environment Variables
2. Añade: `CRON_SECRET` = `TuSecretoAleatorioAqui123456`
3. Aplica a: Production, Preview, Development

---

### 3️⃣ Ajustar Dimensiones de Tanques (10 min)

**⚠️ IMPORTANTE:** Los radios y largo/ancho son **valores de ejemplo**. Debes medirlos.

1. Ve a `/admin/agua/config`
2. Las credenciales y Device IDs **ya están precargados** ✅
3. Ajusta según tus tanques reales:

**Zona Baja (3 tanques cónicos):**
- ✅ Altura: 23 cm (ya configurado)
- ⚠️ Mide y ajusta:
  - Radio superior: ? cm
  - Radio inferior: ? cm

**Zona Alta (2 tanques cónicos):**
- ✅ Altura: 30 cm (ya configurado)
- ⚠️ Mide y ajusta:
  - Radio superior: ? cm
  - Radio inferior: ? cm

**Zona Casa (1 tanque cúbico):**
- ✅ Altura: 25 cm (ya configurado)
- ⚠️ Mide y ajusta:
  - Largo: ? cm
  - Ancho: ? cm

4. Haz click en **Guardar Configuración**

---

### 4️⃣ Desplegar (5 min)

```bash
git add .
git commit -m "feat: Sistema de monitoreo de agua configurado"
git push
```

Vercel desplegará automáticamente con el cron job.

---

### 5️⃣ Verificar (2 min)

1. Ve a `/admin/agua/stats`
2. Haz click en **"Actualizar Ahora"**
3. Deberías ver:
   - Tanque Abajo: ~97%
   - Tanque Arriba: ~81%
   - Tanque Casa: ~78%

Si ves estos valores, **¡funciona! 🎉**

---

## 🔍 Cómo Medir tus Tanques

### Para Tanques Cónicos (Baja y Alta):

```
    ┌───────────────┐  ← Radio superior (mide diámetro ÷ 2)
    │               │
    │      ▓▓▓      │  ← Agua
    │     ▓▓▓▓▓     │
    │    ▓▓▓▓▓▓▓    │
    └──────┬────────┘  ← Radio inferior (mide diámetro ÷ 2)
```

1. Mide el diámetro en la **parte superior** del tanque
2. Divide entre 2 = **Radio superior**
3. Mide el diámetro en la **parte inferior** del tanque
4. Divide entre 2 = **Radio inferior**

### Para Tanque Cúbico (Casa):

```
    ┌──────────────┐
    │  ▓▓▓▓▓▓▓▓▓▓  │  ← Largo (mide con cinta)
    │  ▓▓▓▓▓▓▓▓▓▓  │
    │  ▓▓▓▓▓▓▓▓▓▓  │  ← Ancho (mide con cinta)
    └──────────────┘
```

1. Mide el **largo interior** del tanque
2. Mide el **ancho interior** del tanque

---

## 📊 Ejemplo de Cálculo

Si tu Tanque Casa mide:
- Largo: 60 cm
- Ancho: 50 cm  
- Altura: 25 cm (ya configurado)

```
Volumen máximo = 60 × 50 × 25 / 1,000,000 = 0.075 m³ (75 litros)
Volumen actual (78%) = 0.075 × 0.78 = 0.0585 m³ (58.5 litros)
```

---

## 🐛 Solución de Problemas

### No aparecen datos en el dashboard

1. Verifica en Supabase que la tabla `water_measurements` existe
2. Revisa que `CRON_SECRET` esté en Vercel
3. Haz click en "Actualizar Ahora" manualmente

### Los porcentajes no coinciden

- El sistema usa `liquid_level_percent` del sensor
- Tuya ya hace el cálculo, nosotros solo usamos ese valor
- Si ves 97%, 81%, 78% en la app de Tuya, deberías ver lo mismo aquí

### Error "Tuya API"

- Las credenciales ya están configuradas
- Si no funcionan, verifica en https://iot.tuya.com/ que el proyecto esté activo

---

## 📚 Documentos de Referencia

- **`CONFIGURACION_SENSORES_TUYA.md`** - Info detallada de tus sensores
- **`SISTEMA_AGUA.md`** - Documentación técnica completa  
- **`INSTALACION_AGUA.md`** - Guía de instalación detallada

---

## ⏱️ Tiempo Total: ~25 minutos

- SQL: 5 min
- Variables entorno: 2 min
- Medir tanques: 10 min
- Configurar y desplegar: 8 min

---

**¡Todo listo para monitorear tu agua! 💧**
