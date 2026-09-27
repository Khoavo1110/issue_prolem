import { chromium, expect } from '@playwright/test'
import { preview } from 'vite'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const artifactDir = resolve('artifacts/mobile-qa')
mkdirSync(artifactDir, { recursive: true })
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(existsSync)
const report = { startedAt: new Date().toISOString(), browser: executablePath || 'Playwright Chromium', cases: [] }

async function checkOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }))
  expect(dimensions.document, `${label}: document must not overflow horizontally`).toBeLessThanOrEqual(dimensions.viewport + 1)
  expect(dimensions.body, `${label}: body must not overflow horizontally`).toBeLessThanOrEqual(dimensions.viewport + 1)
  return dimensions
}

async function capture(page, name, fullPage = false) {
  await page.screenshot({ path: resolve(artifactDir, `${name}.png`), fullPage, animations: 'disabled' })
}

async function touchSwipe(page, locator, direction = 'left') {
  await locator.scrollIntoViewIfNeeded()
  const box = await locator.boundingBox()
  expect(box).not.toBeNull()
  const session = await page.context().newCDPSession(page)
  const start = direction === 'left' ? box.x + box.width * 0.8 : box.x + box.width * 0.2
  const end = direction === 'left' ? box.x + box.width * 0.2 : box.x + box.width * 0.8
  const y = box.y + Math.min(box.height / 2, 160)
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: start, y }] })
  for (let step = 1; step <= 8; step++) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start + (end - start) * step / 8, y }] })
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await session.detach()
}

async function inspectAudio(page) {
  return page.evaluate(() => (window.__birthdayAudioContexts || []).map(context => ({ state: context.state, currentTime: context.currentTime })))
}

async function runCase(browser, baseURL, viewport, reducedMotion = false) {
  const label = `${viewport.width}x${viewport.height}${reducedMotion ? '-reduced-motion' : ''}`
  const result = { label, viewport, reducedMotion, checks: [], errors: [] }
  report.cases.push(result)
  const context = await browser.newContext({ viewport, isMobile: viewport.width < 768, hasTouch: viewport.width < 768, reducedMotion: reducedMotion ? 'reduce' : 'no-preference' })
  await context.addInitScript(() => {
    window.__birthdayAudioContexts = []
    for (const property of ['AudioContext', 'webkitAudioContext']) {
      const Original = window[property]
      if (!Original) continue
      window[property] = class extends Original {
        constructor(...args) {
          super(...args)
          window.__birthdayAudioContexts.push(this)
        }
      }
    }
  })
  const page = await context.newPage()
  page.on('pageerror', error => result.errors.push(`pageerror: ${error.message}`))
  page.on('console', message => { if (message.type() === 'error') result.errors.push(`console: ${message.text()}`) })
  try {
    await page.goto(baseURL, { waitUntil: 'networkidle' })
    result.initialDimensions = await checkOverflow(page, `${label} intro`)
    const introButtonBox = await page.getByTestId('open-gift').boundingBox()
    expect(introButtonBox.y).toBeGreaterThanOrEqual(0)
    expect(introButtonBox.y + introButtonBox.height).toBeLessThanOrEqual(viewport.height)
    result.introButtonBox = introButtonBox
    if (reducedMotion) expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)
    await capture(page, `${label}-intro`)
    result.checks.push('intro visible and fits viewport')
    await runInteractions(page, result, label, reducedMotion)
    expect(result.errors, `${label}: no browser errors`).toEqual([])
    result.status = 'passed'
  } catch (error) {
    result.status = 'failed'
    result.failure = error.stack || String(error)
    await capture(page, `${label}-failure`).catch(() => {})
  } finally {
    await context.close()
    console.log(`${result.status.toUpperCase()} ${label}: ${result.checks.join(', ')}${result.failure ? `\n${result.failure}` : ''}`)
  }
}

