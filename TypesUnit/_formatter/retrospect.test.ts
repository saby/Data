import {assert} from 'chai';
import * as sinon from 'sinon';
import retrospect, {Type} from 'Types/_formatter/retrospect';
import {controller} from 'I18n/i18n';
import enUS from 'I18n/locales/en-US';

describe('Types/_formatter/retrospect', () => {
    controller.addLocale('en-US', enUS);
    let stubEnabled;
    let stubGetLang;

    before(() => {
        stubEnabled = sinon.stub(controller, 'isEnabled');
        stubGetLang = sinon.stub(controller, 'currentLocale');
        stubEnabled.get(() => true);
        stubGetLang.get(() => 'en-US');
    });

    after(() => {
        stubEnabled.restore();
        stubGetLang.restore();
        stubEnabled = undefined;
        stubGetLang = undefined;
    });

    it('should format today\'s date', () => {
        const today = new Date();
        assert.strictEqual(String(retrospect(today, Type.Date)), 'Today');
    });

    it('should format yesterday\'s date', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        assert.strictEqual(String(retrospect(yesterday, Type.Date)), 'Yesterday');
    });

    it('should format long time ago', () => {
        const deepPast = new Date(2000, 1, 2);
        assert.strictEqual(retrospect(deepPast, Type.Date), '02.02.00');
    });
});
