/**
 * Utilidades para cálculo de volúmenes de tanques de agua
 * Soporta tanques cónicos (tronco de cono) y cúbicos (prismáticos)
 */

/**
 * Calcula el volumen de un tronco de cono basado en la profundidad medida
 * 
 * @param {number} depth - Profundidad del agua medida desde el sensor (cm)
 * @param {number} totalHeight - Altura total del tanque (cm)
 * @param {number} topRadius - Radio superior del tanque (cm)
 * @param {number} bottomRadius - Radio inferior del tanque (cm)
 * @returns {number} Volumen en metros cúbicos
 */
export function calculateConicTankVolume(depth, totalHeight, topRadius, bottomRadius) {
    // Validación de parámetros
    if (depth < 0 || totalHeight <= 0 || topRadius <= 0 || bottomRadius <= 0) {
        throw new Error('Parámetros inválidos para cálculo de volumen cónico')
    }

    // Si la profundidad es 0, el tanque está vacío
    if (depth === 0) return 0

    // Calcular la altura del agua (desde el fondo del tanque)
    // El sensor mide desde arriba, por lo que restamos de la altura total
    const waterHeight = totalHeight - depth

    // Si waterHeight es negativo o cero, el tanque está vacío
    if (waterHeight <= 0) return 0

    // Interpolar el radio a la altura del agua
    // El radio varía linealmente con la altura en un tronco de cono
    const radiusAtWaterLevel = bottomRadius + (topRadius - bottomRadius) * (waterHeight / totalHeight)

    // Fórmula del volumen de un tronco de cono:
    // V = (π * h / 3) * (R² + R*r + r²)
    // donde h = altura del agua, R = radio en la parte superior del agua, r = radio en el fondo
    const volume = (Math.PI * waterHeight / 3) * (
        Math.pow(radiusAtWaterLevel, 2) +
        radiusAtWaterLevel * bottomRadius +
        Math.pow(bottomRadius, 2)
    )

    // Convertir de cm³ a m³
    return volume / 1000000
}

/**
 * Calcula el volumen de un tanque cúbico/rectangular
 * 
 * @param {number} depth - Profundidad del agua medida desde el sensor (cm)
 * @param {number} totalHeight - Altura total del tanque (cm)
 * @param {number} length - Largo del tanque (cm)
 * @param {number} width - Ancho del tanque (cm)
 * @returns {number} Volumen en metros cúbicos
 */
export function calculateCubicTankVolume(depth, totalHeight, length, width) {
    // Validación de parámetros
    if (depth < 0 || totalHeight <= 0 || length <= 0 || width <= 0) {
        throw new Error('Parámetros inválidos para cálculo de volumen cúbico')
    }

    // Si la profundidad es 0, el tanque está vacío
    if (depth === 0) return 0

    // Calcular la altura del agua (desde el fondo del tanque)
    const waterHeight = totalHeight - depth

    // Si waterHeight es negativo o cero, el tanque está vacío
    if (waterHeight <= 0) return 0

    // Fórmula simple: V = largo * ancho * altura
    const volume = length * width * waterHeight

    // Convertir de cm³ a m³
    return volume / 1000000
}

/**
 * Calcula el porcentaje de llenado del tanque
 * 
 * @param {number} currentVolume - Volumen actual en m³
 * @param {number} maxVolume - Volumen máximo del tanque en m³
 * @returns {number} Porcentaje de llenado (0-100)
 */
export function calculateFillPercentage(currentVolume, maxVolume) {
    if (maxVolume <= 0) return 0
    return Math.min(100, Math.max(0, (currentVolume / maxVolume) * 100))
}

/**
 * Calcula el volumen máximo de un tanque cónico
 * 
 * @param {number} height - Altura total del tanque (cm)
 * @param {number} topRadius - Radio superior (cm)
 * @param {number} bottomRadius - Radio inferior (cm)
 * @returns {number} Volumen máximo en metros cúbicos
 */
export function calculateMaxConicVolume(height, topRadius, bottomRadius) {
    const volume = (Math.PI * height / 3) * (
        Math.pow(topRadius, 2) +
        topRadius * bottomRadius +
        Math.pow(bottomRadius, 2)
    )
    return volume / 1000000
}

/**
 * Calcula el volumen máximo de un tanque cúbico
 * 
 * @param {number} height - Altura total del tanque (cm)
 * @param {number} length - Largo (cm)
 * @param {number} width - Ancho (cm)
 * @returns {number} Volumen máximo en metros cúbicos
 */
export function calculateMaxCubicVolume(height, length, width) {
    const volume = height * length * width
    return volume / 1000000
}

/**
 * Procesa datos de un sensor para una zona específica
 * 
 * @param {object} tankConfig - Configuración del tanque
 * @param {number} sensorDepth - Profundidad medida por el sensor (cm)
 * @param {number} tankCount - Número de tanques idénticos en la zona
 * @returns {object} Datos procesados
 */
