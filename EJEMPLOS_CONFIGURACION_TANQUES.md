# 📐 Ejemplos de Configuración de Tanques

Este documento contiene ejemplos prácticos de configuración para diferentes tipos de tanques.

---

## 🔵 Tanques Cónicos (Tronco de Cono)

### Ejemplo 1: Tanque Típico de 1000 Litros

**Dimensiones aproximadas:**
- Altura total: **120 cm**
- Radio superior: **55 cm**
- Radio inferior: **45 cm**
- Capacidad aproximada: **1.0 m³** (1000 litros)

**Configuración en el panel:**
```
Altura Total: 120
Radio Superior: 55
Radio Inferior: 45
Cantidad de Tanques: 1
```

### Ejemplo 2: Tanque Grande de 2000 Litros

**Dimensiones aproximadas:**
- Altura total: **200 cm**
- Radio superior: **80 cm**
- Radio inferior: **60 cm**
- Capacidad aproximada: **2.7 m³** (2700 litros)

**Configuración en el panel:**
```
Altura Total: 200
Radio Superior: 80
Radio Inferior: 60
Cantidad de Tanques: 1
```

### Ejemplo 3: Zona Baja (3 tanques idénticos)

Si tienes 3 tanques de 1500 litros cada uno:

**Dimensiones de cada tanque:**
- Altura: **150 cm**
- Radio superior: **70 cm**
- Radio inferior: **55 cm**

**Configuración en el panel:**
```
Altura Total: 150
Radio Superior: 70
Radio Inferior: 55
Cantidad de Tanques: 3
```

**Capacidad total de la zona:** ~4.5 m³ (4500 litros)

---

## 🟦 Tanques Cúbicos/Rectangulares

### Ejemplo 1: Tanque Estándar de 1000 Litros

**Dimensiones:**
- Altura: **100 cm**
- Largo: **100 cm**
- Ancho: **100 cm**
- Capacidad: **1.0 m³** (1000 litros exactos)

**Configuración en el panel:**
```
Altura Total: 100
Largo: 100
Ancho: 100
Cantidad de Tanques: 1
```

### Ejemplo 2: Tanque Rectangular de 2000 Litros

**Dimensiones:**
- Altura: **120 cm**
- Largo: **150 cm**
- Ancho: **110 cm**
- Capacidad: **1.98 m³** (1980 litros)

**Configuración en el panel:**
```
Altura Total: 120
Largo: 150
Ancho: 110
Cantidad de Tanques: 1
```

---

## 📏 Cómo Medir tus Tanques

### Para Tanques Cónicos:

1. **Altura Total:**
   - Mide desde el fondo hasta el borde superior con una cinta métrica

2. **Radio Superior:**
   - Mide el diámetro en la parte superior
   - Divide entre 2 para obtener el radio
   - Ejemplo: Si el diámetro es 160 cm, el radio es 80 cm

3. **Radio Inferior:**
   - Mide el diámetro en la parte inferior
   - Divide entre 2 para obtener el radio
   - Ejemplo: Si el diámetro es 120 cm, el radio es 60 cm

### Para Tanques Cúbicos:

1. **Altura Total:**
   - Mide la altura interior del tanque

2. **Largo:**
   - Mide el largo interior del tanque

3. **Ancho:**
   - Mide el ancho interior del tanque

**⚠️ IMPORTANTE:** Siempre mide las dimensiones **interiores** del tanque, no exteriores.

---

## 🔧 Instalación del Sensor

### Posición Correcta:

```
        ┌─────────────┐
        │   SENSOR    │ ← Instalado en la parte superior
        │(ultrasónico)│
        └──────┬──────┘
               │
               │  ← Distancia medida (liquid_depth)
               ▼
        ═══════════════ ← Superficie del agua
        
        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ ← Agua
        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
        ───────────────  ← Fondo del tanque
```

**Puntos clave:**
- El sensor debe estar en la **parte superior** del tanque
- Mide la distancia **desde el sensor hasta la superficie del agua**
- El sistema calcula automáticamente el nivel de agua desde el fondo

---

## 🧮 Cálculos de Ejemplo

### Tanque Cónico - 200 cm de altura

**Sensor reporta:** 50 cm
**Significa:**
- Distancia del sensor al agua: 50 cm
- Nivel de agua desde el fondo: 200 - 50 = **150 cm**

**Si el tanque tiene:**
- Radio superior: 80 cm
- Radio inferior: 60 cm

**El radio a 150 cm de altura será:**
- Radio interpolado = 60 + (80 - 60) × (150 / 200) = 60 + 15 = **75 cm**

**Volumen:**
- Usando la fórmula del tronco de cono
- V ≈ **2.36 m³**

### Tanque Cúbico - 150 cm de altura

**Sensor reporta:** 30 cm
**Significa:**
- Nivel de agua desde el fondo: 150 - 30 = **120 cm**

**Si el tanque mide:**
- Largo: 100 cm
- Ancho: 100 cm

**Volumen:**
- V = 100 × 100 × 120 / 1,000,000
- V = **1.2 m³**

---

## 💡 Tips de Configuración

1. **Redondea las medidas:**
   - Si mides 79.5 cm, puedes usar 80 cm
   - La precisión al centímetro es suficiente

2. **Verifica tus cálculos:**
   - Usa el archivo `test-water-calculations.js` para verificar
   - Compara con la capacidad nominal del tanque

3. **Múltiples tanques:**
   - Solo configura las dimensiones de **un tanque**
   - El sistema multiplicará automáticamente por la cantidad

4. **Sensor fuera de rango:**
   - Si el sensor reporta 0 cm: tanque lleno
   - Si reporta la altura total: tanque vacío

---

## 🎯 Configuración de Alertas

### Umbral Crítico (20%)

Para un tanque de 2.7 m³:
- 20% = 0.54 m³ (540 litros)
- Alerta roja cuando queden menos de 540 litros

### Umbral de Advertencia (40%)

Para un tanque de 2.7 m³:
- 40% = 1.08 m³ (1080 litros)
- Alerta amarilla cuando queden menos de 1080 litros

**Recomendación:** Mantén los valores por defecto (20% y 40%) a menos que tengas necesidades específicas.

---

## 📊 Tabla de Referencia Rápida

| Capacidad | Tanque Cúbico (100x100xcm) | Tanque Cónico Típico |
|-----------|---------------------------|---------------------|
| 500 L     | Altura: 50 cm             | H:100, R1:40, R2:30 |
| 1000 L    | Altura: 100 cm            | H:120, R1:55, R2:45 |
| 1500 L    | Altura: 150 cm            | H:150, R1:70, R2:55 |
| 2000 L    | L:150, A:110, H:120       | H:200, R1:80, R2:60 |

---

¿Necesitas ayuda para calcular las dimensiones de tus tanques? Usa las fórmulas en `SISTEMA_AGUA.md` o contacta soporte.