async function runInteractions(page, result, label, reducedMotion) {
  const detailed = result.viewport.width === 390 && !reducedMotion
  await expect(page.getByTestId('open-gift')).toBeVisible()
  await page.getByTestId('open-gift').click()
  await expect(page.locator('.intro')).toHaveCount(0)
  await expect(page.locator('#main-title')).toBeFocused()
  expect(await page.evaluate(() => window.scrollY), 'Opening the gift keeps the hero at the top').toBeLessThan(2)
  expect(new URL(page.url()).hash, 'Opening the gift must not navigate to an unintended hash').toBe('')
  await expect(page.locator('.site-shell')).not.toHaveAttribute('inert')
  result.checks.push('gift opens at top and focuses title')
  await capture(page, `${label}-hero`)
  await page.getByTestId('hero-cake').click()
  await expect(page.locator('.hero-caption')).toContainText('Một chiếc bánh')
  result.checks.push('cake responds with a surprise greeting')

  const music = page.getByTestId('music-toggle')
  await expect(music).toHaveAttribute('aria-pressed', 'true')
  await expect.poll(async () => (await inspectAudio(page)).some(audio => audio.state === 'running')).toBe(true)
  await music.click()
  await expect(music).toHaveAttribute('aria-pressed', 'false')
  await music.click()
  await expect(music).toHaveAttribute('aria-pressed', 'true')
  result.audio = await inspectAudio(page)
  result.checks.push('music starts from gesture and toggles off/on')

  const menu = page.getByRole('button', { name: 'Mở mục lục', exact: true })
  await menu.click()
  await expect(page.getByRole('navigation', { name: 'Các phần của món quà' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  result.checks.push('chapter menu opens and Escape closes it')

  const star = page.getByRole('button', { name: 'Ngôi sao Bình yên', exact: true })
  await star.click()
  await expect(star).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.wish-message')).toContainText('ngủ thật ngon')
  await page.getByRole('button', { name: 'Ngôi sao Niềm vui', exact: true }).click()
  await page.getByRole('button', { name: 'Ngôi sao May mắn', exact: true }).click()
  await expect(page.locator('.constellation-secret')).toContainText('tự tin')
  if (detailed) await capture(page, `${label}-universe`)
  result.checks.push('wish star changes its message')

  await expect(page.getByTestId('reason-card')).toHaveCount(10)
  result.cardClipping = await page.evaluate(() => ({
    reasons: [...document.querySelectorAll('.reason-card')].map(card => {
      const copy = card.querySelector('.reason-card-copy')
      return { text: copy.querySelector('h3').textContent, clientHeight: card.clientHeight, scrollHeight: card.scrollHeight, copyBottom: copy.offsetTop + copy.offsetHeight }
    }),
    notes: [...document.querySelectorAll('.note-face')].map(face => ({ clientHeight: face.clientHeight, scrollHeight: face.scrollHeight })),
  }))
  for (const card of result.cardClipping.reasons) expect(card.copyBottom, `${label} ${card.text}: reason copy fits`).toBeLessThanOrEqual(card.clientHeight + 1)
  for (const face of result.cardClipping.notes) expect(face.scrollHeight, `${label}: note face fits`).toBeLessThanOrEqual(face.clientHeight + 1)
  result.checks.push('reason and note copy fits within cards')
  await page.getByTestId('reason-next').click()
  await expect(page.locator('.carousel-count b')).toHaveText('02')
  const track = page.locator('.reason-track')
  if (result.viewport.width < 768) {
    await touchSwipe(page, track)
    await expect.poll(async () => Number(await page.locator('.carousel-count b').textContent())).toBeGreaterThan(2)
    result.checks.push('native touch swipe advances reason cards')
  } else {
    await track.focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('.carousel-count b')).toHaveText('03')
    result.checks.push('keyboard advances reason cards')
  }
  if (detailed) {
    await page.locator('#reasons').evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }))
    await capture(page, `${label}-reasons`)
  }
  await checkOverflow(page, `${label} reasons`)

  const note = page.getByTestId('memory-card').first()
  await note.click()
  await expect(note).toHaveAttribute('aria-pressed', 'true')
  await expect(note.locator('.note-back')).toHaveAttribute('aria-hidden', 'false')
  await note.click()
  await expect(note).toHaveAttribute('aria-pressed', 'false')
  await note.click()
  result.checks.push('memory card flips open and closes')
  if (detailed) {
    await page.locator('#notes').evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }))
    await capture(page, `${label}-notes`)
    await touchSwipe(page, page.locator('.notes-track'))
    await expect.poll(() => page.locator('.notes-track').evaluate(element => element.scrollLeft)).toBeGreaterThan(10)
    result.checks.push('native touch swipe advances memory cards')
  }
  if (detailed) {
    const cover = page.getByTestId('secret-ticket').locator('canvas')
    await cover.scrollIntoViewIfNeeded()
    await capture(page, `${label}-secret-before`)
    const box = await cover.boundingBox()
    await page.mouse.move(box.x + 35, box.y + box.height / 2)
    await page.mouse.down()
    for (let row = 0; row < 5; row++) {
      await page.mouse.move(box.x + (row % 2 ? 35 : box.width - 35), box.y + box.height / 2 + row * 5, { steps: 12 })
    }
    await page.mouse.up()
    result.checks.push('scratching ticket reveals its message')
  } else {
    await page.getByTestId('secret-ticket').getByRole('button', { name: 'Mở ngay' }).click()
  }
  await expect(page.getByTestId('secret-ticket')).toContainText('em không cần phải giỏi mọi lúc')
  await expect(page.getByTestId('secret-ticket').locator('canvas')).toHaveCount(0)
  if (detailed) await capture(page, `${label}-secret-after`)
  result.checks.push('secret ticket reveals its message')

  await page.getByTestId('open-letter').click()
  const paper = page.getByTestId('letter-paper')
  await expect(paper).toBeVisible()
  await expect(paper).toContainText('Gửi Hạnh')
  await expect(paper).toBeFocused()
  if (detailed) {
    await paper.evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }))
    await capture(page, `${label}-letter`)
    await paper.screenshot({ path: resolve(artifactDir, `${label}-letter-paper.png`), animations: 'disabled' })
  }
  await page.getByRole('button', { name: 'Gấp thư lại', exact: false }).click()
  await expect(page.getByTestId('open-letter')).toBeVisible()
  result.checks.push('letter opens, receives focus and folds closed')
  await checkOverflow(page, `${label} letter`)

  const finale = page.getByTestId('finale')
  const candleButton = page.getByTestId('blow-candles')
  await candleButton.scrollIntoViewIfNeeded()
  await expect(finale).toHaveAttribute('data-stage', 'ready')
  await page.getByTestId('wish-input').fill('Một năm thật nhiều niềm vui')
  if (detailed) await capture(page, `${label}-candles`)
  if (reducedMotion || result.viewport.width >= 768) {
    await candleButton.focus()
    await page.keyboard.press(reducedMotion ? 'Space' : 'Enter')
    result.checks.push(`candles respond to ${reducedMotion ? 'Space' : 'Enter'}`)
  } else if (result.viewport.width === 430) {
    await page.getByRole('button', { name: 'hoặc chạm vào đây để gửi điều ước', exact: true }).tap()
    result.checks.push('candle tap alternative responds')
  } else {
    const box = await candleButton.boundingBox()
    const session = await page.context().newCDPSession(page)
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2 }] })
    await expect(finale).not.toHaveAttribute('data-stage', 'ready', { timeout: 3500 })
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await session.detach()
    result.checks.push('holding a real touch extinguishes candles')
  }
  await expect(finale).toHaveAttribute('data-stage', 'revealed', { timeout: 10000 })
  await expect(page.getByTestId('finale-message')).toBeVisible()
  await expect(page.getByTestId('finale-message')).toContainText('rực rỡ')
  await expect(page.getByTestId('finale-message')).toContainText('Một năm thật nhiều niềm vui')
  await finale.evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }))
  await capture(page, `${label}-finale`)
  result.checks.push('countdown reaches birthday reveal')
  await page.getByRole('button', { name: 'Ước thêm lần nữa', exact: false }).click()
  await expect(finale).toHaveAttribute('data-stage', 'ready')
  result.checks.push('finale can be replayed')
  result.finalDimensions = await checkOverflow(page, `${label} finale`)

  if (result.viewport.width === 1440 || detailed) {
    for (const section of await page.locator('.chapter').all()) {
      await section.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
      await page.waitForTimeout(120)
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await capture(page, `${label}-full-page`, true)
  }
}

let server
let browser
try {
  let baseURL = process.env.BASE_URL
  if (!baseURL) {
    server = await preview({ preview: { host: '127.0.0.1', port: 4179, strictPort: true, open: false } })
    baseURL = 'http://127.0.0.1:4179/'
  }
  report.baseURL = baseURL
  browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) })
  for (const [width, height] of [[320, 740], [390, 844], [430, 932], [768, 1024], [1440, 900]]) {
    await runCase(browser, baseURL, { width, height })
  }
  await runCase(browser, baseURL, { width: 390, height: 844 }, true)
} finally {
  await browser?.close()
  await new Promise(resolveClose => server ? server.httpServer.close(resolveClose) : resolveClose())
  report.finishedAt = new Date().toISOString()
  report.status = report.cases.length === 6 && report.cases.every(result => result.status === 'passed') ? 'passed' : 'failed'
  writeFileSync(resolve(artifactDir, 'report.json'), JSON.stringify(report, null, 2))
  console.log(`Report: ${resolve(artifactDir, 'report.json')}`)
  if (report.status !== 'passed') process.exitCode = 1
}
