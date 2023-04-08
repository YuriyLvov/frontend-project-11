import { test, expect } from '@playwright/test';
import i18next from 'i18next';
import initLocalization from '../src/localization.js';

test.beforeAll(() => {
  initLocalization();
});

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('has title', async ({ page }) => {
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle('RSS агрегатор');
});

test('has add btn by default', async ({ page }) => {
  const addBtn = await page.getByText('Добавить');

  await expect(addBtn).toBeVisible();
});

test('has no posts title by default', async ({ page }) => {
  const postsTitle = await page.getByText('Посты');

  await expect(postsTitle).not.toBeVisible();
});

test('has no feeds title by default', async ({ page }) => {
  const feedsTitle = await page.getByText('Фиды');

  await expect(feedsTitle).not.toBeVisible();
});

test('posts title appears after first url added', async ({ page }) => {
  const inputUrl = await page.locator('#url-input');
  const sendFormBtn = await page.locator('#send-form-btn');

  inputUrl.fill('https://ru.hexlet.io/lessons.rss');

  await sendFormBtn.click();

  const postsTitle = await page.getByText('Посты');

  await expect(postsTitle).toBeVisible();
});

test('feeds title appears after first url added', async ({ page }) => {
  const inputUrl = await page.locator('#url-input');
  const sendFormBtn = await page.locator('#send-form-btn');

  inputUrl.fill('https://ru.hexlet.io/lessons.rss');

  await sendFormBtn.click();

  const feedsTitle = await page.getByText('Фиды');

  await expect(feedsTitle).toBeVisible();
});

test('show error if url is not valid', async ({ page }) => {
  const inputUrl = await page.locator('#url-input');
  const sendFormBtn = await page.locator('#send-form-btn');

  inputUrl.fill('not-valid-url');

  await sendFormBtn.click();

  const errorMessage = await page.getByText(i18next.t('urlNotValid'));

  await expect(errorMessage).toBeVisible();
});

test('show success message if url is valid', async ({ page }) => {
  const inputUrl = await page.locator('#url-input');
  const sendFormBtn = await page.locator('#send-form-btn');

  inputUrl.fill('https://ru.hexlet.io/lessons.rss');

  await sendFormBtn.click();

  const successMessage = await page.getByText(i18next.t('rssAdded'));

  await expect(successMessage).toBeVisible();
});

test('clean input after adding url', async ({ page }) => {
  const inputUrl = await page.locator('#url-input');
  const sendFormBtn = await page.locator('#send-form-btn');

  inputUrl.fill('https://ru.hexlet.io/lessons.rss');

  await sendFormBtn.click();

  const inputValue = await inputUrl.inputValue();

  await expect(inputValue).toEqual('');
});

test('show error message if url is already exists', async ({ page }) => {
  const inputUrl = await page.locator('#url-input');
  const sendFormBtn = await page.locator('#send-form-btn');

  inputUrl.fill('https://ru.hexlet.io/lessons.rss');

  await sendFormBtn.click();

  inputUrl.fill('https://ru.hexlet.io/lessons.rss');

  await sendFormBtn.click();

  const errorMessage = await page.getByText(i18next.t('urlAlredyExist'));

  await expect(errorMessage).toBeVisible();
});

test('should add rows after adding url', async ({ page }) => {
  const inputUrl = await page.locator('#url-input');
  const sendFormBtn = await page.locator('#send-form-btn');

  inputUrl.fill('https://ru.hexlet.io/lessons.rss');

  await sendFormBtn.click();

  const viewPostElement = await page.getByText(i18next.t('viewPost'));

  await expect(viewPostElement.nth(0)).toBeVisible();
});

test('show error message if input is empty', async ({ page }) => {
  const inputUrl = await page.locator('#url-input');
  const sendFormBtn = await page.locator('#send-form-btn');

  inputUrl.fill('');

  await sendFormBtn.click();

  const errorMessage = await page.getByText(i18next.t('required'));

  await expect(errorMessage).toBeVisible();
});

test('show error message if network error', async ({ page }) => {
  await page.route('https://allorigins.hexlet.app/get?url=https%3A%2F%2Fru.hexlet.io%2Flessons.rss', (route) => {
    route.abort();
  });

  const inputUrl = await page.locator('#url-input');
  const sendFormBtn = await page.locator('#send-form-btn');

  inputUrl.fill('https://ru.hexlet.io/lessons.rss');

  await sendFormBtn.click();

  const errorMessage = await page.getByText(i18next.t('networkError'));

  await expect(errorMessage).toBeVisible();
});

test('show error message if bad response', async ({ page }) => {
  await page.route('https://allorigins.hexlet.app/get?url=https%3A%2F%2Fru.hexlet.io%2Flessons.rss', async (route) => {
    await route.fulfill({
      status: 404,
      contentType: 'text/plain',
      body: 'Not Found!',
    });
  });

  const inputUrl = await page.locator('#url-input');
  const sendFormBtn = await page.locator('#send-form-btn');

  inputUrl.fill('https://ru.hexlet.io/lessons.rss');

  await sendFormBtn.click();

  const errorMessage = await page.getByText(i18next.t('notValid'));

  await expect(errorMessage).toBeVisible();
});
