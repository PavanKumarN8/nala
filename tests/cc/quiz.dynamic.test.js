/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { expect, test } from '@playwright/test';
import { buildTestData } from '../../data/cc/quiz/uar.js';
import Quiz from '../../selectors/uar/quiz.page.js';

const QuizSpec = require('../../features/cc/quiz.dynamic.spec.js');

const { features } = QuizSpec;
const { WebUtil } = require('../../libs/webutil.js');

test.describe('Quiz flow test suite', () => {
  // reset timeout because we use this to run all test data
  test.setTimeout(30 * 60 * 1000);
  for (const feature of features) {
    test(
      `${feature.name}, ${feature.tags}`,
      async ({ page, baseURL }) => {
        const quiz = new Quiz(page);
        const quizOldPage = new Quiz(page);
        const url = `${baseURL}${feature.path}`;
        console.info(url);

        const originalData = await WebUtil.loadTestDataFromAPI(baseURL, feature.data);

        let testdata = buildTestData(originalData, feature.name);

        if (feature.name.includes('triple flagship')) {
          testdata = testdata.sort(() => 0.5 - Math.random()).slice(0, 20);
        }

        for (let key of testdata) {
          console.log(key);
          let oldProduct = '';
          let newProduct = '';

          if (key.includes('PDFs > Edit quickly')) {
            // eslint-disable-next-line no-continue
            continue;
          }

          if (key.includes('PDFs > Take the time to control')) {
            key = key.replace('PDFs > Take the time to control every detail', 'PDFs');
          }

          await test.step(`Old: Select each answer on test page according to ${key}`, async () => {
            await quizOldPage.clickEachAnswer(url, key);
          });

          await test.step('Old: Check results on test page', async () => {
            oldProduct = await quizOldPage.checkResultPage(feature.name);
          });

          await test.step(`New: Select each answer on test page according to ${key}`, async () => {
            await quiz.clickEachAnswer(`${url}?milolibs=stage`, key);
          });

          await test.step('New: Check results on test page', async () => {
            newProduct = await quiz.checkResultPage(feature.name);
          });

          expect.soft(newProduct.replaceAll('[', '').replaceAll(']', '')).toContain(oldProduct.replaceAll('[', '').replaceAll(']', ''));
        }
      },
    );
  }
});