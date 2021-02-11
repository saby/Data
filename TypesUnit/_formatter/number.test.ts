import {assert} from 'chai';
import {stub} from 'sinon';
import number from 'Types/_formatter/number';
import {controller} from 'I18n/i18n';

describe('Types/_formatter/number', () => {
    const locales = ['en-US', 'ru-RU', 'foo-BAR'];

    locales.forEach((locale) => {
        describe('for locale "' + locale + '"', () => {
            let stubIntl;

            beforeEach(() => {
                stubIntl = stub(controller, 'currentLocale');
                stubIntl.get(() => locale);
            });

            afterEach(() => {
                stubIntl.restore();
                stubIntl = undefined;
            });

            it('should format Number', () => {
                const expect = {
                    'en-US': '1,234.5',
                    'ru-RU': '1 234,5',
                    'foo-BAR': '1,234.5'
                };
                const value = 1234.5;

                assert.equal(expect[locale], number(value));
            });

            it('should drop the fractional part', () => {
                const testValue1 = 4.5;
                const testValue2 = 4.3;

                assert.equal('5', number(testValue1, { maximumFractionDigits: 0 }));
                assert.equal('4', number(testValue2, { maximumFractionDigits: 0 }));

                assert.equal('5', number(testValue1, { maximumSignificantDigits: 1 }));
                assert.equal('4', number(testValue2, { maximumSignificantDigits: 1 }));
            });

            it('should add two zero the fractional part', () => {
                const expect = {
                    'en-US': '4.00',
                    'ru-RU': '4,00',
                    'foo-BAR': '4.00'
                };
                const testValue = 4;

                assert.equal(expect[locale], number(testValue, { minimumFractionDigits: 2 }));
                assert.equal(expect[locale], number(testValue, { minimumSignificantDigits: 3 }));
            });

            it('should round the integer part to one sign', () => {
                const testValue1 = 451;
                const testValue2 = 441;

                assert.equal('500', number(testValue1, { maximumSignificantDigits: 1 }));
                assert.equal('400', number(testValue2, { maximumSignificantDigits: 1 }));
            });

            it('should set 3 sign in the integer part', () => {
                const testValue1 = 5;
                const testValue2 = 5.2;
                const expect = {
                    'en-US': '005.2',
                    'ru-RU': '005,2',
                    'foo-BAR': '005.2'
                };

                assert.equal('005', number(testValue1, { minimumIntegerDigits: 3 }));
                assert.equal(expect[locale], number(testValue2, { minimumIntegerDigits: 3 }));
            });

            it('should set one sign in the fractional part', () => {
                const expect = {
                    'en-US': '4.5',
                    'ru-RU': '4,5',
                    'foo-BAR': '4.5'
                };
                const testValue = 4.512;

                assert.equal(expect[locale], number(testValue, { maximumFractionDigits: 1 }));
                assert.equal(expect[locale], number(testValue, { maximumSignificantDigits: 2 }));
            });
        });
    });
});