export function processZoneData(tankConfig, sensorDepth, tankCount = 1) {
    let volumePerTank, maxVolumePerTank

    if (tankConfig.type === 'conic') {
        volumePerTank = calculateConicTankVolume(
            sensorDepth,
            tankConfig.height,
            tankConfig.topRadius,
            tankConfig.bottomRadius
        )
        maxVolumePerTank = calculateMaxConicVolume(
            tankConfig.height,
            tankConfig.topRadius,
            tankConfig.bottomRadius
        )
    } else if (tankConfig.type === 'cubic') {
        volumePerTank = calculateCubicTankVolume(
            sensorDepth,
            tankConfig.height,
            tankConfig.length,
            tankConfig.width
        )
        maxVolumePerTank = calculateMaxCubicVolume(
            tankConfig.height,
            tankConfig.length,
            tankConfig.width
        )
    } else {
        throw new Error('Tipo de tanque no soportado')
    }

    const totalVolume = volumePerTank * tankCount
    const totalMaxVolume = maxVolumePerTank * tankCount
    const percentage = calculateFillPercentage(totalVolume, totalMaxVolume)

    return {
        volumePerTank: parseFloat(volumePerTank.toFixed(3)),
        totalVolume: parseFloat(totalVolume.toFixed(3)),
        maxVolume: parseFloat(totalMaxVolume.toFixed(3)),
        percentage: parseFloat(percentage.toFixed(1)),
        level_cm: parseFloat((tankConfig.height - sensorDepth).toFixed(1)),
        tankCount
    }
}

/**
 * Procesa datos de un sensor cuando este reporta porcentaje directo
 * (Para sensores Tuya que reportan liquid_level_percent)
 * 
 * @param {object} tankConfig - Configuración del tanque
 * @param {number} percentageFromSensor - Porcentaje reportado por el sensor (0-100)
 * @param {number} tankCount - Número de tanques idénticos en la zona
 * @returns {object} Datos procesados
 */
export function processZoneDataFromPercent(tankConfig, percentageFromSensor, tankCount = 1) {
    let maxVolumePerTank

    // Calcular volumen máximo según tipo de tanque
    if (tankConfig.type === 'conic') {
        maxVolumePerTank = calculateMaxConicVolume(
            tankConfig.height,
            tankConfig.topRadius,
            tankConfig.bottomRadius
        )
    } else if (tankConfig.type === 'cubic') {
        maxVolumePerTank = calculateMaxCubicVolume(
            tankConfig.height,
            tankConfig.length,
            tankConfig.width
        )
    } else {
        throw new Error('Tipo de tanque no soportado')
    }

    // Calcular volúmenes basados en el porcentaje del sensor
    const volumePerTank = (maxVolumePerTank * percentageFromSensor) / 100
    const totalVolume = volumePerTank * tankCount
    const totalMaxVolume = maxVolumePerTank * tankCount

    // Calcular nivel aproximado en cm basado en el porcentaje
    // (Este es un cálculo aproximado ya que no es lineal en tanques cónicos)
    const level_cm = (tankConfig.height * percentageFromSensor) / 100

    return {
        volumePerTank: parseFloat(volumePerTank.toFixed(3)),
        totalVolume: parseFloat(totalVolume.toFixed(3)),
        maxVolume: parseFloat(totalMaxVolume.toFixed(3)),
        percentage: parseFloat(percentageFromSensor.toFixed(1)),
        level_cm: parseFloat(level_cm.toFixed(1)),
        tankCount
    }
}

/**
 * Cálculo del volumen real de una zona ("Valores Reales"), igual que la hoja
 * de cálculo del cliente.
 *
 * La CAPACIDAD MÁXIMA se calcula con la geometría exacta de cada tanque:
 *  - Cónico       -> tronco de cono (radios inferior/superior y altura).
 *  - Rectangular  -> largo * ancho * altura.
 *
 * El VOLUMEN ACTUAL es proporcional al % de altura del líquido que reporta el
 * sensor (método de la hoja de cálculo): el sensor da la profundidad del agua
 * (p.ej. 1.07 m sobre 1.55 m = 69%) y el volumen = % de altura * volumen máx.
 *   Ej: 69% * 2.00 m³ = 1.38 m³ por tanque -> 4.14 m³ los 3 tanques.
 *
 * Unidades de entrada: diámetros / largo / ancho en cm, altura máxima en m.
 * Devuelve volúmenes en m³.
 *
 * @param {object} zoneCfg - { shape:'cone'|'rect', diameterBottom, diameterTop,
 *                             length, width, maxHeight (m), count }
 * @param {number} levelPercent - % de nivel (altura) reportado por el sensor (0-100)
 */
