import {assert} from 'chai';
import dateInterval from 'Types/_entity/compare/dateInterval';
import {Units as dateUnits} from 'Types/_entity/compare/dateDifference';

describe('Types/_entity/compare/dateInterval', () => {
    it('should return 1 for the same dates if interval is a day', () => {
        const begin = new Date(2020, 0, 1, 0, 0);
        const end = new Date(2020, 0, 2, 0, 0);
        assert.strictEqual(dateInterval(begin, end, dateUnits.Day), 1);
    });

    it('should return 0 for the same dates if interval is a day', () => {
        const begin = new Date(2020, 0, 1, 0, 0);
        const end = new Date(2020, 0, 1, 22, 0);
        assert.strictEqual(dateInterval(begin, end, dateUnits.Day), 0);
    });

    it('should return 3 for the same dates if interval is a day', () => {
        const begin = new Date(2020, 0, 1, 0, 0);
        const end = new Date(2020, 0, 4, 0, 0);
        assert.strictEqual(dateInterval(begin, end, dateUnits.Day), 3);
    });

    it('should return 0 for the same dates if interval is a month', () => {
        const date = new Date();
        assert.strictEqual(dateInterval(date, date, dateUnits.Month), 0);
    });

    it('should return 1 if interval is a full month', () => {
        const begin = new Date('2020-01-01');
        const end = new Date('2020-01-31');
        assert.strictEqual(dateInterval(begin, end, dateUnits.Month), 1);
    });

    it('should return 2 if interval is more month but less two month', () => {
        const begin = new Date('2020-01-01');
        const end = new Date('2020-03-05');
        assert.strictEqual(dateInterval(begin, end, dateUnits.Month), 2);
    });

    it('should return 0 if interval is less month', () => {
        const begin = new Date('2020-01-01');
        const end = new Date('2020-01-05');
        assert.strictEqual(dateInterval(begin, end, dateUnits.Month), 0);
    });

    it('should return 1 if interval is a full year', () => {
        const begin = new Date('2020-01-01');
        const end = new Date('2020-12-31');
        assert.strictEqual(dateInterval(begin, end, dateUnits.Year), 1);
    });
});
