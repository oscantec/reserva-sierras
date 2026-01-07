# ☑️ Checklist de Instalación - Sistema de Monitoreo de Agua

Usa este checklist para asegurarte de completar todos los pasos necesarios.

---

## 📋 Pre-requisitos

- [ ] Acceso a Supabase (proyecto activo)
- [ ] Acceso a Vercel (proyecto desplegado)
- [ ] Cuenta en Tuya IoT Platform
- [ ] 3 sensores ultrasónicos Tuya instalados y funcionando

---

## 🗄️ Paso 1: Base de Datos (Supabase)

- [ ] 1.1. Ingresar a [Supabase](https://app.supabase.com)
- [ ] 1.2. Seleccionar el proyecto
- [ ] 1.3. Ir a **SQL Editor**
- [ ] 1.4. Abrir el archivo `water_measurements_setup.sql`
- [ ] 1.5. Copiar y pegar el contenido en el editor
- [ ] 1.6. Hacer clic en **Run**
- [ ] 1.7. Verificar que muestre "Success"
- [ ] 1.8. Ir a **Table Editor** y confirmar que existe la tabla `water_measurements`

**✅ Base de datos configurada**

---

## 🔐 Paso 2: Variables de Entorno

### Local (.env)

- [ ] 2.1. Copiar `.env.example` a `.env`
- [ ] 2.2. Verificar `VITE_SUPABASE_URL` esté configurado
- [ ] 2.3. Verificar `VITE_SUPABASE_ANON_KEY` esté configurado
- [ ] 2.4. Generar un secreto aleatorio para `CRON_SECRET`
  ```bash
  # Ejemplo: usar openssl
  openssl rand -hex 32
  ```
- [ ] 2.5. Pegar el secreto en `CRON_SECRET=...`

### Vercel (Producción)

- [ ] 2.6. Ir a proyecto en [Vercel](https://vercel.com)
- [ ] 2.7. Navegar a **Settings** → **Environment Variables**
- [ ] 2.8. Añadir variable `CRON_SECRET` con el mismo valor del `.env` local
- [ ] 2.9. Aplicar a **Production, Preview, Development**

**✅ Variables de entorno configuradas**

---

## 🌐 Paso 3: Credenciales Tuya

### Obtener Credenciales

- [ ] 3.1. Ir a [Tuya IoT Platform](https://iot.tuya.com/)
- [ ] 3.2. Iniciar sesión o crear cuenta
- [ ] 3.3. Crear un nuevo proyecto Cloud o usar uno existente
- [ ] 3.4. Ir a **Cloud** → **Development** → seleccionar tu proyecto
- [ ] 3.5. Copiar **Access ID** (Client ID)
- [ ] 3.6. Copiar **Access Secret** (Client Secret)
- [ ] 3.7. Guardar en un lugar seguro (los usarás en el siguiente paso)

### Vincular Dispositivos

- [ ] 3.8. En Tuya IoT Platform, ir a **Devices**
- [ ] 3.9. Hacer clic en **Link Tuya App Account**
- [ ] 3.10. Vincular tu cuenta de la app Tuya/Smart Life
- [ ] 3.11. Confirmar que aparecen tus 3 sensores
- [ ] 3.12. Anotar los **Device IDs** de cada sensor:
  - Sensor Zona Baja: `____________________`
  - Sensor Zona Alta: `____________________`
  - Sensor Zona Casa: `____________________`

**✅ Credenciales Tuya obtenidas**

---

## 🎛️ Paso 4: Configuración en Panel Admin

### Acceder al Panel

- [ ] 4.1. Ir a `https://tu-dominio.com/admin/agua/config`
- [ ] 4.2. Iniciar sesión si es necesario

### Ingresar Credenciales Tuya

- [ ] 4.3. Pegar **Access ID** en el campo correspondiente
- [ ] 4.4. Pegar **Access Secret** en el campo correspondiente
- [ ] 4.5. Pegar **Device ID Zona Baja**
- [ ] 4.6. Pegar **Device ID Zona Alta**
- [ ] 4.7. Pegar **Device ID Zona Casa**

### Configurar Dimensiones - Zona Baja

- [ ] 4.8. Cantidad de Tanques: `____` (ejemplo: 3)
- [ ] 4.9. Altura Total (cm): `____`
- [ ] 4.10. Radio Superior (cm): `____`
- [ ] 4.11. Radio Inferior (cm): `____`

### Configurar Dimensiones - Zona Alta

- [ ] 4.12. Cantidad de Tanques: `____` (ejemplo: 2)
- [ ] 4.13. Altura Total (cm): `____`
- [ ] 4.14. Radio Superior (cm): `____`
- [ ] 4.15. Radio Inferior (cm): `____`

### Configurar Dimensiones - Zona Casa

- [ ] 4.16. Cantidad de Tanques: `____` (ejemplo: 1)
- [ ] 4.17. Altura Total (cm): `____`
- [ ] 4.18. Largo (cm): `____`
- [ ] 4.19. Ancho (cm): `____`

### Configurar Alertas

- [ ] 4.20. Umbral Crítico (%): `____` (recomendado: 20)
- [ ] 4.21. Umbral de Advertencia (%): `____` (recomendado: 40)

### Guardar

- [ ] 4.22. Hacer clic en **Guardar Configuración**
- [ ] 4.23. Esperar mensaje de confirmación

**✅ Configuración del panel completada**

---

## 🚀 Paso 5: Desplegar a Producción

- [ ] 5.1. Abrir terminal en el proyecto
- [ ] 5.2. Verificar que estás en la rama correcta
  ```bash
  git status
  ```
- [ ] 5.3. Añadir todos los archivos nuevos
  ```bash
  git add .
  ```
- [ ] 5.4. Hacer commit
  ```bash
  git commit -m "feat: Sistema de monitoreo de agua con sensores Tuya"
  ```
- [ ] 5.5. Push a GitHub
  ```bash
  git push
  ```
- [ ] 5.6. Esperar que Vercel despliegue automáticamente
- [ ] 5.7. Verificar en Vercel que el deployment fue exitoso

**✅ Código desplegado en producción**

---

## ✅ Paso 6: Verificación Final

### Verificar Tabla en Supabase

- [ ] 6.1. Ir a Supabase → **Table Editor** → `water_measurements`
- [ ] 6.2. Confirmar que la tabla está vacía (aún no hay datos)

### Verificar Cron Job en Vercel

- [ ] 6.3. Ir a Vercel → tu proyecto → **Settings** → **Cron Jobs**
- [ ] 6.4. Confirmar que aparece `/api/cron-water-monitoring`
- [ ] 6.5. Confirmar que el schedule es `*/30 * * * *`

### Probar Actualización Manual

- [ ] 6.6. Ir a `https://tu-dominio.com/admin/agua/stats`
- [ ] 6.7. Hacer clic en **Actualizar Ahora**
- [ ] 6.8. Esperar unos segundos
- [ ] 6.9. Verificar que aparezcan datos en las tarjetas
- [ ] 6.10. Confirmar que se muestra la suma total de m³

### Verificar Datos Guardados

- [ ] 6.11. Volver a Supabase → **Table Editor** → `water_measurements`
- [ ] 6.12. Hacer clic en **Refresh**
- [ ] 6.13. Confirmar que ahora hay registros (1 por cada zona)

### Esperar Cron Automático

- [ ] 6.14. Esperar 30 minutos
- [ ] 6.15. Refrescar el dashboard
- [ ] 6.16. Confirmar que aparecen nuevos registros en Supabase
- [ ] 6.17. Confirmar que el histórico se está llenando

**✅ Sistema verificado y funcionando**

---

## 🧪 Paso 7: Pruebas Opcionales

### Test de Cálculos (Local)

- [ ] 7.1. Ejecutar en terminal:
  ```bash
  node test-water-calculations.js
  ```
- [ ] 7.2. Verificar que todos los tests pasen
- [ ] 7.3. Revisar los valores calculados

### Test Manual del API

- [ ] 7.4. Probar endpoint de Tuya (sustituye valores):
  ```bash
  curl "https://tu-dominio.com/api/water-tuya?clientId=TU_CLIENT_ID&clientSecret=TU_SECRET&deviceIds=DEVICE1,DEVICE2,DEVICE3"
  ```
- [ ] 7.5. Verificar respuesta JSON exitosa

- [ ] 7.6. Probar endpoint de histórico:
  ```bash
  curl "https://tu-dominio.com/api/water-data?days=7"
  ```
- [ ] 7.7. Verificar respuesta con datos

**✅ Tests pasados**

---

## 📱 Paso 8: Verificación en Móvil

- [ ] 8.1. Abrir en navegador móvil: `https://tu-dominio.com/admin/agua/stats`
- [ ] 8.2. Iniciar sesión
- [ ] 8.3. Verificar que el menú inferior muestra "Agua"
- [ ] 8.4. Navegar al dashboard
- [ ] 8.5. Confirmar que todo se ve correctamente
- [ ] 8.6. Probar botón "Actualizar Ahora"
- [ ] 8.7. Verificar filtros de histórico

**✅ Interfaz móvil verificada**

---

## 🎉 ¡Instalación Completa!

Si has marcado todos los checkboxes anteriores, **el sistema está instalado y funcionando correctamente**.

---

## 📞 En Caso de Problemas

### Si el cron no se ejecuta:

1. Verificar `CRON_SECRET` en Vercel
2. Revisar logs: Vercel → **Functions** → **Logs**
3. Ejecutar manualmente para debug:
   ```bash
   curl "https://tu-dominio.com/api/cron-water-monitoring?secret=TU_CRON_SECRET"
   ```

### Si no aparecen datos:

1. Verificar credenciales Tuya en `/admin/agua/config`
2. Confirmar que Device IDs son correctos
3. Verificar que sensores están online en Tuya Smart Life app
4. Revisar consola del navegador (F12)

### Si aparece "Tuya API error":

1. Verificar región del API en `/api/water-tuya.js` línea 8
2. Confirmar Access ID y Secret en Tuya IoT Platform
3. Verificar que dispositivos estén vinculados al proyecto Cloud

---

## 📚 Documentos de Apoyo

- **`INSTALACION_AGUA.md`** - Guía rápida de instalación
- **`SISTEMA_AGUA.md`** - Documentación técnica completa
- **`EJEMPLOS_CONFIGURACION_TANQUES.md`** - Ejemplos de configuración
- **`RESUMEN_IMPLEMENTACION_AGUA.md`** - Resumen de todo el sistema

---

**Fecha de instalación:** ________________  
**Instalado por:** ________________  
**Notas:** 
```










```

---

✅ **Checklist completado. Sistema operativo.**
