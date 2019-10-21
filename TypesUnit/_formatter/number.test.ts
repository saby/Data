import {assert} from 'chai';
import * as sinon from 'sinon';
import number from 'Types/_formatter/number';
import i18n = require('Core/i18n');

describe('Types/_formatter/number', () => {
    const locales = ['en-US', 'ru-RU', 'foo-BAR'];

    locales.forEach((locale) => {
        describe('for locale "' + locale + '"', () => {
            const expect = {
                'en-US': '1,234.5',
                'ru-RU': '1 234,5',
                'foo-BAR': '1,234.5',
            };
            let stubIntl;

            beforeEach(() => {
                stubIntl = sinon.stub(i18n, 'getLang');
                stubIntl.callsFake(() => {
                    return locale;
                });
            });

            afterEach(() => {
                stubIntl.restore();
                stubIntl = undefined;
            });

            it('should format Number', () => {
                const value = 1234.5;
                assert.equal(expect[locale], number(value));
            });
        });
    });
});
