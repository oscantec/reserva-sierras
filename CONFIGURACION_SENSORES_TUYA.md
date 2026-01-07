# 📟 Configuración de Sensores Tuya - Valores Reales

## 🔑 Credenciales API Tuya (Ya Configuradas)

```
Access ID:  aw59ugmntjfevwdkx8py
Secret:     43fd349daf50449d8c2b061e25118c8e
Endpoint:   https://openapi.tuyaus.com
```

---

## 📊 Sensores Instalados

### 1️⃣ Tanque Abajo (Zona Baja - Suministro Principal)

**Device ID:** `ebd09863004e52db0ehcrq`  
**Modelo:** EPT- Ultrasonic sensor 3m  

| Parámetro | Valor | Significado |
|-----------|-------|-------------|
| `installation_height` | **1780 mm** (178 cm) | Distancia fija sensor→fondo |
| `liquid_depth_max` | **230 mm** (23 cm) | Altura máxima del agua |
| `liquid_depth` | 151 mm (dinámico) | Distancia actual sensor→agua |
| **`liquid_level_percent`** | **97%** (dinámico) ✅ | **Porcentaje calculado** |
| `liquid_state` | upper_alarm | Estado actual |

**Configuración en Panel Admin:**
- Tipo: Cónico
- Cantidad: 3 tanques
- Altura: **23 cm** (liquid_depth_max)
- Radios: Ajustar según medición real del tanque

---

### 2️⃣ Tanque Arriba (Zona Alta - Reserva)

**Device ID:** `ebc4697fd7293917feksfa`  
**Modelo:** EPT- Ultrasonic sensor Z  

| Parámetro | Valor | Significado |
|-----------|-------|-------------|
| `installation_height` | **1750 mm** (175 cm) | Distancia fija sensor→fondo |
| `liquid_depth_max` | **300 mm** (30 cm) | Altura máxima del agua |
| `liquid_depth` | 117 mm (dinámico) | Distancia actual sensor→agua |
| **`liquid_level_percent`** | **81%** (dinámico) ✅ | **Porcentaje calculado** |
| `liquid_state` | normal | Estado actual |

**Configuración en Panel Admin:**
- Tipo: Cónico
- Cantidad: 2 tanques
- Altura: **30 cm** (liquid_depth_max)
- Radios: Ajustar según medición real del tanque

---

### 3️⃣ Tanque Casa (Zona Casa)

**Device ID:** `eb04c0fcf71d11da80m8rm`  
**Modelo:** EPT- Ultrasonic sensor Z  

| Parámetro | Valor | Significado |
|-----------|-------|-------------|
| `installation_height` | **1600 mm** (160 cm) | Distancia fija sensor→fondo |
| `liquid_depth_max` | **250 mm** (25 cm) | Altura máxima del agua |
| `liquid_depth` | 106 mm (dinámico) | Distancia actual sensor→agua |
| **`liquid_level_percent`** | **78%** (dinámico) ✅ | **Porcentaje calculado** |
| `liquid_state` | normal | Estado actual |

**Configuración en Panel Admin:**
- Tipo: Cúbico
- Cantidad: 1 tanque
- Altura: **25 cm** (liquid_depth_max)
- Largo/Ancho: Ajustar según medición real del tanque

---

## 💡 Cómo Funciona el Sistema

### Valores Fijos (Configurados en Tuya):
1. **installation_height** - Altura del sensor desde el fondo
2. **liquid_depth_max** - Altura máxima que puede alcanzar el agua

### Valores Dinámicos (Reportados por el sensor):
1. **liquid_depth** - Distancia actual del sensor a la superficie del agua
2. **liquid_level_percent** - Porcentaje calculado automáticamente por Tuya

### Fórmula de Tuya:
```
% = ((liquid_depth_max - (liquid_depth - (installation_height - liquid_depth_max))) / liquid_depth_max) × 100

Simplificado:
Altura agua actual = liquid_depth_max - liquid_depth + (installation_height - liquid_depth_max)
% = (Altura agua actual / liquid_depth_max) × 100
```

---

## 🔧 Sistema Implementado

### Backend Lee:
✅ **`liquid_level_percent`** (DP ID: 22)  
- Porcentaje ya calculado por Tuya
- Valor entre 0-100%

### Cálculo de Volumen:
```javascript
Volumen máximo según geometría del tanque (configurado en panel admin)
Volumen actual = Volumen máximo × (liquid_level_percent / 100)
```

### Ejemplo Tanque Casa (78%):
```
Si configuras:
- Altura: 25 cm
- Largo: 50 cm
- Ancho: 50 cm

Volumen máximo = 0.0625 m³ (62.5 litros)
Volumen actual = 0.0625 × 0.78 = 0.04875 m³ (48.75 litros)
```

---

## 📐 Ajustar Dimensiones Reales

Para obtener cálculos precisos, **mide tu tanque real** y ajusta en `/admin/agua/config`:

### Para Tanques Cónicos (Zona Baja y Alta):
1. Mide el **diámetro superior** → divide entre 2 = radio superior
2. Mide el **diámetro inferior** → divide entre 2 = radio inferior
3. La altura ya está configurada (`liquid_depth_max`)

### Para Tanque Cúbico (Zona Casa):
1. Mide el **largo** interior del tanque
2. Mide el **ancho** interior del tanque
3. La altura ya está configurada (`liquid_depth_max`)

---

## 🚀 Estado Actual

✅ Credenciales precargadas en el sistema  
✅ Device IDs configurados  
✅ Alturas de agua (liquid_depth_max) establecidas  
⚠️ **Pendiente:** Ajustar radios/dimensiones según medición física real  

---

## 📋 Próximo Paso

1. Ve a `/admin/agua/config`
2. Verifica que las credenciales están correctas
3. **Mide tus tanques físicamente**
4. Ajusta los radios (cónicos) o largo/ancho (cúbico)
5. Guarda la configuración
6. Ve a `/admin/agua/stats` para ver los datos

---

**¡El sistema está listo para funcionar!** 🎉
