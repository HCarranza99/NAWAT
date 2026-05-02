import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

for (let i = 1; i <= 160; i++) {
  test(`Simulate Participant ${i}`, async ({ page }) => {
    // Aumentar el timeout por si el dev server es un poco lento
    test.setTimeout(60000);

    // Permitir mockear el tiempo para saltar los 15 minutos
    await page.clock.install();

    await page.goto('/');

    // 1. Consent Screen
    await expect(page.locator('h1.onboarding-title').filter({ hasText: 'Bienvenido' })).toBeVisible();
    
    // Fill profile form
    await page.fill('#firstName', faker.person.firstName());
    await page.fill('#lastName', faker.person.lastName());
    await page.click('.consent-check input[type="checkbox"]');
    
    // Click Continuar
    await page.click('button[type="submit"]:has-text("Continuar")');

    // 2. About Screen (3 slides)
    await expect(page.locator('h1.onboarding-title').filter({ hasText: 'Sobre el náhuat' })).toBeVisible();
    await page.click('button.btn-primary:has-text("Siguiente")'); // slide 1
    await page.click('button.btn-primary:has-text("Siguiente")'); // slide 2
    await page.click('button.btn-primary:has-text("Continuar")'); // slide 3

    // 3. Practice Screen
    await expect(page.locator('h1.onboarding-title').filter({ hasText: 'Practiquemos primero' })).toBeVisible();
    // Click any likert button (e.g. 5)
    await page.click('.likert-btn >> text=5');
    await page.click('button.btn-primary:has-text("Empezar el cuestionario")');

    // 4. Pretest Screen Intro
    await expect(page.locator('h1.onboarding-title').filter({ hasText: 'Cuestionario inicial' })).toBeVisible();
    await page.click('button.btn-primary:has-text("Empezar cuestionario")');

    // Pretest Loop (23 questions)
    let isPretest = true;
    while (isPretest) {
      await page.waitForSelector('.likert-btn, .sc-btn, .short-text-input, textarea');
      const questionText = await page.locator('.question-text').textContent();

      const hasLikert = await page.locator('.likert-btn').first().isVisible();
      const hasSingleChoice = await page.locator('.sc-btn').first().isVisible();
      const hasShortText = await page.locator('.short-text-input').first().isVisible();
      
      if (hasLikert) {
        const randomLikert = Math.floor(Math.random() * 5) + 1;
        await page.click(`.likert-btn:has(span.likert-num:text-is("${randomLikert}"))`);
      } else if (hasSingleChoice) {
        const options = page.locator('.sc-btn');
        const count = await options.count();
        const randomIndex = Math.floor(Math.random() * count);
        await options.nth(randomIndex).click();
        
        await page.waitForTimeout(100); // Give React time to render custom input
        if (await page.locator('.sc-custom-input').isVisible()) {
          await page.fill('.sc-custom-input', faker.lorem.word({ length: { min: 3, max: 10 } }));
        }
      } else if (hasShortText) {
        await page.fill('.short-text-input', faker.person.jobArea());
      }

      const btn = page.locator('.questionnaire-actions button.btn-primary');
      await btn.waitFor({ state: 'visible' });
      
      // Wait until button is not disabled
      await expect(btn).toBeEnabled({ timeout: 5000 });
      const text = await btn.textContent();
      
      await btn.click();

      if (text && text.includes('Finalizar')) {
        isPretest = false;
        // Esperar a que desaparezca el cuestionario
        await expect(page.locator('.questionnaire-screen')).toBeHidden();
      } else {
        // Esperar a que cambie la pregunta para evitar race conditions
        await expect(page.locator('.question-text')).not.toHaveText(questionText, { timeout: 10000 });
      }
    }

    // 5. We are now in HomeScreen (Intervention phase)
    await expect(page.locator('.home-screen')).toBeVisible();

    // HACK: El timer de 15 minutos se calcula usando Date.now().
    // Adelantamos el reloj del navegador 15 minutos y 10 segundos.
    await page.clock.fastForward(15 * 60 * 1000 + 10000);
    
    // Al adelantarlo, debería dispararse el useEffect en App.jsx que triggerea el Posttest.
    // Verificamos que aparezca la pantalla de intro de Posttest.
    
    // 6. Posttest Screen Intro
    await expect(page.locator('h1.onboarding-title').filter({ hasText: '¡Tiempo cumplido!' })).toBeVisible();
    await page.click('button.btn-primary:has-text("Empezar cuestionario")');

    // Posttest Loop
    let isPosttest = true;
    while (isPosttest) {
      await page.waitForSelector('.likert-btn, .sc-btn, .short-text-input, textarea');
      const questionText = await page.locator('.question-text').textContent();

      const hasLikert = await page.locator('.likert-btn').first().isVisible();
      const hasSingleChoice = await page.locator('.sc-btn').first().isVisible();
      const hasLongText = await page.locator('textarea').first().isVisible();
      
      if (hasLikert) {
        const randomLikert = Math.floor(Math.random() * 5) + 1;
        await page.click(`.likert-btn:has(span.likert-num:text-is("${randomLikert}"))`);
      } else if (hasSingleChoice) {
        const options = page.locator('.sc-btn');
        const count = await options.count();
        const randomIndex = Math.floor(Math.random() * count);
        await options.nth(randomIndex).click();
        
        await page.waitForTimeout(100);
        if (await page.locator('.sc-custom-input').isVisible()) {
          await page.fill('.sc-custom-input', faker.lorem.word({ length: { min: 3, max: 10 } }));
        }
      } else if (hasLongText) {
        await page.fill('textarea', faker.lorem.sentence());
      }

      const btn = page.locator('.questionnaire-actions button.btn-primary');
      await btn.waitFor({ state: 'visible' });
      await expect(btn).toBeEnabled({ timeout: 5000 });
      const text = await btn.textContent();
      
      await btn.click();

      if (text && text.includes('Finalizar')) {
        isPosttest = false;
        await expect(page.locator('.questionnaire-screen')).toBeHidden();
      } else {
        await expect(page.locator('.question-text')).not.toHaveText(questionText, { timeout: 10000 });
      }
    }

    // Posttest Outro (Gracias por participar)
    await expect(page.locator('h1.onboarding-title').filter({ hasText: '¡Gracias por participar!' })).toBeVisible();
    await page.click('button.btn-primary:has-text("Abrir la app")');

    // 7. Should end up in AccountPromptScreen
    await expect(page.locator('button.account-prompt-skip:has-text("Continuar sin cuenta")')).toBeVisible();

    // End of iteration
  });
}
