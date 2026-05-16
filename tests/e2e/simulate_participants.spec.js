import { test, expect } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { PRETEST_ITEMS, POSTTEST_ITEMS } from '../../src/data/questionnaires.js'

const participantCount = Number.parseInt(process.env.E2E_PARTICIPANTS ?? '1', 10)

async function resetBrowserStorage(context) {
  await context.addInitScript(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })
}

async function answerCurrentQuestion(page, index) {
  const radios = page.getByRole('radio')
  if (await radios.count()) {
    await radios.nth(index % 5).click()
    return
  }

  const choiceOptions = page.getByTestId('single-choice-option')
  if (await choiceOptions.count()) {
    await choiceOptions.first().click()
    return
  }

  const shortText = page.getByTestId('short-text-answer')
  if (await shortText.count()) {
    await shortText.fill(`E2E ${faker.person.jobArea()}`)
    return
  }

  const longText = page.getByTestId('long-text-answer')
  if (await longText.count()) {
    await longText.fill(`Prueba E2E: ${faker.lorem.sentence()}`)
  }
}

async function completeQuestionnaire(page, items) {
  for (let i = 0; i < items.length; i += 1) {
    const expectedCode = `${items[i].display_code ?? items[i].code}.`

    await expect(page.getByTestId('question-card')).toBeVisible()
    await expect(page.getByTestId('question-code')).toHaveText(expectedCode)

    if (items[i].code === 'G1') {
      await expect(page.getByTestId('section-label')).toHaveText('Sección G. Valor cultural e identitario')
    }

    const currentCode = await page.getByTestId('question-code').textContent()

    await answerCurrentQuestion(page, i)

    const nextButton = page.getByTestId('questionnaire-next')
    await expect(nextButton).toBeEnabled()
    await nextButton.click()

    if (i < items.length - 1) {
      await expect(page.getByTestId('question-code')).not.toHaveText(currentCode ?? '')
    }
  }
}

test.describe.configure({ mode: 'parallel' })

for (let i = 1; i <= participantCount; i += 1) {
  test(`Simulate Participant ${i}`, async ({ context, page }) => {
    test.setTimeout(90_000)

    await resetBrowserStorage(context)
    await page.clock.install()
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Bienvenido al estudio NAWAT' })).toBeVisible({ timeout: 15_000 })
    await page.getByLabel('Nombre').fill(`E2E${i}`)
    await page.getByLabel('Apellido').fill(faker.person.lastName())
    await page.getByLabel(/Acepto participar/).check()
    await page.getByRole('button', { name: /Continuar al cuestionario/ }).click()

    await expect(page.getByRole('heading', { name: 'Sobre el náhuat' })).toBeVisible()
    await page.getByRole('button', { name: /Siguiente/ }).click()
    await expect(page.getByRole('heading', { name: 'Sobre este estudio' })).toBeVisible()
    await page.getByRole('button', { name: /Siguiente/ }).click()
    await expect(page.getByRole('heading', { name: 'Tu participación importa' })).toBeVisible()
    await page.getByRole('button', { name: /Continuar/ }).click()

    await expect(page.getByRole('heading', { name: 'Practiquemos primero' })).toBeVisible()
    await page.getByRole('radio', { name: /5/ }).click()
    await page.getByRole('button', { name: /Empezar el cuestionario/ }).click()

    await expect(page.getByRole('heading', { name: 'Cuestionario inicial' })).toBeVisible()
    await page.getByRole('button', { name: /Empezar cuestionario/ }).click()
    await completeQuestionnaire(page, PRETEST_ITEMS)

    await expect(page.getByText('Tu próxima práctica')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Tiempo de estudio')).toBeVisible()

    await page.clock.fastForward(15 * 60 * 1000 + 10_000)

    await expect(page.getByRole('heading', { name: '¡Tiempo cumplido!' })).toBeVisible({ timeout: 15_000 })
    await page.getByRole('button', { name: /Empezar cuestionario/ }).click()
    await completeQuestionnaire(page, POSTTEST_ITEMS)

    await expect(page.getByRole('heading', { name: '¡Gracias por participar!' })).toBeVisible()
    await page.getByRole('button', { name: /Abrir la app/ }).click()

    await expect(page.getByRole('button', { name: 'Continuar sin cuenta' })).toBeVisible()
  })
}
