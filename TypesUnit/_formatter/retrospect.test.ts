import {assert} from 'chai';
import {stub} from 'sinon';
import retrospect, {Type} from 'Types/_formatter/retrospect';
import i18n = require('Core/i18n');

describe('Types/_formatter/retrospect', () => {
    let stubEnabled;
    let stubGetLang;

    before(() => {
        stubEnabled = stub(i18n, 'isEnabled');
        stubGetLang = stub(i18n, 'getLang');
        stubEnabled.returns(true);
        stubGetLang.returns('en-US');
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
