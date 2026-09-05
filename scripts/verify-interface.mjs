// Run against Vite: PLAYWRIGHT_MODULE=/path/to/playwright node scripts/verify-interface.mjs
// All data requests are intercepted; no reservations, credentials or writes reach production.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFile, mkdir } from 'node:fs/promises'
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const base = process.env.UI_BASE_URL || 'http://127.0.0.1:3000'
assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Only local previews are supported')
const output = process.env.UI_SCREENSHOTS || '/tmp/reserva-interface-review'
await mkdir(output, { recursive: true })
const config = JSON.parse(await readFile(new URL('../src/utils/config_data.json', import.meta.url)))
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const errors = []
const results = []

async function createContext(viewport, admin = false) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' })
    await context.route('https://www.youtube.com/**', route => route.fulfill({ contentType: 'text/html', body: '<html></html>' }))
    await context.route('**/api/**', route => {
        const path = new URL(route.request().url()).pathname
        if (path === '/api/config') return route.fulfill({ json: config })
        if (path === '/api/ical-proxy') return route.fulfill({ contentType: 'text/plain', body: 'BEGIN:VCALENDAR\r\nEND:VCALENDAR' })
        if (path === '/api/backend-sheets' && route.request().postDataJSON()?.sheetName === '1. BD') {
            return route.fulfill({ json: { success: true, data: [{
                'No Reserva': 'RTEST', 'Codigo Unico': '123', Nombre: 'Prueba de interfaz',
                Huespedes: '2', 'Fecha Inicio': '2026-10-10', 'Fecha Salida': '2026-10-12', Plataforma: 'Directa'
            }] } })
        }
        return route.fulfill({ json: { success: true, data: [], sensors: [], measurements: [] } })
    })
    await context.route('**/*.supabase.co/**', route => route.fulfill({ json: [] }))
    if (admin) {
        // Mock the context module only inside this browser, never application source/auth.
        await context.route('**/src/contexts/AuthContext.jsx*', route => route.fulfill({
            contentType: 'application/javascript',
            body: `export function AuthProvider({children}) { return children; }
                   export function useAuth() { return {isAuthenticated:true,isLoading:false,user:{email:'ui-test@example.invalid'},logout:async()=>{}}; }`
        }))
    }
    return context
}

async function visit(page, path, width) {
    await page.goto(base + path, { waitUntil: 'domcontentloaded' })
    await page.locator('h1').first().waitFor()
    await page.evaluate(() => document.fonts.ready)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)
    assert(!overflow, `Horizontal overflow: ${path} at ${width}px`)
    results.push(`${width}px ${path}: rendered, no page overflow`)
}

try {
    for (const width of [1440, 390, 320]) {
        const context = await createContext({ width, height: 960 })
        const page = await context.newPage()
        page.on('pageerror', error => errors.push(error.message))
        for (const path of ['/', '/reservas', '/registro', '/galeria', '/guia', '/admin/login']) {
            await visit(page, path, width)
            if (width !== 320 && ['/', '/reservas', '/admin/login'].includes(path)) {
                await page.screenshot({ path: `${output}/${path.replaceAll('/', '-') || 'home'}-${width}.png`, animations: 'disabled' })
            }
        }
        await page.getByLabel('Correo electrónico', { exact: true }).fill('test@example.invalid')
        await page.getByLabel('Contraseña', { exact: true }).fill('sample-only')
        await page.getByRole('button', { name: 'Mostrar contraseña' }).click()
        assert.equal(await page.locator('#admin-password').getAttribute('type'), 'text')
        await page.goto(base + '/admin')
        await page.waitForURL('**/admin/login')
        if (width < 768) {
            await page.goto(base)
            const trigger = page.getByRole('button', { name: 'Abrir menú' })
            await trigger.click()
            const drawer = page.getByRole('dialog')
            assert(await drawer.isVisible())
            await page.keyboard.press('Escape')
            assert(!(await drawer.isVisible()))
            assert(await trigger.evaluate(el => el === document.activeElement))
            await trigger.click()
            await drawer.getByRole('link', { name: 'Registro', exact: false }).click()
            await page.waitForURL('**/registro')
            assert(!(await drawer.isVisible()))
        }
        await page.goto(base + '/reservas')
        const next = page.getByRole('button', { name: 'Mes siguiente' })
        await next.click()
        await page.getByRole('button', { name: /^10 de / }).click()
        await page.getByRole('button', { name: /^12 de / }).click()
        assert(await page.getByRole('button', { name: /Continuar/ }).first().isEnabled())
        results.push(`${width}px: login fields, auth redirect, calendar selection${width < 768 ? ', mobile menu and focus return' : ''}`)
        await page.goto(base + '/registro')
        await page.getByLabel('Número de Reserva').fill('RTEST')
        await page.getByLabel('Código Único').fill('123')
        await page.getByRole('button', { name: /^Verificar/ }).click()
        await page.getByRole('button', { name: /^Verificado/ }).waitFor()
        assert(await page.getByLabel('Número de Reserva').isDisabled())
        await page.goto(base + '/galeria')
        await page.locator('.gallery-tile').first().waitFor()
        await page.locator('main button').first().click()
        await page.waitForFunction(() => !document.querySelector('.gallery-tile')?.className.includes('aspect-square'))
        const totalImages = await page.locator('.gallery-tile').count()
        await page.getByRole('button', { name: /Internas/ }).click()
        await page.waitForFunction(total => document.querySelectorAll('.gallery-tile').length < total, totalImages)
        const tile = page.locator('.gallery-tile').first()
        await tile.focus()
        await page.keyboard.press('Enter')
        await page.getByRole('button', { name: 'Cerrar imagen' }).click()
        assert.equal(await page.getByRole('button', { name: 'Cerrar imagen' }).count(), 0)
        results.push(`${width}px: registration verification with fixture, gallery filtering and keyboard enlargement`)
        await context.close()
    }

    for (const width of [1440, 390]) {
        const context = await createContext({ width, height: 960 }, true)
        const page = await context.newPage()
        page.on('pageerror', error => errors.push(error.message))
        for (const path of ['/admin', '/admin/calendario', '/admin/base-datos', '/admin/conexiones', '/admin/tarifas', '/admin/contenido', '/admin/seguridad', '/admin/agua/stats', '/admin/agua/config']) {
            await page.goto(base + path, { waitUntil: 'domcontentloaded' })
            await page.locator('.admin-topbar').waitFor()
            assert(await page.locator('.admin-workspace').isVisible())
            assert.equal(await page.locator('.admin-mobile-nav a[href="/"][aria-current]').count(), 0)
            assert(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)), `Admin overflow: ${path}`)
        }
        await page.screenshot({ path: `${output}/admin-${width}.png` })
        if (width < 1024) {
            await page.getByRole('button', { name: 'Menú', exact: true }).click()
            const drawer = page.getByRole('dialog')
            assert.equal(await drawer.getByRole('link').count(), 9)
            assert(await drawer.getByRole('button', { name: 'Cerrar Sesión' }).isVisible())
            await drawer.getByRole('link', { name: 'Tarifas' }).click()
            await page.waitForURL('**/admin/tarifas')
            assert(!(await drawer.isVisible()))
        }
        results.push(`${width}px: 9 admin routes and navigation checked with mocked session/data`)
        await context.close()
    }
    assert.deepEqual(errors, [], 'Unexpected browser runtime errors')
    console.log(JSON.stringify({ passed: results, screenshots: output }, null, 2))
} finally {
    await browser.close()
}
