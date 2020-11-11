import {assert} from 'chai';
import isFullInterval from 'Types/_entity/compare/isFullInterval';
import {Units as dateUnits} from 'Types/_entity/compare/dateDifference';

describe('Types/_entity/compare/isFullInterval', () => {
    it('should return true if interval is a full day', () => {
        const begin = new Date(2020, 0, 1, 0, 0);
        const end = new Date(2020, 0, 1, 23, 59);
        assert.isTrue(isFullInterval(begin, end, dateUnits.Day));
    });

    it('should return true if interval is a full 3 days', () => {
        const begin = new Date(2020, 0, 1, 0, 0);
        const end = new Date(2020, 0, 4, 23, 59);
        assert.isTrue(isFullInterval(begin, end, dateUnits.Day));
    });

    it('should return false if interval is less day', () => {
        const begin = new Date(2020, 0, 1, 0, 0);
        const end = new Date(2020, 0, 1, 22, 0);
        assert.isFalse(isFullInterval(begin, end, dateUnits.Day));
    });

    it('should return false if interval is more day but less 3 days', () => {
        const begin = new Date(2020, 0, 1, 0, 0);
        const end = new Date(2020, 0, 3, 1, 0);
        assert.isFalse(isFullInterval(begin, end, dateUnits.Day));
    });

    it('should return true if interval is a full month', () => {
        const begin = new Date('2020-01-01');
        const end = new Date('2020-01-31');
        assert.isTrue(isFullInterval(begin, end, dateUnits.Month));
    });

    it('should return false if interval is less month', () => {
        const begin = new Date('2020-01-01');
        const end = new Date('2020-01-05');
        assert.isFalse(isFullInterval(begin, end, dateUnits.Month));
    });

    it('should return false if interval is more month but less two month', () => {
        const begin = new Date('2020-01-01');
        const end = new Date('2020-02-05');
        assert.isFalse(isFullInterval(begin, end, dateUnits.Month));
    });

    it('should return true if interval is a full year', () => {
        const begin = new Date('2020-01-01');
        const end = new Date('2020-12-31');
        assert.isTrue(isFullInterval(begin, end, dateUnits.Year));
    });

    it('should return false if interval is more year', () => {
        const begin = new Date('2020-01-01');
        const end = new Date('2021-01-31');
        assert.isFalse(isFullInterval(begin, end, dateUnits.Year));
    });

    it('should return false if interval is less year', () => {
        const begin = new Date('2020-01-01');
        const end = new Date('2020-11-01');
        assert.isFalse(isFullInterval(begin, end, dateUnits.Year));
    });
});
