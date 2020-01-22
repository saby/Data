
import {assert} from 'chai';
import parse from 'Types/_entity/dateParser';

describe('Types/_entity/dateParser', () => {
    it('should return zero-like date from empty string', () => {
        const date = parse('', '');
        assert.equal(date.getTime(), 0);
    });

    it('should parse a year from YYYY', () => {
        const date = parse('2019', 'YYYY');
        assert.equal(date.getFullYear(), 2019);
    });

    it('should parse a year from YY', () => {
        const date = parse('19', 'YY');
        assert.equal(date.getFullYear(), 2019);
    });

    it('should parse a month from MM', () => {
        const date = parse('03', 'MM');
        assert.equal(date.getMonth(), 2);
    });

    it('should parse a date from DD', () => {
        const date = parse('03', 'DD');
        assert.equal(date.getDate(), 3);
    });

    it('should parse a date from DD-MM', () => {
        const date = parse('01-03', 'DD-MM');
        assert.equal(date.getDate(), 1);
        assert.equal(date.getMonth(), 2);
    });

    it('should parse a date from DD-MM-YY', () => {
        const date = parse('01-02-03', 'DD-MM-YY');
        assert.equal(date.getDate(), 1);
        assert.equal(date.getMonth(), 1);
        assert.equal(date.getFullYear(), 2003);
    });

    it('should parse a date from DD-MM-YYYY', () => {
        const date = parse('01-12-2003', 'DD-MM-YYYY');
        assert.equal(date.getDate(), 1);
        assert.equal(date.getMonth(), 11);
        assert.equal(date.getFullYear(), 2003);
    });
});
