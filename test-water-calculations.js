/**
 * Test de verificación de cálculos de volumen
 * Ejecuta este archivo para verificar que las fórmulas funcionan correctamente
 */

import {
    calculateConicTankVolume,
    calculateCubicTankVolume,
    calculateMaxConicVolume,
    calculateMaxCubicVolume,
    calculateFillPercentage,
    processZoneData
} from '../src/utils/waterCalculations.js'

console.log('🧪 Iniciando tests de cálculo de volumen de agua...\n')

// Test 1: Tanque cónico
console.log('📊 Test 1: Tanque Cónico (Zona Baja)')
console.log('─────────────────────────────────────')
const conicConfig = {
    type: 'conic',
    height: 200,      // 200 cm de altura
    topRadius: 80,    // 80 cm radio superior
    bottomRadius: 60, // 60 cm radio inferior
    tankCount: 3
}

// Sensor reporta 50 cm de profundidad desde arriba
// Significa que hay 150 cm de agua desde el fondo
const conicDepth = 50
const conicResult = processZoneData(conicConfig, conicDepth, 3)

console.log(`Configuración:`)
console.log(`  - Altura total: ${conicConfig.height} cm`)
console.log(`  - Radio superior: ${conicConfig.topRadius} cm`)
console.log(`  - Radio inferior: ${conicConfig.bottomRadius} cm`)
console.log(`  - Cantidad de tanques: ${conicConfig.tankCount}`)
console.log(`\nMedición del sensor:`)
console.log(`  - Profundidad desde sensor: ${conicDepth} cm`)
console.log(`  - Nivel de agua desde fondo: ${conicResult.level_cm} cm`)
console.log(`\nResultados:`)
console.log(`  - Volumen por tanque: ${conicResult.volumePerTank} m³`)
console.log(`  - Volumen total (3 tanques): ${conicResult.totalVolume} m³`)
console.log(`  - Capacidad máxima total: ${conicResult.maxVolume} m³`)
console.log(`  - Porcentaje de llenado: ${conicResult.percentage}%`)

// Test 2: Tanque cúbico
console.log('\n\n📊 Test 2: Tanque Cúbico (Zona Casa)')
console.log('─────────────────────────────────────')
const cubicConfig = {
    type: 'cubic',
    height: 150,  // 150 cm de altura
    length: 100,  // 100 cm de largo
    width: 100,   // 100 cm de ancho
    tankCount: 1
}

// Sensor reporta 30 cm de profundidad desde arriba
// Significa que hay 120 cm de agua desde el fondo
const cubicDepth = 30
const cubicResult = processZoneData(cubicConfig, cubicDepth, 1)

console.log(`Configuración:`)
console.log(`  - Altura total: ${cubicConfig.height} cm`)
console.log(`  - Largo: ${cubicConfig.length} cm`)
console.log(`  - Ancho: ${cubicConfig.width} cm`)
console.log(`  - Cantidad de tanques: ${cubicConfig.tankCount}`)
console.log(`\nMedición del sensor:`)
console.log(`  - Profundidad desde sensor: ${cubicDepth} cm`)
console.log(`  - Nivel de agua desde fondo: ${cubicResult.level_cm} cm`)
console.log(`\nResultados:`)
console.log(`  - Volumen total: ${cubicResult.totalVolume} m³`)
console.log(`  - Capacidad máxima: ${cubicResult.maxVolume} m³`)
console.log(`  - Porcentaje de llenado: ${cubicResult.percentage}%`)

// Test 3: Niveles críticos
console.log('\n\n⚠️  Test 3: Detección de Alertas')
console.log('─────────────────────────────────────')

const scenarios = [
    { name: 'Tanque lleno', depth: 0, expected: '🟢 Normal' },
    { name: 'Medio lleno', depth: 100, expected: '🟢 Normal' },
    { name: 'Bajo (30%)', depth: 140, expected: '🟡 Advertencia' },
    { name: 'Crítico (15%)', depth: 170, expected: '🔴 Crítico' },
    { name: 'Vacío', depth: 200, expected: '🔴 Crítico' }
]

scenarios.forEach(scenario => {
    const result = processZoneData(conicConfig, scenario.depth, 1)
    let alertLevel = '🟢 Normal'
    if (result.percentage < 20) alertLevel = '🔴 Crítico'
    else if (result.percentage < 40) alertLevel = '🟡 Advertencia'

    console.log(`${scenario.name}:`)
    console.log(`  Profundidad sensor: ${scenario.depth} cm`)
    console.log(`  Nivel agua: ${result.level_cm} cm`)
    console.log(`  Porcentaje: ${result.percentage}%`)
    console.log(`  Alerta: ${alertLevel}`)
    console.log()
})

// Test 4: Verificación de fórmulas
console.log('🔬 Test 4: Verificación de Fórmulas Matemáticas')
console.log('─────────────────────────────────────')

// Tanque cónico completamente lleno
const maxConicVol = calculateMaxConicVolume(200, 80, 60)
console.log(`Volumen máximo cónico (manual): ${maxConicVol.toFixed(3)} m³`)

// Tanque cúbico completamente lleno
const maxCubicVol = calculateMaxCubicVolume(150, 100, 100)
console.log(`Volumen máximo cúbico (manual): ${maxCubicVol.toFixed(3)} m³`)

// Verificar que 100% de llenado = volumen máximo
const fullConicResult = processZoneData(conicConfig, 0, 1)
console.log(`\nVerificación de coherencia:`)
console.log(`  Volumen a 100%: ${fullConicResult.volumePerTank} m³`)
console.log(`  Volumen máximo: ${fullConicResult.maxVolume} m³`)
console.log(`  Porcentaje: ${fullConicResult.percentage}%`)
console.log(`  ✓ ${fullConicResult.percentage === 100 ? 'CORRECTO' : 'ERROR'}`)

console.log('\n✅ Tests completados!\n')
