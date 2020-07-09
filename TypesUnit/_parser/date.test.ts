import {assert} from 'chai';
import {stub} from 'sinon';
import parse from 'Types/_parser/date';
import {controller} from 'I18n/i18n';

function resetLocale(): () => void {
    const stubConfig = stub(controller, 'currentLocaleConfig');
    stubConfig.get(() => ({calendarEntities: {
        am: 'am',
        pm: 'pm'
    }}));

    return () => {
        stubConfig.restore();
    };
}

describe('Types/_parser/date', () => {
    let undo;

    before(() => {
        undo = resetLocale();
    });

    after(() => {
        undo();
    });

    it('should return zero-like date from empty string', () => {
        const date = parse('', '');
        assert.equal(date.getTime(), 0);
    });

    it('should parse one-digit year from Y', () => {
        const date = parse('1', 'Y');
        assert.equal(date.getFullYear(), 2001);
    });

    it('should parse two-digit year from Y', () => {
        const date = parse('12', 'Y');
        assert.equal(date.getFullYear(), 2012);
    });

    it('should parse year from YY', () => {
        const date = parse('19', 'YY');
        assert.equal(date.getFullYear(), 2019);
    });

    it('should parse year from YYYY', () => {
        const date = parse('2019', 'YYYY');
        assert.equal(date.getFullYear(), 2019);
    });

    it('should parse one-digit month from M', () => {
        const date = parse('1', 'M');
        assert.equal(date.getMonth(), 0);
    });

    it('should parse two-digit month from M', () => {
        const date = parse('12', 'M');
        assert.equal(date.getMonth(), 11);
    });

    it('should parse month from MM', () => {
        const date = parse('02', 'MM');
        assert.equal(date.getMonth(), 1);
    });

    it('should parse one-digit date from D', () => {
        const date = parse('3', 'D');
        assert.equal(date.getDate(), 3);
    });

    it('should parse two-digit date from D', () => {
        const date = parse('10', 'D');
        assert.equal(date.getDate(), 10);
    });

    it('should parse date from DD', () => {
        const date = parse('03', 'DD');
        assert.equal(date.getDate(), 3);
    });

    it('should parse one-digit hours from h', () => {
        const date = parse('1', 'h');
        assert.equal(date.getHours(), 1);
    });

    it('should parse two-digit hours from h', () => {
        const date = parse('11', 'h');
        assert.equal(date.getHours(), 11);
    });

    it('should parse hours from hh', () => {
        const date = parse('01', 'hh');
        assert.equal(date.getHours(), 1);
    });

    it('should parse one-digit hours from H', () => {
        const date = parse('1', 'H');
        assert.equal(date.getHours(), 1);
    });

    it('should parse two-digit hours from H', () => {
        const date = parse('11', 'H');
        assert.equal(date.getHours(), 11);
    });

    it('should parse hours from HH', () => {
        const date = parse('02', 'HH');
        assert.equal(date.getHours(), 2);
    });

    it('should parse AM value from hha', () => {
        const date = parse('01am', 'hha');
        assert.equal(date.getHours(), 1);
    });

    it('should parse PM value from hha', () => {
        const date = parse('01pm', 'hha');
        assert.equal(date.getHours(), 13);
    });

    it('should parse one-digit minutes from m', () => {
        const date = parse('1', 'm');
        assert.equal(date.getMinutes(), 1);
    });

    it('should parse two-digit minutes from m', () => {
        const date = parse('22', 'm');
        assert.equal(date.getMinutes(), 22);
    });

    it('should parse minutes from mm', () => {
        const date = parse('01', 'mm');
        assert.equal(date.getMinutes(), 1);
    });

    it('should parse one-digit seconds from s', () => {
        const date = parse('1', 's');
        assert.equal(date.getSeconds(), 1);
    });

    it('should parse two-digit seconds from s', () => {
        const date = parse('23', 's');
        assert.equal(date.getSeconds(), 23);
    });

    it('should parse seconds from ss', () => {
        const date = parse('01', 'ss');
        assert.equal(date.getSeconds(), 1);
    });

    it('should parse date from DD-MM', () => {
        const date = parse('01-03', 'DD-MM');
        assert.equal(date.getDate(), 1);
        assert.equal(date.getMonth(), 2);
    });

    it('should parse date from DD-MM-YY', () => {
        const date = parse('01-02-03', 'DD-MM-YY');
        assert.equal(date.getDate(), 1);
        assert.equal(date.getMonth(), 1);
        assert.equal(date.getFullYear(), 2003);
    });

    it('should parse date from D-M-Y', () => {
        const date = parse('1-12-03', 'D-M-Y');
        assert.equal(date.getDate(), 1);
        assert.equal(date.getMonth(), 11);
        assert.equal(date.getFullYear(), 2003);
    });

    it('should parse date from DD-MM-YYYY', () => {
        const date = parse('01-12-2003', 'DD-MM-YYYY');
        assert.equal(date.getDate(), 1);
        assert.equal(date.getMonth(), 11);
        assert.equal(date.getFullYear(), 2003);
    });

    it('should parse date-time from D/M/YYYY H:mm:s', () => {
        const date = parse('1/2/2003 15:16:17', 'D/M/YYYY H:mm:s');
        assert.equal(date.getDate(), 1);
        assert.equal(date.getMonth(), 1);
        assert.equal(date.getFullYear(), 2003);
        assert.equal(date.getHours(), 15);
        assert.equal(date.getMinutes(), 16);
        assert.equal(date.getSeconds(), 17);
    });
});