export function computeRealZoneVolume(zoneCfg, levelPercent) {
    const pct = Math.max(0, Math.min(100, Number(levelPercent) || 0)) / 100
    const H = Number(zoneCfg.maxHeight) || 0   // altura máxima del líquido (m)
    const count = Number(zoneCfg.count) || 1
    const waterHeight = pct * H                 // profundidad actual del líquido (m)

    let maxPerTank = 0

    if (zoneCfg.shape === 'cone') {
        const r = ((Number(zoneCfg.diameterBottom) || 0) / 100) / 2   // radio fondo (m)
        const R = ((Number(zoneCfg.diameterTop) || 0) / 100) / 2      // radio borde superior (m)
        maxPerTank = (Math.PI * H / 3) * (R * R + R * r + r * r)
    } else { // 'rect'
        const L = (Number(zoneCfg.length) || 0) / 100   // largo (m)
        const W = (Number(zoneCfg.width) || 0) / 100    // ancho (m)
        maxPerTank = L * W * H
    }

    // Volumen actual proporcional al % de altura (método de la hoja de cálculo)
    const volPerTank = maxPerTank * pct
    const maxVolume = maxPerTank * count
    const volume = volPerTank * count

    return {
        maxPerTank: parseFloat(maxPerTank.toFixed(3)),
        volPerTank: parseFloat(volPerTank.toFixed(3)),
        maxVolume: parseFloat(maxVolume.toFixed(3)),
        volume: parseFloat(volume.toFixed(3)),
        waterHeight: parseFloat(waterHeight.toFixed(3)),
        levelCm: parseFloat((waterHeight * 100).toFixed(1)),
        percentage: parseFloat((pct * 100).toFixed(1)),
        count
    }
}

/**
 * Volumen máximo (m³) de UN tanque según su geometría, lleno hasta maxHeight.
 * Medidas en cm (diámetros/largo/ancho/diámetro), altura en m.
 *  - cone     -> tronco de cono
 *  - rect     -> prisma rectangular (largo * ancho * alto)
 *  - cylinder -> cilindro (tanque "botella"): π r² h
 */
export function geomMaxPerTank(group) {
    const H = Number(group.maxHeight) || 0
    if (group.shape === 'cone') {
        const r = ((Number(group.diameterBottom) || 0) / 100) / 2
        const R = ((Number(group.diameterTop) || 0) / 100) / 2
        return (Math.PI * H / 3) * (R * R + R * r + r * r)
    }
    if (group.shape === 'cylinder') {
        const r = ((Number(group.diameter) || 0) / 100) / 2
        return Math.PI * r * r * H
    }
    // 'rect'
    const L = (Number(group.length) || 0) / 100
    const W = (Number(group.width) || 0) / 100
    return L * W * H
}

/**
 * Cálculo de una zona con VARIOS grupos de tanques de distinta forma/altura,
 * con el modelo INTERCONECTADO (todos comparten la misma altura de agua).
 *
 * El sensor entrega su % calibrado a la altura de referencia de la zona
 * (la altura del tanque más alto, p.ej. 1.55 m del cónico). De ahí se obtiene
 * la altura real del agua h = %sensor * alturaRef, que es la MISMA en todos
 * los tanques. Cada grupo se llena respecto a SU propia altura máxima:
 *   - Cónicos (máx 1.55 m): a h=1.07 -> 69% de su volumen.
 *   - Botella/cilindro (máx 1.35 m): a h=1.07 -> 79% (llegan a 100% en 1.35 m).
 *
 * Volumen por grupo = (h / alturaMáxGrupo, tope 100%) * volumenMáxGrupo (lineal).
 *
 * @param {object} zoneCfg - { name, groups: [ {shape, ...medidas, maxHeight, count} ] }
 * @param {number} sensorPercent - % del sensor (0-100), relativo a la altura de referencia
 */
export function computeZoneGrouped(zoneCfg, sensorPercent) {
    const groups = Array.isArray(zoneCfg?.groups) ? zoneCfg.groups : []
    const pct = Math.max(0, Math.min(100, Number(sensorPercent) || 0)) / 100
    const refHeight = groups.reduce((m, g) => Math.max(m, Number(g.maxHeight) || 0), 0)
    const waterHeight = pct * refHeight   // altura real del agua (m), igual en todos

    let maxVolume = 0
    let volume = 0
    let totalCount = 0

    const groupResults = groups.map(g => {
        const gH = Number(g.maxHeight) || 0
        const count = Number(g.count) || 0
        const maxPerTank = geomMaxPerTank(g)
        const fill = gH > 0 ? Math.max(0, Math.min(1, waterHeight / gH)) : 0
        const volPerTank = maxPerTank * fill
        const gMax = maxPerTank * count
        const gVol = volPerTank * count
        maxVolume += gMax
        volume += gVol
        totalCount += count
        return {
            ...g,
            maxPerTank: parseFloat(maxPerTank.toFixed(3)),
            volPerTank: parseFloat(volPerTank.toFixed(3)),
            groupMax: parseFloat(gMax.toFixed(3)),
            groupVol: parseFloat(gVol.toFixed(3)),
            fillPercent: parseFloat((fill * 100).toFixed(1)),
        }
    })

    return {
        maxVolume: parseFloat(maxVolume.toFixed(3)),
        volume: parseFloat(volume.toFixed(3)),
        percentage: maxVolume > 0 ? parseFloat(((volume / maxVolume) * 100).toFixed(1)) : 0,
        waterHeight: parseFloat(waterHeight.toFixed(3)),
        refHeight: parseFloat(refHeight.toFixed(3)),
        sensorPercent: parseFloat((pct * 100).toFixed(1)),
        totalCount,
        groups: groupResults,
    }
}
