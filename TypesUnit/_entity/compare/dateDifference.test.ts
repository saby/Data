import {assert} from 'chai';
import dateDifference, {Units} from 'Types/_entity/compare/dateDifference';

describe('Types/_entity/compare/dateDifference', () => {
    it('should return 0 for the same dates', () => {
        const date = new Date();
        assert.strictEqual(dateDifference(date, date), 0);
    });

    it('should return 0 for not a Date', () => {
        assert.strictEqual(dateDifference(0 as unknown as Date, null), 0);
    });

    it('should return milliseconds by default', () => {
        const dateA = new Date(2020, 0, 9, 0, 0, 0);
        const dateB = new Date(2020, 0, 9, 12, 0, 0);
        assert.strictEqual(dateDifference(dateA, dateB), 43200000);
    });

    it('should return difference in years', () => {
        const dateA = new Date(2019, 11, 31);
        const dateB = new Date(2020, 0, 1);
        assert.strictEqual(dateDifference(dateA, dateB, Units.Year), 1);
    });

    it('should return zero for same years', () => {
        const dateA = new Date(2020, 0, 1);
        const dateB = new Date(2020, 11, 1);
        assert.strictEqual(dateDifference(dateA, dateB, Units.Year), 0);
    });

    it('should return difference in months', () => {
        const dateA = new Date(2019, 10, 30);
        const dateB = new Date(2020, 0, 1);
        assert.strictEqual(dateDifference(dateA, dateB, Units.Month), 2);
    });

    it('should return zero for same months', () => {
        const dateA = new Date(2020, 0, 1);
        const dateB = new Date(2020, 0, 31);
        assert.strictEqual(dateDifference(dateA, dateB, Units.Month), 0);
    });

    it('should return difference in days', () => {
        const dateA = new Date(2019, 11, 31);
        const dateB = new Date(2020, 0, 1);
        assert.strictEqual(dateDifference(dateA, dateB, Units.Day), 1);
    });

    it('should return zero for same days', () => {
        const dateA = new Date(2020, 11, 20, 0);
        const dateB = new Date(2020, 11, 20, 1);
        assert.strictEqual(dateDifference(dateA, dateB, Units.Day), 0);
    });
});
