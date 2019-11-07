import {assert} from 'chai';
import * as sinon from 'sinon';
import numberWords from 'Types/_formatter/numberWords';
import * as i18n from 'Core/i18n';
import * as enUS from 'json!Types/lang/en/en.json';
import * as ruRU from 'json!Types/lang/ru/ru.json';

describe('Types/_formatter/numberWords', () => {
    const locales = ['en-US', 'ru-RU'];

    before(() => {
       i18n.setDict(ruRU, 'formatter', 'ru-RU');
       i18n.setDict(enUS, 'formatter', 'en-US');
    });

    locales.forEach((locale) => {
       describe(`if locale "${locale}" is enabled`, () => {
          let stub;

          beforeEach(() => {
             stub = sinon.stub(i18n, 'getLang');
             stub.returns(locale);
          });

          afterEach(() => {
             stub.restore();
             stub = undefined;
          });

          it('should format 0 to words', () => {
             const expect = {
                'en-US': 'zero',
                'ru-RU': 'ноль'
             };
             assert.equal(expect[locale], numberWords(0));
          });

          it('should format 2 to words', () => {
             const expect = {
                'en-US': 'two',
                'ru-RU': 'два'
             };
             assert.equal(expect[locale], numberWords(2));
          });

          it('should format 13 to words', () => {
             const expect = {
                'en-US': 'thirteen',
                'ru-RU': 'тринадцать'
             };
             assert.equal(expect[locale], numberWords(13));
          });

          it('should format 23 to words', () => {
             const expect = {
                'en-US': 'twenty-three',
                'ru-RU': 'двадцать три'
             };
             assert.equal(expect[locale], numberWords(23));
          });

          it('should format 300 to words', () => {
             const expect = {
                'en-US': 'three hundred',
                'ru-RU': 'триста'
             };
             assert.equal(expect[locale], numberWords(300));
          });

          it('should format 123 to words', () => {
             const expect = {
                'en-US': 'one hundred and twenty-three',
                'ru-RU': 'сто двадцать три'
             };
             assert.equal(expect[locale], numberWords(123));
          });

          it('should format 2123 to words', () => {
             const expect = {
                'en-US': 'two thousand, one hundred and twenty-three',
                'ru-RU': 'две тысяча сто двадцать три'
             };
             assert.equal(expect[locale], numberWords(2123));
          });

          it('should format 23015000 to words', () => {
             const expect = {
                'en-US': 'twenty-three million, fifteen thousand',
                'ru-RU': 'двадцать три миллион пятнадцать тысяча'
             };
             assert.equal(expect[locale], numberWords(23015000));
          });

          it('should format -6 to words', () => {
             const expect = {
                'en-US': 'minus six',
                'ru-RU': 'минус шесть'
             };
             assert.equal(expect[locale], numberWords(-6));
          });
       });
    });
});
