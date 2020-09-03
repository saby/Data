import {assert} from 'chai';
import {toEndOf} from 'Types/_transformation/date';
import dateUnit from 'Types/_entity/applied/dateUnit';

describe('Types/_transformation/date', () => {
    describe('toEndOf()', () => {
        it('should return another instance of Date', () => {
            const date = new Date();
            const result = toEndOf(date, dateUnit.Month);
            assert.notEqual(result, date);
        });

        it('shouldn\'t modify original instance of Date', () => {
            const date = new Date();
            const dateStamp = date.getTime();
            toEndOf(date, dateUnit.Month);
            assert.equal(date.getTime(), dateStamp);
        });

        it('should return valid end of December', () => {
            const date = new Date(2020, 11, 1);
            const result = toEndOf(date, dateUnit.Month);
            assert.strictEqual(result.getFullYear(), 2020);
            assert.strictEqual(result.getMonth(), 11);
            assert.strictEqual(result.getDate(), 31);
        });

        it('should return valid end of February in a regular year', () => {
            const date = new Date(2019, 1, 1);
            const result = toEndOf(date, dateUnit.Month);
            assert.strictEqual(result.getFullYear(), 2019);
            assert.strictEqual(result.getMonth(), 1);
            assert.strictEqual(result.getDate(), 28);
        });

        it('should return valid end of February in a leap year', () => {
            const date = new Date(2020, 1, 1);
            const result = toEndOf(date, dateUnit.Month);
            assert.strictEqual(result.getFullYear(), 2020);
            assert.strictEqual(result.getMonth(), 1);
            assert.strictEqual(result.getDate(), 29);
        });

        it('should throw an error if unit is not supported', () => {
            const date = new Date();
            assert.throws(() => {
                toEndOf(date, dateUnit.Year);
            });
        });
});
