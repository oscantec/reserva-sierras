# 🎓 Explicación Paso a Paso - Configuración del Sistema de Agua

Voy a explicarte **exactamente** qué hacer y por qué.

---

## 📚 ¿Qué es Supabase?

Supabase es una **base de datos en la nube** (como Google Drive pero para datos). 

Tu sistema de agua necesita **guardar el historial** de mediciones (fecha, hora, nivel, volumen, etc.) para que puedas ver gráficos y detectar fugas.

---

## 🔧 Paso 1: Ejecutar SQL en Supabase

### ¿Qué es SQL?
Es el "lenguaje" que le dice a la base de datos qué hacer. El archivo `water_measurements_setup.sql` tiene instrucciones para crear una tabla.

### ¿Qué hace exactamente?
Crea una tabla llamada `water_measurements` que guardará:
- Fecha/hora de cada medición
- Qué zona (Baja, Alta, Casa)
- Nivel de agua (cm)
- Volumen (m³)
- Porcentaje
- Cantidad de tanques

### 🎯 Cómo hacerlo:

**1. Abre tu proyecto de Supabase:**
```
Ve a: https://supabase.com/dashboard
→ Selecciona tu proyecto
```

**2. Ve al SQL Editor:**
```
Menu lateral izquierdo → SQL Editor
O busca el ícono de terminal </> 
```

**3. Abre el archivo `water_measurements_setup.sql`:**
```
Está en la raíz de tu proyecto local:
/Users/oscar/Library/CloudStorage/OneDrive-Trafing/100. Web Reserva 100/water_measurements_setup.sql
```

**4. Copia TODA la SQL:**
- Abre el archivo con cualquier editor de texto
- Selecciona TODO (Cmd+A)
- Copia (Cmd+C)

**5. Pega en el SQL Editor de Supabase:**
- Pega (Cmd+V) en el editor
- Haz clic en el botón **RUN** (esquina superior derecha)

**6. Verifica que funcionó:**
```
Menu lateral → Table Editor
→ Deberías ver una nueva tabla llamada "water_measurements"
```

**✅ ¡Listo!** La tabla ya existe y está lista para recibir datos.

---

## 🔐 Paso 2: Añadir CRON_SECRET

### ¿Qué es CRON_SECRET?
Es una **contraseña secreta** que protege el endpoint automático que actualiza los datos cada 30 minutos.

Sin esto, cualquiera podría llamar tu API y gastar recursos.

### ¿Dónde se usa?
El cron job (`/api/cron-water-monitoring.js`) verifica que la petición incluya el secreto correcto antes de ejecutarse.

### 🎯 Cómo hacerlo:

**PARTE A: Local (.env)**

**1. Abre tu archivo `.env`:**
```
Está en la raíz del proyecto:
/Users/oscar/Library/CloudStorage/OneDrive-Trafing/100. Web Reserva 100/.env
```

**2. Añade esta línea:**
```bash
CRON_SECRET=MiSecretoSuperSeguro123456
```
*📝 Puedes usar cualquier texto aleatorio, pero hazlo complejo*

**3. Guarda el archivo** (Cmd+S)

---

**PARTE B: Vercel (Producción)**

**1. Ve a tu proyecto en Vercel:**
```
https://vercel.com/dashboard
→ Selecciona tu proyecto
```

**2. Ve a Settings:**
```
Menu superior → Settings
```

**3. Ve a Environment Variables:**
```
Menu lateral → Environment Variables
```

**4. Añade la variable:**
- **Key:** `CRON_SECRET`
- **Value:** `MiSecretoSuperSeguro123456` (el mismo que pusiste en .env)
- **Environments:** 
  - ✅ Production
  - ✅ Preview  
  - ✅ Development

**5. Haz clic en Save**

**✅ ¡Listo!** El cron job ahora está protegido.

---

## 📏 Paso 3: Medir Tanques y Configurar

### ¿Por qué medir?
Los sensores solo dan **porcentaje**, pero para calcular el volumen necesitamos saber las **dimensiones físicas reales** de tus tanques.

### 🎯 Qué medir:

**Para Tanques CÓNICOS (Zona Baja y Zona Alta):**

```
        ┌─────────────┐  ← MIDE AQUÍ: Diámetro superior
        │             │
        │    AGUA     │
        │             │
        └─────┬───────┘  ← MIDE AQUÍ: Diámetro inferior
```

1. Mide el **diámetro** (ancho) en la parte superior
2. Divide entre 2 = **Radio superior**
3. Mide el **diámetro** en la parte inferior
4. Divide entre 2 = **Radio inferior**

**Ejemplo:**
- Diámetro superior: 80 cm → Radio superior: 40 cm
- Diámetro inferior: 60 cm → Radio inferior: 30 cm

---

**Para Tanque CÚBICO (Zona Casa):**

```
    ┌──────────────┐
    │              │  ← MIDE: Largo interior
    │     AGUA     │
    │              │  ← MIDE: Ancho interior
    └──────────────┘
```

1. Mide el **largo** interior (lado más largo)
2. Mide el **ancho** interior (lado más corto)

---

### 🎯 Cómo configurar:

**1. Ve al panel de configuración:**
```
https://tu-dominio.com/admin/agua/config
```

**2. Verás que ya están precargados:**
- ✅ Credenciales Tuya (Access ID, Secret)
- ✅ Device IDs de los 3 sensores
- ✅ Alturas de agua (23cm, 30cm, 25cm)

**3. Solo ajusta:**
- Radios de tanques cónicos
- Largo/Ancho del tanque cúbico
- Cantidad de tanques (si tienes más de los configurados)

**4. Haz clic en "Guardar Configuración"**

**✅ ¡Listo!** El sistema ya puede calcular volúmenes correctos.

---

## 🚀 Paso 4: Desplegar a Vercel

### ¿Qué es desplegar?
Es "publicar" tus cambios en internet para que funcionen en tu dominio real (no solo en tu computadora local).

### 🎯 Cómo hacerlo:

**1. Abre la terminal en tu proyecto:**
```bash
cd "/Users/oscar/Library/CloudStorage/OneDrive-Trafing/100. Web Reserva 100"
```

**2. Verifica qué archivos cambiaron:**
```bash
git status
```
*Deberías ver todos los archivos nuevos del sistema de agua en rojo*

**3. Añade todos los archivos:**
```bash
git add .
```

**4. Haz un commit (guarda los cambios):**
```bash
git commit -m "feat: Sistema de monitoreo de agua con sensores Tuya"
```

**5. Sube los cambios a GitHub:**
```bash
git push
```

**6. Espera...**
- Vercel detectará automáticamente el push
- Empezará a construir y desplegar
- Recibirás un email cuando termine (1-2 minutos)

**7. Verifica en Vercel:**
```
https://vercel.com/dashboard
→ Tu proyecto
→ Deployments
→ El más reciente debería decir "Ready"
```

**✅ ¡Listo!** El sistema ya está en producción.

---

## ✅ Paso 5: Verificar que Funciona

**1. Ve al dashboard:**
```
https://tu-dominio.com/admin/agua/stats
```

**2. Haz clic en "Actualizar Ahora"**

**3. Deberías ver:**
- Tanque Abajo: ~97% (o lo que marque ahora)
- Tanque Arriba: ~81%
- Tanque Casa: ~78%

**4. Verifica en Supabase:**
```
Table Editor → water_measurements
→ Deberías ver 3 filas nuevas (una por cada tanque)
```

**5. Espera 30 minutos y refresca:**
- El cron job debería añadir 3 filas más automáticamente
- El histórico empezará a llenarse

---

## 🎉 ¡Sistema Funcionando!

Ahora tienes:
- ✅ Datos guardándose automáticamente cada 30 minutos
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Histórico de consumo
- ✅ Alertas automáticas cuando el agua esté baja

---

## 🐛 Si Algo Sale Mal

**"No veo la tabla en Supabase"**
→ Ve a SQL Editor y ejecuta de nuevo el script

**"Error: CRON_SECRET"**
→ Verifica que añadiste la variable en Vercel

**"No aparecen datos"**
→ Haz clic en "Actualizar Ahora" manualmente
→ Revisa la consola del navegador (F12) por errores

**"El cron no se ejecuta"**
→ Espera 30 minutos desde el deploy
→ Verifica en Vercel → Functions → Logs

---

**¿Necesitas ayuda con algún paso específico? Pregúntame.**
